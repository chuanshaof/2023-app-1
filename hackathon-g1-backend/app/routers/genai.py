from fastapi import APIRouter
from langchain.chat_models import ChatAnthropic
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from ..config import settings

router = APIRouter()
chat = ChatAnthropic(anthropic_api_key=settings.ANTHROPIC_API_KEY)

@router.get("/genai")
def genai():
    messages = [
        HumanMessage(
            content="Translate this sentence from English to French. I love programming."
        )
    ]
    res = chat(messages)
    return res.content