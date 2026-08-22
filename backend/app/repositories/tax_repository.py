from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app import models


def create_tax(db: Session, tax_data: dict) -> models.TaxMaster:
    tax = models.TaxMaster(**tax_data)
    db.add(tax)
    db.flush()
    return tax


def get_tax_by_id(db: Session, tax_id: int) -> Optional[models.TaxMaster]:
    return db.query(models.TaxMaster).filter(models.TaxMaster.id == tax_id).first()


def list_taxes(db: Session, limit: int = 100) -> List[models.TaxMaster]:
    return db.query(models.TaxMaster).order_by(models.TaxMaster.created_at.desc()).limit(limit).all()


def get_active_taxes(db: Session) -> List[models.TaxMaster]:
    now = datetime.utcnow()
    return db.query(models.TaxMaster).filter(
        models.TaxMaster.is_active == True,
        models.TaxMaster.effective_from <= now,
        (models.TaxMaster.effective_to.is_(None) | (models.TaxMaster.effective_to >= now))
    ).all()


def update_tax(db: Session, tax_id: int, update_data: dict) -> Optional[models.TaxMaster]:
    tax = get_tax_by_id(db, tax_id)
    if tax:
        for k, v in update_data.items():
            setattr(tax, k, v)
        db.flush()
    return tax


def delete_tax(db: Session, tax_id: int) -> bool:
    tax = get_tax_by_id(db, tax_id)
    if tax:
        db.delete(tax)
        db.flush()
        return True
    return False
