import streamlit as st
from streamlit_config import configure_page, load_custom_css, initialize_session_state
from components.navigation import app_header
from services.auth_service import current_user

configure_page(); load_custom_css(); initialize_session_state()

app_header("Prompt Detective — Reverse Engineer AI Content")

col1, col2 = st.columns([3,2])
with col1:
    st.markdown("""
    # Welcome to Prompt Detective
    Reverse engineer AI images and videos into precise, production-ready prompts.

    - Forensically accurate, multi-pass analysis
    - Smart frame selection for videos
    - Beautiful, copy-paste ready prompts
    """)
    if current_user():
        st.page_link("pages/05_🚀_Dashboard.py", label="Go to Dashboard", icon="🚀")
    else:
        st.page_link("pages/01_🔐_Login.py", label="Login to start", icon="🔐")
with col2:
    # use_column_width deprecated -> replaced by use_container_width
    st.image("samples/sample_image.jpg", caption="Example analysis result", use_container_width=True)

st.markdown("---")

st.markdown("""
### Why you'll love it
- Minimal, elegant interface
- Friendly onboarding
- Clear pricing and free daily analyses
""")
