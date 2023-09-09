from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.funds import router as funds
from .routers.instruments import router as instruments
from .routers.price_values import router as price_values
from .routers.genai import router as genai_router
from .routers.injestor import router as injestor

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
app.include_router(injestor)