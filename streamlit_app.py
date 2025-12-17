import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image

from pandasai import SmartDataframe
from pandasai.llm import GoogleGemini
import google.generativeai as genai

llm = GoogleGemini(
    model="models/gemini-2.5-flash-lite",
    api_key="AIzaSyCd7YZ_V1xL3ZyrlXeOCnX-bsT5x3ndtsM"
)
# Workaround for pandasai bug: Re-initialize the model with the correct name
genai.configure(api_key="AIzaSyCd7YZ_V1xL3ZyrlXeOCnX-bsT5x3ndtsM")
llm.google_gemini = genai.GenerativeModel(llm.model)

st.set_page_config(
    page_title="PandasAI Insight App",
    layout="wide",
    initial_sidebar_state="expanded",
)

styles = """
<style>
img {
    max-width: 50%;
}
.sidebar .sidebar-content {
    background-color: #f5f5f5;
}
</style>
"""

st.sidebar.title('PandasAI Insights')    
st.sidebar.subheader('AI Insights')
header = st.container()

with header:
    st.title("PandasAI Analysis App")
    st.markdown("Use this Streamlit app to analyze your data in one shot. You can upload your data and ask questions about it. The app will answer your questions and provide you with insights about your data.")
    
# Define main content
content = st.container()
with content:
    # Load sales dataset
    sale_file = st.file_uploader('Upload a CSV file', type=['csv'])
    if sale_file is not None:
        df = pd.read_csv(sale_file, encoding='latin-1')
        
        # Use session state to persist the SmartDataframe and its memory
        if "sdf" not in st.session_state:
            st.session_state.sdf = SmartDataframe(
                df, 
                config={
                    "llm": llm,
                    "verbose": True,
                    "enable_cache": True,
                    "custom_whitelisted_dependencies": ["ast", "numpy", "matplotlib", "seaborn"]
                }
            )
        
        st.dataframe(df)
        query = st.text_input(label='Enter your query')
        Analyze = st.button(label='Analyze')
        if Analyze and query:
            with st.spinner("Analyzing..."):
                result = st.session_state.sdf.chat(query)
                st.write(result)
    else:
        st.warning("Please select a CSV file to continue.")
        st.stop()