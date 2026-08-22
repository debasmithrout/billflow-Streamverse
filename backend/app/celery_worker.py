from celery import Celery
from celery.schedules import crontab
from app.core.config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND, CELERY_TIMEZONE

celery_app = Celery(
    "billflow",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=[
        "app.tasks",
        "app.email_tasks",
    ],
)

celery_app.conf.update(
    timezone=CELERY_TIMEZONE,
    enable_utc=False,
    broker_transport_options={
        "client_kwargs": {"protocol": 2}
    },
    result_backend_transport_options={
        "client_kwargs": {"protocol": 2}
    },
)

# Celery Beat Schedule
celery_app.conf.beat_schedule = {
    "check-subscription-renewals": {
        "task": "app.tasks.check_due_subscriptions",
        "schedule": 60.0,      # Every 60 seconds (for demo)
    },
    "send-trial-expiry-reminders": {
        "task": "app.tasks.send_trial_expiry_reminders",
        "schedule": 60.0,      # Check every 60 seconds
    },
    "process-failed-payment-retries": {
        "task": "app.tasks.process_failed_payment_retries",
        "schedule": 1800.0,    # Every 30 minutes
    },
}

import logging
from kombu.exceptions import OperationalError as KombuOperationalError
from redis.exceptions import ConnectionError as RedisConnectionError

logger = logging.getLogger("billflow.celery")

def safe_task_delay(task, *args, **kwargs):
    """
    Safely trigger a Celery task asynchronously using delay().
    If the Celery broker (Redis) is down, it catches broker-related connection
    errors, logs the event, and returns None, allowing the database transaction
    and user API request to complete consistently.
    """
    try:
        return task.delay(*args, **kwargs)
    except (KombuOperationalError, RedisConnectionError, ConnectionRefusedError) as e:
        logger.error(
            f"Broker Connection Error: Celery task '{task.name}' could not be queued. "
            f"Error details: {e}"
        )
        return None