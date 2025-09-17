import streamlit as st
from streamlit_config import configure_page, load_custom_css, initialize_session_state
from components.navigation import app_header
from services.auth_service import current_user
from services.db import db

configure_page(); load_custom_css(); initialize_session_state()
app_header("Usage History")

user = current_user()
if not user:
    st.info("Please login first.")
    st.page_link("pages/01_🔐_Login.py", label="Login")
    st.stop()

st.subheader("Today's activity")
# Simple count; could expand to a table by reading from DB
used = db.count_user_daily_analyses(user.id)
st.write(f"Analyses today: {used}")
