import streamlit as st
import pandas as pd
import time # For simulation

# --- Helper Functions (Simulating Pipeline Steps) ---
def trigger_e2e_pipeline(file_data, query):
    """
    Simulates the call to the FastAPI backend which orchestrates
    Phases 2 (ETL), 3 (LLM Analysis), and 4 (Reporting).
    """
    st.info(f"Starting pipeline with query: '{query[:40]}...'")
    
    # Phase 2: ETL
    st.progress(10, text="10% - Data Ingestion and Transformation (SQL/Pandas)...")
    time.sleep(1) # Simulate delay
    
    # Phase 3: LLM Structured Reasoning (Llama 3)
    st.progress(40, text="40% - Llama 3 generating Analysis Plan (Structured JSON)...")
    time.sleep(2)
    st.progress(60, text="60% - Python/SQL executing metrics based on Llama 3 plan...")
    time.sleep(1)

    # Phase 4: LLM Narrative Reporting
    st.progress(90, text="90% - Llama 3 generating Narrative Reports...")
    time.sleep(1.5)
    
    # Simulated final report and metrics
    metrics_json = '{"total_revenue": 4.5e6, "churn_rate_medium_segment": 0.18}'
    final_report = f"""
## Final Consumer Data Report
**Analysis Request:** *{query}*

### Executive Summary (LLM Generated)
The medium-value segment currently exhibits a **18% churn rate**, slightly higher than the baseline. Llama 3 identified that the key driver is a lack of recent engagement following a major product update. Immediate action must be taken to re-engage this cohort.

### Key Metrics (Delegated Computation)
- Total Quarterly Revenue: $4,500,000
- Churn Rate (Medium Segment): 18.0%

### Recommendations (LLM Interpretation)
1. **Targeted Campaign:** Deploy an email sequence to the 90-day inactive users in the medium segment, offering a category-specific discount.
2. **Feature Review:** Use the raw analysis data (see download) to investigate usage patterns of the new product feature 'Z' which may be causing friction.

"""
    return final_report, metrics_json

# --- Streamlit Application Layout ---
st.set_page_config(layout="wide", page_title="Unified Llama 3 Pipeline Interface")
st.title("🚀 Unified Data Pipeline Interface (Llama 3 + Streamlit)")

# Create Tabs for the two main use cases
tab1, tab2 = st.tabs(["🏗️ Development/Checklist", "⚙️ Production Operations"])

# --- TAB 1: Development/Checklist Interface ---
with tab1:
    st.header("Project Development Status Tracker")
    st.markdown("Use this interface to track the progressive completion of the pipeline blueprint steps.")
    
    # Helper to generate an interactive checklist based on the blueprint structure
    def render_checklist(phase_num, items):
        st.subheader(f"Phase {phase_num}: {items[0]['phase_name']}")
        
        # Use a list of checkboxes for interactivity (simulated persistence)
        for i, item in enumerate(items):
            st.checkbox(
                f"**{item['component']}**: {item['description']}",
                key=f"phase_{phase_num}_item_{i}",
                value=False, # Replace with persistent state loading in a real app
                help=f"Tools: {item['tooling']}"
            )

    # Simplified representation of the blueprint for checklist rendering
    phase_data = {
        1: [{"phase_name": "Setup & Infrastructure", "component": "1.1 Project Structure", "description": "Initialize repository and core directories.", "tooling": "git, Poetry"},
            {"phase_name": "Setup & Infrastructure", "component": "1.4 Database", "description": "Set up PostgreSQL and define schemas.", "tooling": "PostgreSQL, SQLAlchemy"},
            {"phase_name": "Setup & Infrastructure", "component": "1.5 LLM Runtime", "description": "Deploy Llama 3 inference endpoint (vLLM/TGI).", "tooling": "vLLM, Llama 3 Instruct"}],
        2: [{"phase_name": "ETL & Feature Engineering", "component": "2.1 Data Validation", "description": "Define Pydantic schemas for input data.", "tooling": "Pydantic"},
            {"phase_name": "ETL & Feature Engineering", "component": "2.4 Feature Engineering", "description": "Compute RFM, CLV, and segment flags.", "tooling": "Pandas, SQL"}],
        3: [{"phase_name": "LLM Structured Reasoning", "component": "3.2 LLM Client Setup", "description": "Integrate Llama 3 with 'outlines' for JSON mode.", "tooling": "outlines, Llama 3"},
            {"phase_name": "LLM Structured Reasoning", "component": "3.3 Plan Generation", "description": "Generate dynamic AnalysisPlan JSON from query.", "tooling": "Llama 3, AnalysisPlan Schema"}],
    }
    
    # Render the checklist sections
    render_checklist(1, phase_data[1])
    render_checklist(2, phase_data[2])
    render_checklist(3, phase_data[3])


# --- TAB 2: Production Operations Interface ---
with tab2:
    st.header("Pipeline Job Execution Interface")
    st.markdown("This is the production interface for triggering a full end-to-end analysis job.")
    
    # 4.4: User Input Section
    with st.container(border=True):
        st.subheader("Job Configuration")
        
        # Query Input
        analysis_query = st.text_input(
            "Analysis Request (Natural Language):",
            "What are the key drivers of customer churn in the medium-value segment and what are the recommended next steps?"
        )
        # File Upload
        uploaded_file = st.file_uploader("Upload Consumer Data (CSV/JSON)", type=['csv', 'json'], help="Upload the raw JSON or CSV file for ingestion and analysis.")
        
    st.markdown("---")
    
    # 4.4: Pipeline Trigger Button
    if st.button("▶️ Run Full End-to-End Analysis Job", type="primary"):
        if uploaded_file and analysis_query:
            # Run the simulated pipeline
            with st.spinner("Processing Data and Running Llama 3 Analysis..."):
                final_report, metrics_json = trigger_e2e_pipeline(uploaded_file, analysis_query)
            
            st.success("✅ Job Complete! Structured Insights and Narrative Reports Generated.")
            
            col_report, col_metrics = st.columns(2)
            
            # 4.4: Display Narrative Report
            with col_report:
                st.subheader("Llama 3 Narrative Report")
                st.markdown(final_report)
                
                st.download_button(
                    label="Download Narrative Report (Markdown)",
                    data=final_report,
                    file_name="Llama3_Narrative_Report.md",
                    mime="text/markdown"
                )

            # 4.4: Display Raw Metrics/Structured Output
            with col_metrics:
                st.subheader("Raw Metrics & LLM Structured Output")
                st.json(metrics_json)
                
                st.download_button(
                    label="Download Raw Metrics (JSON)",
                    data=metrics_json,
                    file_name="Pipeline_Metrics.json",
                    mime="application/json"
                )
            
            st.markdown("---")
            st.warning("Note: The data pipeline needs to be deployed (Step 4.5) to enable non-simulated execution via FastAPI.")
            
        else:
            st.error("Please ensure a data file is uploaded and an analysis query is provided.")
