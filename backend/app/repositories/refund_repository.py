from sqlalchemy.orm import Session
from app.models.refund import Refund

class RefundRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, refund_id: int):
        return self.db.query(Refund).filter(Refund.id == refund_id).first()

    def get_by_payment_id(self, payment_id: int):
        return self.db.query(Refund).filter(Refund.payment_id == payment_id).all()

    def create(self, refund: Refund):
        self.db.add(refund)
        self.db.flush()
        return refund

    def get_total_refunded_for_payment(self, payment_id: int) -> float:
        from app.models.enums import RefundStatus
        from sqlalchemy.sql import func
        result = self.db.query(func.sum(Refund.amount)).filter(
            Refund.payment_id == payment_id,
            Refund.status.in_([RefundStatus.APPROVED, RefundStatus.PROCESSING, RefundStatus.COMPLETED])
        ).scalar()
        return result or 0.0

    def get_total_requested_and_refunded_for_payment(self, payment_id: int) -> float:
        from app.models.enums import RefundStatus
        from sqlalchemy.sql import func
        result = self.db.query(func.sum(Refund.amount)).filter(
            Refund.payment_id == payment_id,
            Refund.status.in_([RefundStatus.PENDING, RefundStatus.APPROVED, RefundStatus.PROCESSING, RefundStatus.COMPLETED])
        ).scalar()
        return result or 0.0

    def get_total_completed_refunds_for_payment(self, payment_id: int) -> float:
        from app.models.enums import RefundStatus
        from sqlalchemy.sql import func
        result = self.db.query(func.sum(Refund.amount)).filter(
            Refund.payment_id == payment_id,
            Refund.status == RefundStatus.COMPLETED
        ).scalar()
        return result or 0.0
