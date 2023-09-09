from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..schemas import Instruments
from ..database import get_db

router = APIRouter()

# Covers the "entities" component

router = APIRouter(
    prefix="/instruments",
    tags=["instruments"],
    responses={404: {"description": "Not found"}},
)

@router.get("")
async def get_instruments(db: Session = Depends(get_db)):
    return db.query(Instruments).all()

@router.get("/{instrument_id}")
def get_instrument(instrument_id: int, db: Session = Depends(get_db)):
    return db.query(Instruments).filter(Instruments.instrumentId == instrument_id).first()

@router.post("/{instrument_id}")
def update_instrument(instrument_id: int):
    return {}
