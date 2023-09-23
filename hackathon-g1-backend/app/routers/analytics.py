import datetime
from enum import Enum
from typing import Optional
import logging

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

"""
Weird for this to be here, not used in analytics
This is used in the GenAI portion
"""
def get_funds():
    res = next(get_db()).execute(select(Funds))
    fund_ids = []
    fund_names = []
    for fund, in res:
        fund_ids.append(fund.fundId)
        fund_names.append(fund.fundName)
    return {"fundId": fund_ids, "fundName": fund_names}

"""
Get sum of 'marketValue' of particular 'fund_id' for across ALL 'instrument_id' latest positions
"""
def get_fund_market_value(fund_id, date, db) -> float:
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

"""
Get sum of 'marketValue' of a particular 'instrument_id' across ALL 'fund_id' latest positions
"""
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

"""
Get sum of 'realised_pnl' of particular 'instrument_id' between 'start_date' and 'end_date' across all 'fund_id'
"""
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

"""
Pydantic models for the expected request body
"""
class BreakdownParams(BaseModel):
    fund_id: int = Field(ge=1)
    type: BreakdownTypes = Field(...)
    date: datetime.date = Field(...)

"""
Unsure why this uses a helper function since that function was only used once

Probably ideal to use a 'GET' request here
"""
@router.post("/breakdown")
def retrieve_breakdown_handler(params: BreakdownParams, db: Session = Depends(get_db)):
    return retrieve_breakdown(params.fund_id, params.type, params.date, db)

"""
Retrieve breakdown of 'breakdown_type' for a particular 'fund_id' before a particular 'date'

Possible breakdown types are: ['country', 'instruments', 'sector']
"""
def retrieve_breakdown(fund_id, breakdown_type, date, db = next(get_db())):
    """
    Get latest 'instrument_id' and 'fund_id' before a particular 'date'
    """
    subq = select(
               func.max(Positions.reportedDate).label('maxdate'), 
               Positions.instrumentId, 
               Positions.fundId
           ).where(
               Positions.fundId == fund_id,
               Positions.reportedDate <= date
           ).group_by(Positions.instrumentId).subquery()

    
    if(breakdown_type == BreakdownTypes.COUNTRY):
        type_field = Instruments.country
    elif(breakdown_type == BreakdownTypes.INSTRUMENTS):
        type_field = Positions.instrumentId
    elif(breakdown_type == BreakdownTypes.SECTOR):
        type_field = Instruments.sector
    
    """
    Get sum of 'marketValue' grouped by the 'breakdown_type' inner joined with subq
    """
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
    fund_id: int = Field(ge=1)
    start_date: datetime.date = Field(...)
    end_date: datetime.date = Field(...)

"""
Unsure why a helper function again

Probably ideal to use a 'GET' request here
"""
@router.post("/total_value")
def retrieve_total_market_value_handler(params: TotalValueParams, db: Session = Depends(get_db)):
    return retrieve_total_market_value(params.fund_id, params.start_date, params.end_date, db)

"""
Retrieve total market value of a particular 'fund_id' between 'start_date' and 'end_date', grouped DAILY

Not sure if this is ideal because it queries the database for every single day
    e.g. If over the span of 1 year, it will be 365 database calls

A way to conteract this would probably to go with a single query and group by 'date'
    Followed by using pandas to fill in the missing dates if that was one of the requirements
"""
def retrieve_total_market_value(fund_id, start_date, end_date, db = next(get_db())):
    dates = []
    values = []
    curr_date = start_date
    while (curr_date <= end_date):
        market_val = get_fund_market_value(fund_id, curr_date, db)
        dates.append(curr_date)
        values.append(market_val)

        curr_date += datetime.timedelta(days=1)
    
    return {"dates": dates, "values": values}

class MonthlyReturnParams(BaseModel):
    fund_id: Optional[int] = Field(None)
    instrument_id: Optional[int] = Field(None)
    start_date: datetime.date = Field(...)
    end_date: datetime.date = Field(...)

"""
Same comments as above
"""
@router.post("/monthly_fund_return")
def retrieve_monthly_fund_return_handler(params: MonthlyReturnParams, db: Session = Depends(get_db)):
    return retrieve_monthly_fund_return(params.fund_id, params.start_date, params.end_date, db)

"""
Retrieve total return value of a particular 'fund_id' between 'start_date' and 'end_date', grouped MONTHLY

'inv_ret' is calculated by `previous month value / current month value - 1`

Possible problems:
    1. 'start_date' being in the middle of the month
            Possible fix to this would be to only input the month rather than the date
            Might require some changes to the frontend

    2. Might not be querying for the 'marketValue' at the end of the month due to the lack of data
            Might want to update the 'marketValue' based on other data
            This will require a lot of data cleaning
"""
def retrieve_monthly_fund_return(fund_id, start_date, end_date, db = next(get_db())):
    dates = []
    inv_rets = []
    curr_val = get_fund_market_value(fund_id, start_date, db)
    curr_date = start_date + relativedelta(months=1)
    while (curr_date < end_date):
        new_val = get_fund_market_value(fund_id, curr_date, db)
        if(curr_val):
            inv_ret = (new_val / curr_val) - 1
            inv_rets.append(inv_ret)
            dates.append(curr_date)
        curr_val = new_val
        curr_date += relativedelta(months=1)
    
    return {"dates": dates, "values": inv_rets}

"""
Same comments as all requests above
"""
@router.post("/monthly_instrument_return")
def retrieve_monthly_instrument_return_handler(params: MonthlyReturnParams, db: Session = Depends(get_db)):
    return retrieve_monthly_instrument_return(params.instrument_id, params.start_date, params.end_date, db)

"""
Retrieve total return value of a particular 'instrument_id' between 'start_date' and 'end_date', grouped MONTHLY

Same comments as the one above

NOTE: This filters by 'instrument_id' rather than the above's 'fund_id'
"""
def retrieve_monthly_instrument_return(instrument_id, start_date, end_date, db = next(get_db())):
    dates = []
    inv_rets = []
    curr_val = get_instrument_market_value(instrument_id, start_date, db)
    delta = relativedelta(months=1)
    curr_date = start_date + delta
    while (curr_date < end_date):
        new_val = get_instrument_market_value(instrument_id, curr_date, db)
        if(curr_val):
            pnl = get_realised_pnl(instrument_id, curr_date-delta, curr_date, db)
            inv_ret = ((new_val + pnl) / curr_val) - 1
            inv_rets.append(inv_ret)
            dates.append(curr_date)
        curr_val = new_val
        curr_date += delta
    
    return {"dates": dates, "values": inv_rets}

class TopNParams(BaseModel):
    n: int = Field(ge=0)
    months: int = Field(ge=1)
    date: datetime.date = Field(...)

"""
Same comments as above
"""
@router.post("/top_n")
def retrieve_top_n_funds_handler(params: TopNParams, db: Session = Depends(get_db)):
    return retrieve_top_n_funds(params.n, params.months, params.date, db)

"""
Retrieve top 'n' funds with the highest return over the past 'months' before a particular 'date'

Functionality is similar to 'retrieve_monthly_fund_return' but with a limit of 'n' and 'months' rather than 'start_date' and 'end_date'
"""
def retrieve_top_n_funds(n, months, date, db = next(get_db())):
    funds = db.execute(select(Funds.fundId)).all()
    tops = []
    start_date = date - relativedelta(months=months)
    for fund_id, in funds:
        old_val = get_fund_market_value(fund_id, start_date, db)
        if(old_val):
            new_val = get_fund_market_value(fund_id, date,db)
            inv_ret = (new_val / old_val) - 1
            tops.append((inv_ret, fund_id))
    tops.sort(reverse=True)
    tops = tops[:n]
    return {"fund_ids": [t[1] for t in tops], "values": [t[0] for t in tops]}