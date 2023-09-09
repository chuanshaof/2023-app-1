from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers.routers import router as router
from .routers.genai import router as genai_router


origins = ["*"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(genai_router)


# @app.get("/")
# def read_root():
#     return {"Hello": "Wosrlddd"}

# @app.get("/items/{item_id}")
# def read_item(item_id: int, q: str = None):
#     return {"item_id": item_id, "q": q}