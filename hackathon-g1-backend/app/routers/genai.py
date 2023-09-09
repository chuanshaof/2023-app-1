from typing import Optional
from enum import Enum
import datetime
import json

from fastapi import APIRouter
from langchain.chat_models import ChatAnthropic
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.agents import load_tools
from langchain.agents import initialize_agent
from langchain.agents import AgentType
from langchain.tools import BaseTool, StructuredTool, Tool, tool
from pydantic import BaseModel, Field

from ..config import settings
from .analytics import (BreakdownParams,
                        TotalValueParams,
                        MonthlyReturnParams,
                        TopNParams,
                        retrieve_breakdown, 
                        retrieve_total_market_value, 
                        retrieve_monthly_fund_return, 
                        retrieve_monthly_instrument_return, 
                        retrieve_top_n_funds, get_funds)
from .prompts import FULL_PROMPT, SYS_TEMPLATE, CONTEXT_PROMPT, SYS_PROMPT

router = APIRouter(
    prefix="/genai",
    tags=["genai"],
    responses={404: {"description": "Not found"}},
)

chat = ChatAnthropic(anthropic_api_key=settings.ANTHROPIC_API_KEY)


# tools = [
#     StructuredTool.from_function(
#         func=retrieve_breakdown,
#         name="retrieve_breakdown",
#         description="Useful for retrieving the breakdown (by instruments, country, sector) of the total market value of a fund as of a specific date",
#         # args_schema=BreakdownParams
#     ),
#     StructuredTool.from_function(
#         func=retrieve_total_market_value,
#         name="retrieve_total_market_value",
#         description="Useful for retrieving the total market value of a single fund, across a date range",
#         # args_schema=TotalValueParams
#     ),
#     StructuredTool.from_function(
#         func=retrieve_monthly_fund_return,
#         name="retrieve_monthly_fund_return",
#         description="Useful for retrieving the monthly investment return of a fund, across a date range",
#         # args_schema=MonthlyReturnParams
#     ),
#     StructuredTool.from_function(
#         func=retrieve_monthly_instrument_return,
#         name="retrieve_monthly_instrument_return",
#         description="Useful for retrieving the monthly investment return of an instrument (regardless of fund), across a date range",
#         # args_schema=MonthlyReturnParams
#     ),
#     StructuredTool.from_function(
#         func=retrieve_top_n_funds,
#         name="retrieve_top_n_funds",
#         description="Useful for retrieving the top N performing funds by a M-month investment return from a given date, where N and M are provided",
#         # args_schema=TopNParams
#     ),
# ]
funcs = [retrieve_breakdown, 
         retrieve_total_market_value, 
         retrieve_monthly_fund_return,
         retrieve_monthly_instrument_return,
         retrieve_top_n_funds]


db_queries = [
    Tool.from_function(
        func=get_funds,
        name="get_funds",
        description="Useful for retrieving the list of funds"
    )
]
# agent = initialize_agent(tools+db_queries, chat, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True,
#                          agent_kwargs={'prefix': SYS_TEMPLATE,})


class ContextQuery(BaseModel):
    query: str
    query1: Optional[BreakdownParams] = Field(None)
    query2: Optional[TotalValueParams] = Field(None)
    query3: Optional[MonthlyReturnParams] = Field(None)
    query4: Optional[MonthlyReturnParams] = Field(None)
    query5: Optional[TopNParams] = Field(None)

@router.post("/query")
def query_genai(params: ContextQuery):
    contexts = []
    if(params.query1):
        contexts.append(funcs[0](params.query1.fund_id,
                                 params.query1.type,
                                 params.query1.date))
    if(params.query2):
        contexts.append(funcs[1](params.query2.fund_id,
                                 params.query2.start_date,
                                 params.query2.end_date))
    if(params.query3):
        contexts.append(funcs[2](params.query3.fund_id,
                                 params.query3.start_date,
                                 params.query3.end_date))
    if(params.query4):
        contexts.append(funcs[3](params.query4.instrument_id,
                                 params.query4.start_date,
                                 params.query4.end_date))
    if(params.query5):
        contexts.append(funcs[4](params.query5.n,
                                 params.query5.months,
                                 params.query5.date))
    user_message = []
    for con in contexts:
        user_message.append(CONTEXT_PROMPT.format(context=con))
    user_message = FULL_PROMPT.format(
        context="\n".join(user_message),
        question=params.query)
    
    # res = agent.run(user_message)
    res = chat([SYS_PROMPT.format(), user_message])
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