import streamlit as st
from streamlit_config import configure_page, load_custom_css, initialize_session_state
from components.navigation import app_header

configure_page(); load_custom_css(); initialize_session_state()
app_header("Terms")

st.write("These are example Terms of Service for prototype. Replace with real legal text.")
