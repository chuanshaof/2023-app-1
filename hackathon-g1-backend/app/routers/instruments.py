from fastapi import APIRouter
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from ..config import settings
import json

router = APIRouter()

# Covers the "entities" component

router = APIRouter(
    prefix="/instruments",
    tags=["instruments"],
    responses={404: {"description": "Not found"}},
)

INSTRUMENTS_COLS = ["instrumentId",
                    "instrumentName", 
                    "instrumentType",
                    "currency",
                    "isinCode",
                    "sedolCode",
                    "symbol",
                    "country",
                    "sector",
                    "createdAt",
                    "modifiedAt",
                    "coupon",
                    "maturityDate",
                    "couponFrequency",
                    "industry"]

@router.get("")
def get_instruments():
        
    rds_engine = create_engine(settings.AWS_RDS_API_KEY)

    rows = []
    with rds_engine.connect() as connection:
        result = connection.execute(text("SELECT * FROM instruments"))
        # Fetch all the rows from the result set
        rows = result.fetchall()

    data = []

    for row in rows:
        data.append(dict(zip(INSTRUMENTS_COLS, row)))

    return data

@router.get("/{instrument_id}")
def get_instrument(instrument_id: int):
    rds_engine = create_engine(settings.AWS_RDS_API_KEY)

    with rds_engine.connect() as connection:
        result = connection.execute(text(f"SELECT * FROM instruments WHERE instrumentId = {instrument_id}"))

        return dict(zip(INSTRUMENTS_COLS, result.fetchone()))

@router.post("/{instrument_id}")
def update_instrument(instrument_id: int):
    return {}
