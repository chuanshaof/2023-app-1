from fastapi import APIRouter, UploadFile
import pandas as pd
from dateutil import parser
from sqlalchemy import create_engine, text
from ..config import settings

router = APIRouter()

@router.post("/injestor")
def injestor(file: UploadFile):
    INSTRUMENTS_COLS = ["instrumentName", 
                        "instrumentType",
                        "currency",
                        "isinCode",
                        "sedolCode",
                        "symbol",
                        "country",
                        "sector",
                        "coupon",
                        "maturityDate",
                        "couponFrequency",
                        "industry"]

    PRICES_COLS = ["instrumentId",
                    "unitPrice",
                    "reportedDate"]

    POSITIONS_COLS = ["quantity",
                    "marketValue",
                    "realisedProfitLoss",
                    "reportedDate"]

    csv_map = {
        "FINANCIAL TYPE": INSTRUMENTS_COLS[1],
        "SYMBOL": INSTRUMENTS_COLS[5],
        "SECURITY NAME": INSTRUMENTS_COLS[0],
        "ISIN": INSTRUMENTS_COLS[3],
        "SEDOL": INSTRUMENTS_COLS[4],
        "PRICE": PRICES_COLS[1],
        "QUANTITY": POSITIONS_COLS[0],
        "REALISED P/L": POSITIONS_COLS[2],
        "MARKET VALUE": POSITIONS_COLS[1]
    }

    if not file:
        return {"error": "No file provided"}
    else:
        # ASSUMPTION: reportedDate is in the file name
        # ASSUMPTION: fundName is in the file name
        fundName = file.filename.split(".")[0].split("-")[-1].split(" ")[-1]
        reportedDate = file.filename.split(".")[1].split(" ")[0].replace("_", "-")
        reportedDate = parser.parse(reportedDate).date()

        # SEDOL/ISIN is optional
        # SYMBOL is optional

        df = pd.read_csv(file.file)
        rds_engine = create_engine(settings.AWS_RDS_API_KEY)

        with rds_engine.connect() as connection:
            result = connection.execute(text("SELECT * FROM instruments"))
            for row in result:
                print(row)

        # user = rds_db.query(User).filter(User.email == email).first()
        # Cross-check with instrument table
        #   1. "SECURITY_NAME" with "instrumentName" from instruments table
        #   2. "SYMBOL" with "symbol" from instruments table
        #   Output: Get instrumentId

        

        # Cross-check with price table
        #   1. new col "instrumentId" with "instrumentId" from price table
        #   2. "REPORTED_DATE" with "reportedDate" from price table
        #       2.1. if "REPORTED_DATE" does not exist, create new price
        #       2.2. if "REPORTED_DATE" exists, update price
        
        # Cross-check with funds table
        #   1. "fundName" with funds table
        #       1.1. if "fundName" does not exist, create new fund
        #       1.2. if "fundName" exists, obtain "fundId"

        # check if price exists              

        # if not, create instrument



    

    pass