from typing import Optional

from fastapi import APIRouter
from langchain.chat_models import ChatAnthropic
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.agents import load_tools
from langchain.agents import initialize_agent
from langchain.agents import AgentType
from langchain.tools import BaseTool, StructuredTool, Tool, tool
from pydantic import BaseModel

from ..config import settings
from .analytics import (BreakdownParams, TotalValueParams, MonthlyReturnParams, TopNParams,
                        retrieve_breakdown, retrieve_total_market_value, retrieve_monthly_fund_return, 
                        retrieve_monthly_instrument_return, retrieve_top_n_funds)

router = APIRouter(
    prefix="/genai",
    tags=["genai"],
    responses={404: {"description": "Not found"}},
)

chat = ChatAnthropic(anthropic_api_key=settings.ANTHROPIC_API_KEY)


tools = [
    Tool.from_function(
        func=retrieve_breakdown,
        name="Breakdown Retriever",
        description="Useful for retrieving the breakdown "
    )
]
# agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)


class ContextQuery(BaseModel):
    query: str
    query1: Optional[BreakdownParams]
    query2: Optional[TotalValueParams]
    query3: Optional[MonthlyReturnParams]
    query4: Optional[MonthlyReturnParams]
    query5: Optional[TopNParams]

@router.post("/query")
def query_genai(query: ContextQuery):
    messages = [
        HumanMessage(
            content=query.query
        )
    ]
    res = chat(messages)
    return res.content



class Query(BaseModel):
    query: str

@router.post("/test")
def test_genai(query: Query):
    messages = [
        HumanMessage(
            content=query.query
        )
    ]
    res = chat(messages)
    return res.content