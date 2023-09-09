from fastapi import APIRouter
from langchain.chat_models import ChatAnthropic
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from pydantic import BaseModel

from ..config import settings



router = APIRouter(
    prefix="/genai",
    tags=["genai"],
    responses={404: {"description": "Not found"}},
)

chat = ChatAnthropic(anthropic_api_key=settings.ANTHROPIC_API_KEY)

class Query(BaseModel):
    query: str


@router.post("/genai")
def query_genai(query: Query):
    messages = [
        HumanMessage(
            content=query.query
        )
    ]
    res = chat(messages)
    return res.content