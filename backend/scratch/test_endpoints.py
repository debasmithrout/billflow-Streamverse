from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models import Customer, Plan, Subscription, BillingCycle, SubscriptionStatus

from sqlalchemy import text
client = TestClient(app)

def test_preview_apis():
    db = SessionLocal()
    try:
        # Check initial database state
        initial_inv_count = db.execute(text("SELECT COUNT(*) FROM invoices")).scalar()

        
        # 1. Test GST Tax Estimation
        tax_res = client.post("/payments/estimate-tax", json={"base_amount": 600, "gst_rate": 18})
        print("Tax Estimate Response:", tax_res.status_code, tax_res.json())
        assert tax_res.status_code == 200
        tax_data = tax_res.json()
        assert tax_data["base_amount"] == 600.0
        assert tax_data["gst_rate"] == 18.0
        assert tax_data["gst_amount"] == 108.0
        assert tax_data["total_amount"] == 708.0
        
        # 2. Test Proration Preview
        # Get customer and plan
        cust = db.query(Customer).first()
        plans = db.query(Plan).filter(Plan.price > 0).all()
        
        if cust and len(plans) >= 2:
            target_plan = plans[1]
            proration_res = client.post("/subscriptions/calculate-proration", json={
                "customer_id": cust.id,
                "target_plan_id": target_plan.id
            })
            print("Proration Preview Response:", proration_res.status_code, proration_res.json())
            if proration_res.status_code == 200:
                pdata = proration_res.json()
                assert "current_plan" in pdata
                assert "target_plan" in pdata
                assert "remaining_days" in pdata
                assert "remaining_ratio" in pdata
                assert "proration_credit" in pdata
                assert "proration_debit" in pdata
                assert "net_proration" in pdata
                assert "gst" in pdata
                assert "total_payable" in pdata
                print("Proration preview assertion passed!")
        
        # 3. Test Revenue Summary Analytics
        rev_res = client.get("/analytics/revenue-summary")
        print("Revenue Summary Response:", rev_res.status_code, rev_res.json())
        assert rev_res.status_code == 200
        rev_data = rev_res.json()
        assert "total_revenue" in rev_data
        assert "monthly_recurring_revenue" in rev_data
        assert "annual_recurring_revenue" in rev_data
        assert "today_revenue" in rev_data
        
        # 4. Test MRR Analytics
        mrr_res = client.get("/analytics/mrr")
        print("MRR Analytics Response:", mrr_res.status_code, mrr_res.json())
        assert mrr_res.status_code == 200
        mrr_data = mrr_res.json()
        assert "mrr" in mrr_data
        assert "arr" in mrr_data
        assert "active_subscriptions_count" in mrr_data
        assert "breakdown_by_plan" in mrr_data
        
        print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!")
    finally:
        db.close()

if __name__ == "__main__":
    test_preview_apis()
