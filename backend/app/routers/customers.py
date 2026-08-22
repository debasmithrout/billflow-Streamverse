from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app import models, schemas
from app.auth import get_current_user, admin_required, customer_required
from app.services import customer_service
from app.core.rate_limiter import limiter

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


@router.post("/", response_model=schemas.CustomerResponse)
def create_customer(
    customer: schemas.CustomerCreate,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return customer_service.admin_create_customer(db, customer)


@router.get("/", response_model=List[schemas.CustomerResponse])
def view_customers(
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return customer_service.view_customers(db)


@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(get_current_user)
):
    return customer_service.get_customer_profile(db, customer_id, current_user)


@router.get("/{customer_id}/timeline", tags=["Admin Dashboard"])
def customer_billing_timeline(
    customer_id: int,
    db: Session = Depends(get_db),
    admin: models.Customer = Depends(admin_required)
):
    return customer_service.get_customer_timeline(db, customer_id)


@router.delete("/me")
def delete_own_account(
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(customer_required)
):
    customer_service.delete_customer_account(db, current_user.id)
    return {"message": "Account deleted successfully"}

@router.get("/me/invoices", response_model=List[schemas.InvoiceResponse])
@limiter.limit("60/minute")
def get_own_invoices(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(customer_required)
):
    return customer_service.get_customer_invoices(db, current_user.id)


@router.get("/me/invoices/{invoice_id}/pdf")
@limiter.limit("20/minute")
def get_invoice_pdf(
    invoice_id: int,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(customer_required)
):
    from fastapi.responses import Response as FastAPIResponse
    pdf_content = customer_service.generate_invoice_pdf(db, invoice_id, current_user.id)
    return FastAPIResponse(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=StreamVerse-INV-{invoice_id}.pdf"
        }
    )
from pydantic import BaseModel

class CustomerRetryTriggerRequest(BaseModel):
    result: str = "SUCCESS"


@router.post("/me/retries/{retry_id}/retry", response_model=schemas.RetryQueueResponse)
def customer_trigger_retry(
    retry_id: int,
    req: CustomerRetryTriggerRequest,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(customer_required)
):
    """
    Simulate customer retrying their own failed payment using RetryService.
    """
    from app.services.retry_service import RetryService
    from fastapi import HTTPException
    
    retry_entry = db.query(models.RetryQueue).filter(models.RetryQueue.id == retry_id).first()
    if not retry_entry:
        raise HTTPException(status_code=404, detail="Retry entry not found")
        
    if retry_entry.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this retry entry")
        
    res_val = req.result
    if res_val not in ["SUCCESS", "FAILED"]:
        raise HTTPException(status_code=400, detail="Invalid result value. Must be SUCCESS or FAILED.")
        
    try:
        res = RetryService.trigger_retry(db, retry_id, res_val)
        db.commit()
        return RetryService.get_retry_by_id(db, res.id)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me/retries/by-payment/{payment_id}", response_model=Optional[schemas.RetryQueueResponse])
def get_customer_retry_by_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: models.Customer = Depends(customer_required)
):
    """
    Get active retry entry for a payment belonging to the customer.
    """
    retry_entry = db.query(models.RetryQueue).filter(
        models.RetryQueue.payment_id == payment_id,
        models.RetryQueue.customer_id == current_user.id
    ).first()
    
    return retry_entry



