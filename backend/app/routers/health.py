from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def read_root():
    return {"message": "Welcome to StreamVerse Billing Engine API!"}
