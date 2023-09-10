from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
from ..models import Pricing
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
    priceValues = db.query(Pricing).filter(Pricing.instrumentId == instrument_id).all()
    
    if priceValues:
        return priceValues
    else:
        logging.error(f"Instrument {instrument_id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrument not found")
