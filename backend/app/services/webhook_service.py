import json
import uuid
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app import models
from app.core import exceptions

logger = logging.getLogger("billflow.webhooks")
logger.setLevel(logging.INFO)

def dispatch_webhook_event(db: Session, event_type: str, payload_dict: dict):
    """
    Creates and stores a new webhook log event in the database.
    """
    event_id = f"evt_{uuid.uuid4().hex[:16]}"
    created_at_iso = datetime.utcnow().isoformat() + "Z"
    
    full_payload = {
        "event_id": event_id,
        "event_type": event_type,
        "created_at": created_at_iso,
        "data": payload_dict
    }

    try:
        log_entry = models.WebhookLog(
            event_id=event_id,
            event_type=event_type,
            status="PENDING",
            payload=full_payload,
            created_at=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        logger.info(f"Webhook event dispatched & stored: {event_id} ({event_type})")
        
        # Trigger Celery task for actual delivery
        from app.celery_worker import safe_task_delay
        from app.tasks import deliver_webhook_task
        safe_task_delay(deliver_webhook_task, event_id)
        
        return log_entry
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to log webhook event {event_type}: {e}", exc_info=True)
        return None

def get_webhook_logs(db: Session, limit: int = 50, event_type: str = None):
    """
    Queries stored webhook logs for admin audit.
    """
    query = db.query(models.WebhookLog)
    if event_type:
        query = query.filter(models.WebhookLog.event_type == event_type)
    
    logs = query.order_by(models.WebhookLog.created_at.desc()).limit(limit).all()
    return logs

def replay_webhook_event(db: Session, event_id: str):
    """
    Replays an existing webhook event by updating its status to PENDING and requeuing delivery.
    """
    log_entry = db.query(models.WebhookLog).filter(models.WebhookLog.event_id == event_id).first()
    if not log_entry:
        raise exceptions.ResourceNotFound(f"Webhook event '{event_id}' not found")
        
    log_entry.status = "PENDING"
    log_entry.retry_count = 0
    log_entry.last_attempt_at = None
    
    # Audit log
    from app.services.audit_service import log_audit_event
    log_audit_event(
        db,
        "Webhook Replayed",
        f"Webhook event {event_id} ({log_entry.event_type}) was manually replayed.",
        customer_id=None
    )
    
    db.commit()
    db.refresh(log_entry)
    
    # Requeue delivery
    from app.celery_worker import safe_task_delay
    from app.tasks import deliver_webhook_task
    safe_task_delay(deliver_webhook_task, event_id)
    
    logger.info(f"Webhook event replayed and requeued successfully: {event_id}")
    return {
        "event_id": log_entry.event_id,
        "event_type": log_entry.event_type,
        "status": "PENDING",
        "message": "Webhook event replayed and requeued successfully",
        "payload": log_entry.payload
    }
