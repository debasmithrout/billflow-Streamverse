from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app import models
from app.models.enums import RetryStatus


def create_retry_entry(db: Session, retry_data: dict) -> models.RetryQueue:
    entry = models.RetryQueue(**retry_data)
    db.add(entry)
    db.flush()
    return entry


def get_retry_entry_by_id(db: Session, retry_id: int) -> Optional[models.RetryQueue]:
    return db.query(models.RetryQueue).filter(models.RetryQueue.id == retry_id).first()


def get_pending_retry_entries(db: Session) -> List[models.RetryQueue]:
    return db.query(models.RetryQueue).filter(
        models.RetryQueue.retry_status == RetryStatus.PENDING,
        models.RetryQueue.scheduled_retry_date <= datetime.utcnow()
    ).all()


def get_all_retry_entries(db: Session, limit: int = 100) -> List[models.RetryQueue]:
    return db.query(models.RetryQueue).order_by(models.RetryQueue.created_at.desc()).limit(limit).all()


def get_retry_history(db: Session, limit: int = 100) -> List[models.RetryQueue]:
    return db.query(models.RetryQueue).filter(
        models.RetryQueue.retry_status.in_([RetryStatus.SUCCESS, RetryStatus.FAILED])
    ).order_by(models.RetryQueue.updated_at.desc()).limit(limit).all()


def update_retry_entry(db: Session, retry_id: int, update_data: dict) -> Optional[models.RetryQueue]:
    entry = get_retry_entry_by_id(db, retry_id)
    if entry:
        for k, v in update_data.items():
            setattr(entry, k, v)
        db.flush()
    return entry


def get_retry_configuration(db: Session, attempt: int) -> Optional[models.RetryConfiguration]:
    # Lazy seed if table is empty
    count = db.query(models.RetryConfiguration).count()
    if count == 0:
        for att, days in [(1, 1), (2, 3), (3, 7)]:
            cfg = models.RetryConfiguration(retry_attempt=att, retry_after_days=days, is_active=True)
            db.add(cfg)
        db.commit()

    return db.query(models.RetryConfiguration).filter(
        models.RetryConfiguration.retry_attempt == attempt,
        models.RetryConfiguration.is_active == True
    ).first()


def get_max_retry_attempts(db: Session) -> int:
    get_retry_configuration(db, 1)
    res = db.query(models.RetryConfiguration).filter(models.RetryConfiguration.is_active == True).all()
    if not res:
        return 3
    return max([r.retry_attempt for r in res])
