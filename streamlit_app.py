import streamlit as st
import pandas as pd
import duckdb
import os
from pydantic import BaseModel
from llm_engine import query_llm

# --- Page Config ---
st.set_page_config(
    page_title="Data Pipeline",
    page_icon="",
    layout="wide"
)

# --- Session State Initialization ---
if "df" not in st.session_state:
    st.session_state.df = None
if "table_name" not in st.session_state:
    st.session_state.table_name = None
if "schema_info" not in st.session_state:
    st.session_state.schema_info = None

# --- Sidebar ---
with st.sidebar:
    st.header("Configuration")
    try:
        if "general" in st.secrets and "llm_provider" in st.secrets["general"]:
            provider = st.secrets["general"]["llm_provider"]
            st.success(f"LLM Provider: **{provider.upper()}**")
        else:
            st.warning("Secrets not fully configured.")
    except FileNotFoundError:
        st.error("Secrets file not found!")
    except Exception as e:
        st.error(f"Error loading secrets: {e}")

    st.divider()
    st.markdown("###  Dev Tools")
    if st.button("Clear Cache"):
        st.cache_data.clear()
        st.rerun()

# --- Main App ---
st.title(" End-to-End Consumer Data Pipeline")
st.markdown("### Embedded Analytics with DuckDB & Llama 3")

# --- Phase 2: Ingestion ---
st.header("1. Data Ingestion")
uploaded_file = st.file_uploader("Upload a CSV file", type=["csv"])

if uploaded_file:
    # Save to temp file for DuckDB to read directly (Zero-Copy)
    with open("temp_data.csv", "wb") as f:
        f.write(uploaded_file.getbuffer())
    
    # Load into DuckDB
    try:
        # Connect to in-memory DuckDB
        con = duckdb.connect(database=":memory:")
        
        # Create table from CSV
        con.execute("CREATE OR REPLACE TABLE analysis_staging AS SELECT * FROM 'temp_data.csv'")
        
        # Get Schema
        schema_df = con.execute("DESCRIBE analysis_staging").fetchdf()
        
        # Get Preview
        preview_df = con.execute("SELECT * FROM analysis_staging LIMIT 5").fetchdf()
        
        st.session_state.table_name = "analysis_staging"
        st.session_state.schema_info = schema_df.to_dict(orient="records")
        
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Data Preview")
            st.dataframe(preview_df, use_container_width=True)
        with col2:
            st.subheader("Detected Schema")
            st.dataframe(schema_df[["column_name", "column_type"]], use_container_width=True)
            
        st.success(f"Successfully loaded {len(con.execute('SELECT * FROM analysis_staging').fetchall())} rows.")
        
    except Exception as e:
        st.error(f"Error loading data: {e}")

# --- Phase 3: AI Analysis (Text-to-SQL) ---
class SQLQuery(BaseModel):
    sql_query: str
    explanation: str

if st.session_state.table_name:
    st.divider()
    st.header("2. AI Analysis")
    user_query = st.text_input("Ask a question about your data:")
    
    if user_query:
        with st.spinner("Generating SQL..."):
            # Construct System Prompt
            schema_str = "\n".join([f"- {col['column_name']} ({col['column_type']})" for col in st.session_state.schema_info])
            
            system_prompt = f"""
            You are an expert DuckDB SQL analyst.
            Your task is to convert the user's natural language question into a valid DuckDB SQL query.
            
            The table name is: `analysis_staging`
            
            Schema:
            {schema_str}
            
            Rules:
            1. Return a JSON object with `sql_query` and `explanation`.
            2. Use DuckDB syntax.
            3. If the user asks for something that requires casting (e.g. string to number), use `TRY_CAST`.
            4. Do NOT include markdown formatting (```sql) in the `sql_query` field.
            """
            
            # Call LLM
            response = query_llm(system_prompt, user_query, SQLQuery)
            
            if response:
                st.markdown(f"**Plan:** {response.explanation}")
                st.code(response.sql_query, language="sql")
                
                # Execute SQL
                try:
                    # Re-connect to DB (since it is in-memory, we need to ensure persistence or reload. 
                    # For this simple version, we reload the CSV if connection is lost, but DuckDB in-memory persists in session if we keep the connection object.
                    # However, Streamlit re-runs the script. We need to re-init the connection or use a persistent file.)
                    
                    # FIX: In-memory DB is lost on rerun. We need to reload the CSV every time or use a file-based DB.
                    # For now, we reload the CSV since it is fast.
                    con = duckdb.connect(database=":memory:")
                    con.execute("CREATE OR REPLACE TABLE analysis_staging AS SELECT * FROM 'temp_data.csv'")
                    
                    result_df = con.execute(response.sql_query).fetchdf()
                    
                    st.subheader("Result")
                    st.dataframe(result_df, use_container_width=True)
                    
                    # Simple Visualization Logic
                    if len(result_df) > 0:
                        numeric_cols = result_df.select_dtypes(include=['number']).columns
                        if len(numeric_cols) > 0 and len(result_df) < 50:
                            st.bar_chart(result_df.set_index(result_df.columns[0])[numeric_cols[0]])
                            
                except Exception as e:
                    st.error(f"SQL Execution Error: {e}")
                    st.error("The generated SQL was invalid. Please try rephrasing.")
