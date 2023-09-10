from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging
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
    instruments = db.query(Instruments).all()

    if instruments:
        return instruments
    else:
        logging.error("No instruments found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No instruments found")


@router.get("/{instrument_id}")
def get_instrument(instrument_id: int, db: Session = Depends(get_db)):
    instrument =  db.query(Instruments).filter(Instruments.instrumentId == instrument_id).first()

    if instrument:
        return instrument
    else:
        logging.error(f"Instrument {instrument_id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrument not found")


@router.put("/{instrument_id}")
def update_instrument(instrument_id: int, country: str, sector: str, instrumentType: str, db: Session = Depends(get_db)):
    # Retrieve the existing record you want to update (e.g., by primary key)
    instrument = db.query(Instruments).filter(Instruments.instrumentId == instrument_id).first()

    if instrument:
        # Modify the attributes of the retrieved record
        instrument.country = country
        instrument.sector = sector
        instrument.instrumentType = instrumentType

        logging.info(f"Updated instrument {instrument_id}")
        # Commit the session to persist the changes to the database
        db.commit()
    else:
        logging.error(f"Instrument {instrument_id} not found")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Instrument not found")