from sqlalchemy.orm import Session

class UnitOfWork:
    """
    UnitOfWork coordinates transaction boundaries and database session operations.
    """
    def __init__(self, session: Session):
        self.session = session

    def commit(self):
        if self.session:
            self.session.commit()

    def rollback(self):
        if self.session:
            self.session.rollback()

    def flush(self):
        if self.session:
            self.session.flush()

    def refresh(self, obj):
        if self.session:
            self.session.refresh(obj)

    def close(self):
        if self.session:
            self.session.close()
