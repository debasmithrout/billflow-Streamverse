from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limiter import limiter

from app.core.database import engine, Base
from app.routers import (
    health,
    auth,
    plans,
    customers,
    subscriptions,
    invoices,
    payments,
    billing,
    audit_logs,
    admin,
    webhooks,
    payment_methods,
    refunds,
    retries,
    taxes,
    currency,
    movies,
    series,
    seasons,
    episodes,
    media
)



from app.core.exception_handlers import register_exception_handlers

app = FastAPI(
    title="StreamVerse: Billing Automation Engine",
    description="Infosys Virtual Internship Project - Module 1",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from slowapi.middleware import SlowAPIMiddleware
app.add_middleware(SlowAPIMiddleware)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Mount local uploads directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
for cat in ["movies", "series", "episodes", "trailers", "posters", "banners", "thumbnails", "subtitles"]:
    os.makedirs(os.path.join(UPLOAD_DIR, cat), exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def startup_db_init():
    Base.metadata.create_all(bind=engine)
    
    # Seeding Normalized Catalog Plans
    from app.core.database import SessionLocal
    from app.models.plan import Plan
    from app.models.enums import BillingInterval
    
    db = SessionLocal()
    try:
        target_plans = [
            {
                "name": "Free Trial",
                "description": "7-Day Free Trial",
                "price": 0.0,
                "trial_period_days": 7,
                "billing_interval": BillingInterval.MONTHLY,
                "features": "4K Ultra HD, HDR Streaming, 4 Screens, Unlimited Movies & Series, Downloads, Ad Free",
                "is_archived": False
            },
            {
                "name": "Basic",
                "description": "Basic streaming plan (Ad-supported)",
                "price": 99.0,
                "trial_period_days": 0,
                "billing_interval": BillingInterval.MONTHLY,
                "features": "HD Streaming, 1 Screen",
                "is_archived": False
            },
            {
                "name": "Standard",
                "description": "Standard streaming plan",
                "price": 199.0,
                "trial_period_days": 0,
                "billing_interval": BillingInterval.MONTHLY,
                "features": "Full HD, 2 Screens",
                "is_archived": False
            },
            {
                "name": "Premium",
                "description": "Premium streaming plan",
                "price": 299.0,
                "trial_period_days": 0,
                "billing_interval": BillingInterval.MONTHLY,
                "features": "4K Ultra HD, 4 Screens",
                "is_archived": False
            },
            {
                "name": "Family",
                "description": "Family streaming plan",
                "price": 499.0,
                "trial_period_days": 0,
                "billing_interval": BillingInterval.MONTHLY,
                "features": "4K Ultra HD, 6 Screens, Ad Free",
                "is_archived": False
            }
        ]
        
        target_names = [p["name"] for p in target_plans]
        
        # 1. Archive other plans that are not in target_names
        other_plans = db.query(Plan).filter(Plan.name.notin_(target_names)).all()
        for plan in other_plans:
            if not plan.is_archived:
                plan.is_archived = True
                
        # 2. Add / Update Target Plans
        for plan_data in target_plans:
            existing = db.query(Plan).filter(Plan.name == plan_data["name"]).first()
            if existing:
                existing.description = plan_data["description"]
                existing.price = plan_data["price"]
                existing.trial_period_days = plan_data["trial_period_days"]
                existing.billing_interval = plan_data["billing_interval"]
                existing.features = plan_data["features"]
                existing.is_archived = plan_data["is_archived"]
            else:
                new_plan = Plan(**plan_data)
                db.add(new_plan)
                
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding normalized plans: {e}")
    finally:
        db.close()


# Include Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(plans.router)
app.include_router(customers.router)
app.include_router(subscriptions.router)
app.include_router(invoices.router)
app.include_router(payments.router)
app.include_router(billing.router)
app.include_router(audit_logs.router)
app.include_router(admin.router)
app.include_router(webhooks.router)
app.include_router(refunds.router)
app.include_router(payment_methods.router)
app.include_router(retries.router)
app.include_router(taxes.router)
app.include_router(currency.router)
app.include_router(movies.router)
app.include_router(series.router)
app.include_router(seasons.router)
app.include_router(episodes.router)
app.include_router(media.router)