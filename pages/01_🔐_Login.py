import streamlit as st
from streamlit_config import configure_page, load_custom_css, initialize_session_state
from components.navigation import app_header
from services.auth_service import login, signup, current_user

configure_page(); load_custom_css(); initialize_session_state()
app_header("Login")

if current_user():
    st.success("You're already logged in.")
    st.page_link("pages/05_🚀_Dashboard.py", label="Go to Dashboard", icon="🚀")
    st.stop()

st.markdown("### Welcome back")
with st.form("login_form"):
    email = st.text_input("Email")
    password = st.text_input("Password", type="password")
    submitted = st.form_submit_button("Login")

if submitted:
    res = login(email, password)
    if "error" in res:
        st.error(res["error"])    
    else:
        st.success("Logged in")
        st.rerun()

st.info("New here? Create an account.")
st.page_link("pages/02_📝_Sign_Up.py", label="Create account")
