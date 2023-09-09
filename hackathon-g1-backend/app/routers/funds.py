from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from ..models import Positions, Pricing
from ..database import get_db

router = APIRouter()

# Covers the "positions" component

router = APIRouter(
    prefix="/funds",
    tags=["funds"],
    responses={404: {"description": "Not found"}},
)

@router.post("/{fund_id}/refresh")
def refresh_fund(fund_id: int, db: Session = Depends(get_db)):

    positions = db.query(Positions).filter(Positions.fundId == fund_id)
    positions = db.query(Positions).filter(Positions.fundId == fund_id).filter(Positions.instrumentId, func.max(Positions.reportedDate)).all()
    
    for position in positions:
        print(position.instrumentId)

    return {}

@router.get("/{fund_id}/instruments/{instrument_id}")
def get_instrument_fund_position(fund_id: int, instrument_id: int, db: Session = Depends(get_db)):
    return db.query(Positions).filter(Positions.instrumentId == instrument_id).filter(Positions.fundId == fund_id).first()