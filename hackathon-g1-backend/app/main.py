from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from .routers.funds import router as funds
from .routers.instruments import router as instruments
from .routers.price_values import router as price_values
from .routers.genai import router as genai_router
from .routers.ingestor import router as ingestor
from .routers.analytics import router as analytics
origins = ["*"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(funds)
app.include_router(instruments)
app.include_router(price_values)
app.include_router(genai_router)
app.include_router(ingestor)
app.include_router(analytics)