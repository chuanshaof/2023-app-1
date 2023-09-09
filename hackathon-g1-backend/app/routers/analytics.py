import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, aliased
from sqlalchemy import select, func, and_
from dateutil.relativedelta import relativedelta

from ..database import get_db
from ..models import Funds, Instruments, Positions


router = APIRouter()

# Covers the "positions" component

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)

def get_fund_market_value(fund_id, date, db):
    subq = select(
                func.max(Positions.reportedDate).label('maxdate'), 
                Positions.instrumentId, 
                Positions.fundId
            ).where(
                Positions.fundId == fund_id,
                Positions.reportedDate <= date
            ).group_by(Positions.instrumentId).subquery()
    query = select(
                func.sum(Positions.marketValue),
            ).select_from(Positions).join(
                subq, 
                and_(Positions.instrumentId == subq.c.instrumentId,
                    subq.c.maxdate == Positions.reportedDate,
                    subq.c.fundId == Positions.fundId)
            )
    return db.execute(query).scalar() or 0

def get_instrument_market_value(instrument_id, date, db):
    subq = select(
                func.max(Positions.reportedDate).label('maxdate'), 
                Positions.instrumentId, 
                Positions.fundId
            ).where(
                Positions.instrumentId == instrument_id,
                Positions.reportedDate <= date
            ).group_by(Positions.instrumentId).subquery()
    query = select(
                func.sum(Positions.marketValue),
            ).select_from(Positions).join(
                subq, 
                and_(Positions.instrumentId == subq.c.instrumentId,
                    subq.c.maxdate == Positions.reportedDate,
                    subq.c.fundId == Positions.fundId)
            )
    return db.execute(query).scalar() or 0

def get_realised_pnl(instrument_id, start_date, end_date, db):
    subq = select(
                func.max(Positions.reportedDate).label('maxdate'), 
                Positions.instrumentId, 
                Positions.fundId
            ).where(
                Positions.instrumentId == instrument_id,
                start_date <= Positions.reportedDate,
                Positions.reportedDate <= end_date,
            ).group_by(Positions.fundId).subquery()
    query = select(
                func.sum(Positions.realisedProfitLoss),
            ).select_from(Positions).join(
                subq, 
                and_(Positions.instrumentId == subq.c.instrumentId,
                    subq.c.maxdate == Positions.reportedDate,
                    subq.c.fundId == Positions.fundId)
            )
    return db.execute(query).scalar() or 0

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
def retrieve_total_market_value(params: TotalValueParams, db: Session = Depends(get_db)):
    dates = []
    values = []
    curr_date = params.start_date
    while (curr_date <= params.end_date):
        market_val = get_fund_market_value(params.fund_id, curr_date, db)
        dates.append(curr_date)
        values.append(market_val)

        curr_date += datetime.timedelta(days=1)
    
    return {"dates": dates, "values": values}

class MonthlyReturnParams(BaseModel):
    fund_id: Optional[int] = None
    instrument_id: Optional[int] = None
    start_date: datetime.date
    end_date: datetime.date

@router.post("/monthly_fund_return")
def retrieve_monthly_fund_return(params: MonthlyReturnParams, db: Session = Depends(get_db)):
    dates = []
    inv_rets = []
    curr_val = get_fund_market_value(params.fund_id, params.start_date, db)
    curr_date = params.start_date + relativedelta(months=1)
    while (curr_date < params.end_date):
        new_val = get_fund_market_value(params.fund_id, curr_date, db)
        if(curr_val):
            inv_ret = (new_val / curr_val) - 1
            inv_rets.append(inv_ret)
            dates.append(curr_date)
        curr_val = new_val
        curr_date += relativedelta(months=1)
    
    return {"dates": dates, "values": inv_rets}

@router.post("/monthly_instrument_return")
def retrieve_monthly_instrument_return(params: MonthlyReturnParams, db: Session = Depends(get_db)):
    dates = []
    inv_rets = []
    curr_val = get_instrument_market_value(params.instrument_id, params.start_date, db)
    delta = relativedelta(months=1)
    curr_date = params.start_date + delta
    while (curr_date < params.end_date):
        new_val = get_instrument_market_value(params.instrument_id, curr_date, db)
        if(curr_val):
            pnl = get_realised_pnl(params.instrument_id, curr_date-delta, curr_date, db)
            inv_ret = ((new_val + pnl) / curr_val) - 1
            inv_rets.append(inv_ret)
            dates.append(curr_date)
        curr_val = new_val
        curr_date += delta
    
    return {"dates": dates, "values": inv_rets}

class TopNParams(BaseModel):
    n: int
    date: datetime.date

@router.post("/top_n")
def retrieve_top_n_funds(params: TopNParams, db: Session = Depends(get_db)):
    funds = db.execute(select(Funds.fundId)).all()
    tops = []
    start_date = params.date - relativedelta(months=12)
    for fund_id, in funds:
        old_val = get_fund_market_value(fund_id, start_date, db)
        if(old_val):
            new_val = get_fund_market_value(fund_id, params.date,db)
            inv_ret = (new_val / old_val) - 1
            tops.append((inv_ret, fund_id))
    tops.sort(reverse=True)

    return {"fund_ids": [t[1] for t in tops], "values": [t[0] for t in tops]}