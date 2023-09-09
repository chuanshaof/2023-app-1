import datetime
from enum import Enum

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, aliased
from sqlalchemy import select, func, and_

from ..database import get_db
from ..models import Instruments, Positions


router = APIRouter()

# Covers the "positions" component

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)

def get_fund_by_date_query(fund_id, date):
    subq = select(
               func.max(Positions.reportedDate).label('maxdate'), 
               Positions.instrumentId, 
               Positions.fundID
           ).where(
               Positions.reportedDate <= date
           ).group_by(Positions.instrumentId)
    subq = subq.subquery()
    query = select(
                Positions,
            ).select_from(Positions).join(subq, 
                                        and_(Positions.instrumentId == subq.c.instrumentId,
                                            subq.c.maxdate == Positions.reportedDate,
                                            subq.c.fundID == Positions.fundID)
            )
    return query

class BreakdownTypes(Enum):
    INSTRUMENTS = 'instruments'
    COUNTRY = 'country'
    SECTOR = 'sector'

class BreakdownParams(BaseModel):
    fund_id: int 
    type: BreakdownTypes
    date: datetime.date = Field(description='')


@router.post("/breakdown")
def retrieve_breakdown(params: BreakdownParams, db: Session = Depends(get_db)):
    subq = select(
               func.max(Positions.reportedDate).label('maxdate'), 
               Positions.instrumentId, 
               Positions.fundId
           ).where(
               Positions.fundId == params.fund_id,
               Positions.reportedDate <= params.date
           ).group_by(Positions.instrumentId).subquery()

    
    if(params.type == BreakdownTypes.COUNTRY):
        type_field = Instruments.country
    elif(params.type == BreakdownTypes.INSTRUMENTS):
        type_field = Positions.instrumentId
    elif(params.type == BreakdownTypes.SECTOR):
        type_field = Instruments.sector

    # query = select(type_field, recent_pos.marketValue).select_from(recent_pos).join(Instruments).group_by(type_field)
    query = select(
                type_field,
                func.sum(Positions.marketValue),
            ).select_from(Positions).join(subq, 
                                          and_(Positions.instrumentId == subq.c.instrumentId,
                                            subq.c.maxdate == Positions.reportedDate,
                                            subq.c.fundId == Positions.fundId)
            ).join(Instruments).group_by(type_field)
    res = db.execute(query).all()
    types = []
    values = []
    for t,v in res:
        types.append(t)
        values.append(v)
    return {"types": types, "values": values}

class TotalValueParams(BaseModel):
    fund_id: int
    start_date: datetime.date
    end_date: datetime.date

@router.post("/total_value")
def retrieve_total_market_value(params: TotalValueParams):
    current_date = params.start_date
    while (current_date <= params.end_date):
        subq = get_fund_by_date_query(params.fund_id, current_date)

        current_date += datetime.timedelta(days=1)
    
    # subq = 
    # res = get_fund_by_date(params.fund_id, params.start_date, params.end_date)
    
    return {}

class MonthlyReturnParams(BaseModel):
    fund_id: int
    start_date: datetime.date
    end_date: datetime.date

@router.post("/monthly_return")
def retrieve_monthly_investment_return(params: MonthlyReturnParams):
    # res = get_fund_by_date(params.fund_id, params.start_date, params.end_date)
    return {}
