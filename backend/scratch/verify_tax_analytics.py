from app.core.database import SessionLocal
from app.services.billing_service import get_tax_analytics

db = SessionLocal()
try:
    res = get_tax_analytics(db)
    print("SUCCESS")
    print("KPIs:", res["kpis"])
    print("Trend points count:", len(res["trend"]))
    print("Country breakdown count:", len(res["country_breakdown"]))
    print("Plan breakdown count:", len(res["plan_breakdown"]))
    print("Payment method breakdown count:", len(res["payment_method_breakdown"]))
except Exception as e:
    import traceback
    print("ERROR:", e)
    traceback.print_exc()
finally:
    db.close()
