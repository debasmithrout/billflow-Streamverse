from sqlalchemy.orm import Session
from typing import List, Optional
from app import models

def get_plan_by_name(db: Session, name: str) -> Optional[models.Plan]:
    return db.query(models.Plan).filter(models.Plan.name == name).first()

def create_plan_record(db: Session, plan_data: dict) -> models.Plan:
    new_plan = models.Plan(**plan_data)
    db.add(new_plan)
    db.flush()
    return new_plan

def get_active_plans(db: Session) -> List[models.Plan]:
    return db.query(models.Plan).filter(models.Plan.is_archived == False).all()

def get_plan_by_id(db: Session, plan_id: int) -> Optional[models.Plan]:
    return db.query(models.Plan).filter(models.Plan.id == plan_id).first()

def get_plan_by_name_excluding_id(db: Session, name: str, plan_id: int) -> Optional[models.Plan]:
    return db.query(models.Plan).filter(
        models.Plan.name == name,
        models.Plan.id != plan_id
    ).first()
