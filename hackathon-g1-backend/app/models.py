from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, Double, Date, ForeignKey, func
from sqlalchemy.orm import relationship

Base = declarative_base()

class Instruments(Base):
    __tablename__ = 'instruments'

    instrumentId = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    instrumentName = Column(String)
    instrumentType = Column(String)
    currency = Column(String)
    isinCode = Column(String)
    sedolCode = Column(String)
    symbol = Column(String)
    country = Column(String)
    sector = Column(String)
    createdAt = Column(Date, default=func.now())
    modifiedAt = Column(Date, default=func.now(), onupdate=func.now())
    coupon = Column(Float)
    maturityDate = Column(Date)
    couponFrequency = Column(String)
    industry = Column(String)
    
    pricing = relationship("Pricing", back_populates="instrument")
    positions = relationship("Positions", back_populates="instrument")

class Pricing(Base):
    __tablename__ = 'pricing'

    instrumentId = Column(Integer, ForeignKey('instruments.instrumentId'), primary_key=True)
    unitPrice = Column(Float)
    reportedDate = Column(Date, primary_key=True)
    createdAt = Column(Date, default=func.now())
    modifiedAt = Column(Date, default=func.now(), onupdate=func.now())
    instrument = relationship("Instruments", back_populates="pricing")

class Positions(Base):
    __tablename__ = 'positions'

    fundId = Column(Integer, ForeignKey('funds.fundId'), primary_key=True)
    instrumentId = Column(Integer, ForeignKey('instruments.instrumentId'), primary_key=True)
    quantity = Column(Double)
    marketValue = Column(Float)
    realisedProfitLoss = Column(Float)
    reportedDate = Column(Date, primary_key=True)
    createdAt = Column(Date, default=func.now())
    modifiedAt = Column(Date, default=func.now(), onupdate=func.now())

    funds = relationship("Funds", back_populates="positions")
    instrument = relationship("Instruments", back_populates="positions")

class Funds(Base):
    __tablename__ = 'funds'

    fundId = Column(Integer, primary_key=True, nullable=False, autoincrement=True)
    fundName = Column(String)
    
    positions = relationship("Positions", back_populates="funds")
