import streamlit as st
from streamlit_config import configure_page, load_custom_css, initialize_session_state
from components.navigation import app_header

configure_page(); load_custom_css(); initialize_session_state()
app_header("Privacy Policy")

st.write("Prototype privacy policy. Update for production.")
