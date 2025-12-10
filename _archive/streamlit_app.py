import streamlit as st
import pandas as pd
import duckdb
import os
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

# --- Sidebar ---
with st.sidebar:
    st.header("Configuration")
    try:
        # Check if secrets are available
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

# --- Phase 3: Analysis (Placeholder) ---
if st.session_state.table_name:
    st.divider()
    st.header("2. AI Analysis")
    user_query = st.text_input("Ask a question about your data:")
    
    if user_query:
        st.info("AI Analysis module coming in Phase 3...")
