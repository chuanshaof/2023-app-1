from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..models import Instruments
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
def update_instrument(instrument_id: int, country: str, sector: str, instrumentType: str, db: Session = Depends(get_db)):
    # Retrieve the existing record you want to update (e.g., by primary key)
    instrument = db.query(Instruments).filter(Instruments.instrumentId == instrument_id).first()

    if instrument:
        # Modify the attributes of the retrieved record
        instrument.country = country
        instrument.sector = sector
        instrument.instrumentType = instrumentType

        # Commit the session to persist the changes to the database
        db.commit()