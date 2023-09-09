from fastapi import APIRouter

router = APIRouter()

# Covers the "entities" component

router = APIRouter(
    prefix="/price-values",
    tags=["instruments"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{instrument_id}}")
def get_price_values(instrument_id: int):
    return {}