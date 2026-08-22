import logging
from fastapi import Request
from slowapi import Limiter
from app.core import config

logger = logging.getLogger("billflow.rate_limiter")

def rate_limit_key_func(request: Request) -> str:
    """
    Generate rate limiting key.
    Uses the authenticated user email if a valid Bearer token is provided.
    Falls back to the client IP address.
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            from app.core.security import decode_access_token
            payload = decode_access_token(token)
            if payload:
                email = payload.get("sub")
                if email:
                    return f"user:{email}"
        except Exception:
            pass

    # Fallback to client IP
    client_ip = "127.0.0.1"
    if request.client:
        client_ip = request.client.host
        
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            client_ip = real_ip.strip()
            
    return f"ip:{client_ip}"

# Initialize Limiter with Redis backend
# We set in_memory_fallback_enabled=False to avoid silent memory fallback.
# We set swallow_errors=True to fail gracefully if Redis is unavailable.
redis_url = getattr(config, "CELERY_BROKER_URL", "redis://localhost:6379/0")

# slowapi expects a redis://... connection string. Let's make sure it starts with redis:// or rediss://.
if not redis_url.startswith("redis://") and not redis_url.startswith("rediss://"):
    redis_url = "redis://localhost:6379/0"

limiter = Limiter(
    key_func=rate_limit_key_func,
    storage_uri=redis_url,
    in_memory_fallback_enabled=True,
    swallow_errors=True,
    headers_enabled=False
)
