from fastapi import APIRouter

router = APIRouter()

# Covers the "entities" component

router = APIRouter(
    prefix="/instruments",
    tags=["instruments"],
    responses={404: {"description": "Not found"}},
)

@router.get("")
def get_instruments():
    return {}

@router.get("/{instrument_id}")
def get_instrument(instrument_id: int):
    return {}

@router.post("/{instrument_id}")
def update_instrument(instrument_id: int):
    return {}
