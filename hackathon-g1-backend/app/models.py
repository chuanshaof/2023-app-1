from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

Base = declarative_base()

class Instruments(Base):
    __tablename__ = 'instruments'

    instrumentId = Column(Integer, primary_key=True)
    instrumentName = Column(String)
    instrumentType = Column(String)
    currency = Column(String)
    isinCode = Column(String)
    sedolCode = Column(String)
    symbol = Column(String)
    country = Column(String)
    sector = Column(String)
    createdAt = Column(Date)
    modifiedAt = Column(Date)
    coupon = Column(Float)
    maturityDate = Column(Date)
    couponFrequency = Column(String)
    industry = Column(String)
    
    prices = relationship("Prices", back_populates="instrument")
    positions = relationship("Positions", back_populates="instrument")

class Prices(Base):
    __tablename__ = 'pricing'

    instrumentId = Column(Integer, ForeignKey('instruments.instrumentId'), primary_key=True)
    unitPrice = Column(Float)
    reportedDate = Column(Date, primary_key=True)
    createdAt = Column(Date)
    modifiedAt = Column(Date)

    instrument = relationship("Instruments", back_populates="prices")

class Positions(Base):
    __tablename__ = 'positions'

    fundID = Column(Integer, ForeignKey('funds.fundID'), primary_key=True)
    instrumentId = Column(Integer, ForeignKey('instruments.instrumentId'), primary_key=True)
    quantity = Column(Float)
    marketValue = Column(Float)
    realisedProfitLoss = Column(Float)
    reportedDate = Column(Date, primary_key=True)
    createdAt = Column(Date)
    modifiedAt = Column(Date)

    funds = relationship("Funds", back_populates="positions")
    instrument = relationship("Instruments", back_populates="positions")

class Funds(Base):
    __tablename__ = 'funds'

    fundID = Column(Integer, primary_key=True)
    fundName = Column(String)
    
    positions = relationship("Positions", back_populates="funds")
