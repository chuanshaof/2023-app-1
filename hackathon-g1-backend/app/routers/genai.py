from fastapi import APIRouter
from langchain.chat_models import ChatAnthropic
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from dotenv import load_dotenv

print(load_dotenv())
router = APIRouter()
chat = ChatAnthropic()


@router.get("/genai")
def genai():
    messages = [
        HumanMessage(
            content="Translate this sentence from English to French. I love programming."
        )
    ]
    res = chat(messages)
    return res.content