# BillFlow FastAPI application package
try:
    import redis

    # Force RESP2 on ConnectionPool
    original_pool_init = redis.ConnectionPool.__init__
    def new_pool_init(self, *args, **kwargs):
        kwargs["protocol"] = 2
        original_pool_init(self, *args, **kwargs)
    redis.ConnectionPool.__init__ = new_pool_init

    # Force RESP2 on Redis client
    original_redis_init = redis.Redis.__init__
    def new_redis_init(self, *args, **kwargs):
        kwargs["protocol"] = 2
        original_redis_init(self, *args, **kwargs)
    redis.Redis.__init__ = new_redis_init

    # NOTE: Do NOT patch redis.connection.Connection.__init__ here.
    # Injecting unknown kwargs (maint_notifications_pool_handler) into
    # AbstractConnection.__init__ causes a TypeError that crashes Celery workers.
except Exception:
    pass
