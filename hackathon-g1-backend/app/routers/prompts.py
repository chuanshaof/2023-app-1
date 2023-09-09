from langchain.prompts import (PromptTemplate,SystemMessagePromptTemplate, HumanMessagePromptTemplate)


SYS_TEMPLATE = "You are a helpful AI Assistant for an investment company. You will be given contextual data about some of its positions, instruments and entities, in order to answer a user query. Explain every step of your thinking, echoing the data you have received"

CONTEXT_TEMPLATE = ("### JSON CONTEXT ###\n"
                    "{context}\n"
                    "### END CONTEXT ###")
CONTEXT_PROMPT = PromptTemplate.from_template(CONTEXT_TEMPLATE)

FULL_TEMPLATE = ("{context}\n"
                 "\n"
                 "Q: {question}\n"
                 "A: Let me think in steps. ")

FULL_PROMPT = HumanMessagePromptTemplate.from_template(FULL_TEMPLATE)

SYS_PROMPT = SystemMessagePromptTemplate.from_template(SYS_TEMPLATE)