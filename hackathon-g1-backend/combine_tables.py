# %%
from sqlalchemy import create_engine
from sqlalchemy import inspect
import pandas as pd

engine = create_engine("sqlite:///data/master-reference.db")
insp = inspect(engine)
names = insp.get_table_names()

# %%
tables = {}
for name in names:
    df = pd.read_sql_table(name, con=engine)
    tables[name] = df
    print(name)
    print(df.head(5))

bond_prices = tables['bond_prices']
equity_prices = tables['equity_prices']
bond_reference = tables['bond_reference']
equity_reference = tables['equity_reference']

# %%
print(bond_prices.dtypes)
print(bond_reference.dtypes)
print(equity_prices.dtypes)
print(equity_reference.dtypes)

# %%
print(bond_prices.columns)
print(bond_reference.columns)
print(equity_prices.columns)
print(equity_reference.columns)

# %%
# id starts at 1, dont include
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


# %%
bond_reference_map = {
    "SECURITY NAME": INSTRUMENTS_COLS[0],
    "ISIN": INSTRUMENTS_COLS[3],
    "SEDOL": INSTRUMENTS_COLS[4],
    "COUNTRY": INSTRUMENTS_COLS[6],
    "COUPON": INSTRUMENTS_COLS[8],
    "MATURITY DATE": INSTRUMENTS_COLS[9],
    "COUPON FREQUENCY": INSTRUMENTS_COLS[10],
    "SECTOR": INSTRUMENTS_COLS[7],
    "CURRENCY": INSTRUMENTS_COLS[2],
}

equity_reference_map = {
    "SYMBOL": INSTRUMENTS_COLS[5],
    "COUNTRY": INSTRUMENTS_COLS[6],
    "SECURITY NAME": INSTRUMENTS_COLS[0],
    "SECTOR": INSTRUMENTS_COLS[7],
    "INDUSTRY": INSTRUMENTS_COLS[11],
    "CURRENCY": INSTRUMENTS_COLS[2]
}


# %%
# bond_reference.index += 1
# bond_reference.index.name = "instrumentId"
# equity_reference.index += 1
# equity_reference.index.name = "instrumentId"
print(bond_reference_map)
print(equity_reference_map)

# %%
bond_ref_temp = bond_reference.rename(mapper=bond_reference_map, axis='columns')
bond_ref_temp[INSTRUMENTS_COLS[1]] = 'Government Bond'
eqty_ref_temp = equity_reference.rename(mapper=equity_reference_map, axis='columns')
eqty_ref_temp[INSTRUMENTS_COLS[1]] = 'Equities'


print(bond_ref_temp.head(5))
print(eqty_ref_temp.head(5))

# %%
instruments = pd.DataFrame(columns=INSTRUMENTS_COLS)
print(instruments)
instruments = pd.concat([instruments, bond_ref_temp, eqty_ref_temp], ignore_index=True)
instruments.index += 1
instruments.index.name = "instrumentId"
print(instruments)
# %%

# %%

bond_prices_map = {
    "DATETIME": PRICES_COLS[2],
    "ISIN": INSTRUMENTS_COLS[3],
    "PRICE": PRICES_COLS[1]
}

equity_prices_map = {
    "DATETIME": PRICES_COLS[2],
    "SYMBOL": INSTRUMENTS_COLS[5],
    "PRICE": PRICES_COLS[1]
}

# %%
print(bond_prices.head(5))
print(equity_prices.head(5))
# %%
bond_prc_temp = bond_prices.rename(mapper=bond_prices_map, axis='columns')
eqty_prc_temp = equity_prices.rename(mapper=equity_prices_map, axis='columns')

print(bond_prc_temp.head(5))
print(eqty_prc_temp.head(5))


# %%
for c in bond_prc_temp[INSTRUMENTS_COLS[3]]:
    print(instruments.loc[instruments[INSTRUMENTS_COLS[3]] == c].iloc[0].name)
    break
# %%
bond_prc_temp['instrumentId'] = [instruments.loc[instruments[INSTRUMENTS_COLS[3]] == c].iloc[0].name
                                 for c in bond_prc_temp[INSTRUMENTS_COLS[3]]]
eqty_prc_temp['instrumentId'] = [instruments.loc[instruments[INSTRUMENTS_COLS[5]] == c].iloc[0].name
                                 for c in eqty_prc_temp[INSTRUMENTS_COLS[5]]]

# %%
print(bond_prc_temp.tail(20))
print(eqty_prc_temp.head(20))

# %%
pricing = pd.DataFrame(columns=PRICES_COLS)
pricing = pd.concat([pricing, bond_prc_temp, eqty_prc_temp])[PRICES_COLS]
print(pricing)

# %%
pricing['reportedDate'] = pd.to_datetime(pricing['reportedDate'], format='mixed', dayfirst=False)
print(pricing)

# %%
instruments.to_csv("./data/instruments.csv", index=True)
pricing.to_csv("./data/pricing.csv", index=False)

# %%

rds_engine = create_engine("mysql+pymysql://root:password@database.cxws32iitkns.ap-southeast-1.rds.amazonaws.com/gic-team01")
insp = inspect(rds_engine)
names = insp.get_table_names()
print(names)

# %%
print(instruments)
print(len(instruments))

# %%
instruments.to_sql("instruments", rds_engine, if_exists='append')
# %%
pricing.to_sql("pricing", rds_engine, if_exists='append', index=False)