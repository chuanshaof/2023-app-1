from fastapi import APIRouter, UploadFile, Depends
import pandas as pd
from dateutil import parser
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Instruments, Pricing, Positions, Funds

router = APIRouter()

@router.post("/injestor")
def injestor(file: UploadFile, db: Session = Depends(get_db)):
    if not file:
        return {"error": "No file provided"}
    else:
        '''
        Obtaining `fundName` and `reportedDate` from the file name
        '''
        fundName = file.filename.split(".")[0].split("-")[-1].split(" ")[-1]
        reportedDate = file.filename.split(".")[1].split(" ")[0].replace("_", "-")
        reportedDate = parser.parse(reportedDate).date()

        '''
        Cross-check with funds table
            1. "fundName" with funds table
                1.1. if "fundName" does not exist, create new fund
                1.2. if "fundName" exists, obtain "fundId"
        '''
        fund = db.query(Funds).filter(Funds.fundName == fundName).first()
        if not fund:
            fund = Funds(
                fundName = fundName,
            )
            db.add(fund)    
            db.commit()

        fundId = fund.fundId


        '''
        Renaming and mapping dataframe columns
        '''
        df = pd.read_csv(file.file)

        csv_map = {
            "FINANCIAL TYPE": "instrumentType",
            "SYMBOL": "symbol",
            "SECURITY NAME": "instrumentName",
            "ISIN": "isinCode",
            "SEDOL": "sedolCode",
            "PRICE": "unitPrice",
            "QUANTITY": "quantity",
            "REALISED P/L": "realisedProfitLoss",
            "MARKET VALUE": "marketValue"
        }

        for key, value in csv_map.items():
            if key in df.columns:
                df.rename(columns={key: value}, inplace=True)
        

        '''
        Cross-check with `instrument` table
        For instrumentId(s) not found, we will drop the row
            1. "SECURITY_NAME" with "instrumentName" from instruments table
            Result: Get instrumentId & populate the dataframe
        '''
        instrumentIds = []
        for index, row in df.iterrows():
            instrument = db.query(Instruments).filter(Instruments.instrumentName == row["instrumentName"]).first()
            if instrument:
                instrumentIds.append(instrument.instrumentId)
            else:
                instrumentIds.append(None)

        df["instrumentId"] = instrumentIds
        # filtered_df = df[df['instrumentId'].isnull()]
        # print(filtered_df)
        df = df[df['instrumentId'].notna()]


        '''
        Updating/populating `price` table
            1. Compare new col "instrumentId" with "instrumentId" from price table
            2. "REPORTED_DATE" with "reportedDate" from price table
                2.1. if "REPORTED_DATE" does not exist, create new price
                2.2. if "REPORTED_DATE" exists, update price
        '''
        for index, row in df.iterrows():
            pricing = db.query(Pricing).filter(Pricing.instrumentId == row["instrumentId"]).filter(Pricing.reportedDate == reportedDate).first()
            
            if pricing:
                pricing.unitPrice = row["unitPrice"]
            else:
                pricing = Pricing(
                    instrumentId = row["instrumentId"],
                    unitPrice = row["unitPrice"],
                    reportedDate = reportedDate,
                )

                db.add(pricing)                
    
        '''
        Updating/populating `positions` table
            1. Composite Key should be 
        '''
        for index, row in df.iterrows():
            position = db.query(Positions) \
                .filter(Positions.instrumentId == row["instrumentId"]) \
                .filter(Positions.fundId == fundId) \
                .filter(Positions.reportedDate == reportedDate).first()

            if position:
                position.quantity = row["quantity"]
                position.marketValue = row["marketValue"]
                position.realisedProfitLoss = row["realisedProfitLoss"]
            else:
                position = Positions(
                    fundId = fundId,
                    instrumentId = row["instrumentId"],
                    quantity = row["quantity"],
                    marketValue = row["marketValue"],
                    realisedProfitLoss = row["realisedProfitLoss"],
                    reportedDate = reportedDate
                )

                db.add(position)

        db.commit()
