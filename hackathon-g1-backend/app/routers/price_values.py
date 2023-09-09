from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..models import Prices
from ..database import get_db

router = APIRouter()

# Covers the "entities" component

router = APIRouter(
    prefix="/price-values",
    tags=["instruments"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{instrument_id}")
def get_price_values(instrument_id: int, db: Session = Depends(get_db)):
    return db.query(Prices).filter(Prices.instrumentId == instrument_id).all()
