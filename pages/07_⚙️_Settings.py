import streamlit as st
from streamlit_config import configure_page, load_custom_css, initialize_session_state
from components.navigation import app_header

configure_page(); load_custom_css(); initialize_session_state()
app_header("Settings")

mode = st.selectbox("Theme", ["light","dark"], index=0)
st.checkbox("Email notifications", value=True)
st.success("Settings saved (session-only for prototype)")
