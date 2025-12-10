
import os
import json
import streamlit as st
from pydantic import BaseModel, ValidationError
from openai import OpenAI
from groq import Groq

# --- Configuration ---
def get_llm_provider():
    return st.secrets["general"]["llm_provider"]

def get_api_key(provider):
    return st.secrets[provider]["api_key"]

# --- Client Initialization ---
def get_client():
    provider = get_llm_provider()
    api_key = get_api_key(provider)
    
    if provider == "openai":
        return OpenAI(api_key=api_key)
    elif provider == "groq":
        return Groq(api_key=api_key)
    else:
        raise ValueError(f"Unsupported provider: {provider}")

# --- Core LLM Function ---
def query_llm(system_prompt: str, user_prompt: str, response_model: type[BaseModel] = None):
    """
    Sends a query to the LLM and returns the response.
    If response_model is provided, it attempts to parse the output as JSON matching the model.
    """
    client = get_client()
    provider = get_llm_provider()
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]
    
    try:
        if provider == "openai":
            # OpenAI supports structured outputs natively with response_format
            completion = client.chat.completions.create(
                model="gpt-4o", # Or gpt-3.5-turbo
                messages=messages,
                response_format={"type": "json_object"}
            )
            content = completion.choices[0].message.content
            
        elif provider == "groq":
            # Groq requires JSON mode enforcement via prompt + json_object type
            completion = client.chat.completions.create(
                model="llama3-70b-8192",
                messages=messages,
                response_format={"type": "json_object"}
            )
            content = completion.choices[0].message.content
            
        else:
            raise ValueError("Provider not configured")

        # Parse JSON
        if response_model:
            try:
                data = json.loads(content)
                return response_model(**data)
            except (json.JSONDecodeError, ValidationError) as e:
                st.error(f"Failed to parse LLM response: {e}")
                st.write("Raw response:", content)
                return None
        else:
            return content

    except Exception as e:
        st.error(f"LLM API Error: {e}")
        return None

