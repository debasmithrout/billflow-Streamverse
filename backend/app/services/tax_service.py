from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app import models, schemas
from app.repositories import tax_repository
from app.core import exceptions
from app.database.unit_of_work import UnitOfWork
from app.services.audit_service import log_audit_event


class TaxService:
    @staticmethod
    def create_tax(db: Session, tax_in: schemas.TaxMasterCreate) -> models.TaxMaster:
        from app.core.regions import REGIONS
        uow = UnitOfWork(db)
        
        # Validate country code using RegionService definition
        if not tax_in.country or tax_in.country.strip().upper() not in REGIONS:
            raise exceptions.ValidationFailed(f"Invalid country code: {tax_in.country}")
            
        # Check for duplicate active tax rule for the same country and tax region/code
        duplicate = (
            uow.session.query(models.TaxMaster)
            .filter(
                models.TaxMaster.country == tax_in.country,
                models.TaxMaster.tax_code == tax_in.tax_code,
                models.TaxMaster.is_active == True
            )
            .first()
        )
        if duplicate:
            raise exceptions.ValidationFailed(f"Active duplicate tax rule already exists for country {tax_in.country} and tax code {tax_in.tax_code}")

        tax_data = tax_in.model_dump()
        tax = tax_repository.create_tax(uow.session, tax_data)
        
        log_audit_event(
            uow.session,
            "Tax Rule Created",
            f"Tax rule {tax.tax_name} ({tax.tax_code}) for country {tax.country} created."
        )
        
        uow.commit()
        return tax

    @staticmethod
    def update_tax(db: Session, tax_id: int, tax_update: schemas.TaxMasterUpdate) -> models.TaxMaster:
        from app.core.regions import REGIONS
        uow = UnitOfWork(db)
        tax = tax_repository.get_tax_by_id(uow.session, tax_id)
        if not tax:
            raise exceptions.ResourceNotFound("Tax rule not found")
            
        if tax_update.country is not None:
            if not tax_update.country or tax_update.country.strip().upper() not in REGIONS:
                raise exceptions.ValidationFailed(f"Invalid country code: {tax_update.country}")
                
        new_country = tax_update.country if tax_update.country is not None else tax.country
        new_code = tax_update.tax_code if tax_update.tax_code is not None else tax.tax_code
        new_active = tax_update.is_active if tax_update.is_active is not None else tax.is_active
        
        if new_active:
            duplicate = (
                uow.session.query(models.TaxMaster)
                .filter(
                    models.TaxMaster.country == new_country,
                    models.TaxMaster.tax_code == new_code,
                    models.TaxMaster.is_active == True,
                    models.TaxMaster.id != tax_id
                )
                .first()
            )
            if duplicate:
                raise exceptions.ValidationFailed(f"Active duplicate tax rule already exists for country {new_country} and tax code {new_code}")

        update_dict = tax_update.model_dump(exclude_unset=True)
        updated_tax = tax_repository.update_tax(uow.session, tax_id, update_dict)
        
        log_audit_event(
            uow.session,
            "Tax Rule Updated",
            f"Tax rule {tax.tax_name} ({tax.tax_code}) updated."
        )
        
        uow.commit()
        return updated_tax

    @staticmethod
    def activate_tax(db: Session, tax_id: int) -> models.TaxMaster:
        uow = UnitOfWork(db)
        tax = tax_repository.get_tax_by_id(uow.session, tax_id)
        if not tax:
            raise exceptions.ResourceNotFound("Tax rule not found")
            
        updated_tax = tax_repository.update_tax(uow.session, tax_id, {"is_active": True})
        
        log_audit_event(
            uow.session,
            "Tax Rule Activated",
            f"Tax rule {tax.tax_name} ({tax.tax_code}) activated."
        )
        
        uow.commit()
        return updated_tax

    @staticmethod
    def deactivate_tax(db: Session, tax_id: int) -> models.TaxMaster:
        uow = UnitOfWork(db)
        tax = tax_repository.get_tax_by_id(uow.session, tax_id)
        if not tax:
            raise exceptions.ResourceNotFound("Tax rule not found")
            
        updated_tax = tax_repository.update_tax(uow.session, tax_id, {"is_active": False})
        
        log_audit_event(
            uow.session,
            "Tax Rule Deactivated",
            f"Tax rule {tax.tax_name} ({tax.tax_code}) deactivated."
        )
        
        uow.commit()
        return updated_tax

    @staticmethod
    def delete_tax(db: Session, tax_id: int) -> bool:
        uow = UnitOfWork(db)
        tax = tax_repository.get_tax_by_id(uow.session, tax_id)
        if not tax:
            raise exceptions.ResourceNotFound("Tax rule not found")
            
        success = tax_repository.delete_tax(uow.session, tax_id)
        if success:
            log_audit_event(
                uow.session,
                "Tax Rule Deleted",
                f"Tax rule {tax.tax_name} ({tax.tax_code}) deleted."
            )
            uow.commit()
            return True
        return False

    @staticmethod
    def fetch_active_taxes(db: Session) -> List[models.TaxMaster]:
        uow = UnitOfWork(db)
        return tax_repository.get_active_taxes(uow.session)

    @staticmethod
    def calculate_tax(
        db: Session, 
        base_amount: float, 
        country: str, 
        state: Optional[str] = None,
        country_code: Optional[str] = None,
        tax_region: Optional[str] = None,
        tax_exempt: Optional[bool] = False
    ) -> dict:
        if tax_exempt:
            return {
                "base_amount": round(base_amount, 2),
                "tax_amount": 0.0,
                "total_amount": round(base_amount, 2),
                "tax_percentage": 0.0,
                "tax_name": "Tax Exempt",
                "tax_code": "EXEMPT"
            }

        uow = UnitOfWork(db)
        
        query = uow.session.query(models.TaxMaster).filter(models.TaxMaster.is_active == True)
        
        now = datetime.utcnow()
        query = query.filter(
            models.TaxMaster.effective_from <= now,
            (models.TaxMaster.effective_to.is_(None) | (models.TaxMaster.effective_to >= now))
        )
        
        selected_rule = None
        
        # Search by country_code first
        c_code = country_code.strip().upper() if country_code else ""
        t_reg = tax_region.strip().upper() if tax_region else ""
        
        if c_code and t_reg:
            selected_rule = query.filter(
                models.TaxMaster.country == c_code,
                models.TaxMaster.tax_code == t_reg
            ).first()
            
        if not selected_rule and c_code:
            selected_rule = query.filter(
                models.TaxMaster.country == c_code
            ).first()

        if not selected_rule and country:
            # Fallback to country name/code matching
            selected_rule = query.filter(
                models.TaxMaster.country.ilike(country) | models.TaxMaster.country.ilike(c_code)
            ).first()

        if selected_rule:
            if selected_rule.reverse_charge:
                return {
                    "base_amount": round(base_amount, 2),
                    "tax_amount": 0.0,
                    "total_amount": round(base_amount, 2),
                    "tax_percentage": 0.0,
                    "tax_name": "Reverse Charge",
                    "tax_code": "REVERSE_CHARGE"
                }
            tax_rate = selected_rule.tax_percentage
            tax_name = selected_rule.tax_name
            tax_code = selected_rule.tax_code
        else:
            tax_rate = 0.0
            tax_name = "No Tax"
            tax_code = "NO_TAX"

        tax_amount = round(base_amount * (tax_rate / 100.0), 2)
        total_amount = round(base_amount + tax_amount, 2)

        return {
            "base_amount": round(base_amount, 2),
            "tax_amount": tax_amount,
            "total_amount": total_amount,
            "tax_percentage": tax_rate,
            "tax_name": tax_name,
            "tax_code": tax_code
        }
