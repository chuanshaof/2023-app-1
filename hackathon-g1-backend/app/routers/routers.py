from fastapi import APIRouter

router = APIRouter()

router = APIRouter(
    prefix="/routers",
    tags=["routers"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
def read_root():
    return {"Hello": "World"}
