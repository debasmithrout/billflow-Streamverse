from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app import models, schemas
from app.auth import admin_required
from app.services import payment_service
from app.core.rate_limiter import limiter

router = APIRouter(
    tags=["Admin Dashboard"]
)


@router.get("/admin/payments")
def admin_payments(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required),
    search: Optional[str] = None,
    status: Optional[str] = None,
    paymentMethod: Optional[str] = None,
    page: int = 1,
    limit: int = 5
):
    return payment_service.get_admin_payments(db, search, status, paymentMethod, page, limit)


@router.get("/admin/payments/{payment_id}")
def admin_payment_by_id(
    payment_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    res = payment_service.get_admin_payment_by_id(db, payment_id)
    if not res:
        raise HTTPException(status_code=404, detail="Payment not found")
    return res


from app.auth import get_current_user
from pydantic import BaseModel


class MockPaymentCompleteRequest(BaseModel):
    payment_id: int
    result: str
    payment_method_id: Optional[int] = None


@router.post("/payments/mock/complete")
@limiter.limit("10/minute")
def complete_mock_payment_endpoint(
    request: Request,
    response: Response,
    req: MockPaymentCompleteRequest,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    if req.result not in ["SUCCESS", "FAILED", "CANCELLED"]:
        raise HTTPException(status_code=400, detail="Invalid result value. Must be SUCCESS, FAILED, or CANCELLED.")
        
    payment = payment_service.complete_mock_payment(db, req.payment_id, req.result, current_user, req.payment_method_id)
    
    inv_num = payment.invoice.invoice_number if payment.invoice else None
    inv_amt = payment.amount

    return {
        "payment_id": payment.id,
        "transaction_id": payment.transaction_id,
        "status": payment.status.value if hasattr(payment.status, 'value') else str(payment.status),
        "payment_method_id": payment.payment_method_id,
        "invoice_number": inv_num,
        "amount": inv_amt
    }


@router.post(
    "/payments/estimate-tax",
    response_model=schemas.TaxEstimateResponse,
    summary="Estimate GST Tax",
    description="Estimate GST before payment. Reuses the GST calculation engine. Does NOT create invoices, payments, or write to database.",
    status_code=status.HTTP_200_OK,
    tags=["Payments & Tax"],
    responses={
        200: {
            "description": "GST tax estimate computed successfully",
            "content": {
                "application/json": {
                    "example": {
                        "base_amount": 600.0,
                        "gst_rate": 18.0,
                        "gst_amount": 108.0,
                        "total_amount": 708.0
                    }
                }
            }
        },
        422: {"description": "Validation error for invalid base_amount or gst_rate"}
    }
)
def estimate_tax_endpoint(request: schemas.TaxEstimateRequest):
    return payment_service.estimate_tax(
        base_amount=request.base_amount,
        gst_rate=request.gst_rate
    )

