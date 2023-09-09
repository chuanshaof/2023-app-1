from fastapi import APIRouter

router = APIRouter()

# Covers the "positions" component

router = APIRouter(
    prefix="/funds",
    tags=["funds"],
    responses={404: {"description": "Not found"}},
)

@router.post("/{fund_id}/refresh")
def refresh_fund(fund_id: int):
    return {}

@router.get("/{fund_id}/instruments/{instrument_id}")
def get_instrument_fund_position(fund_id: int, instrument_id: int):
    return {}