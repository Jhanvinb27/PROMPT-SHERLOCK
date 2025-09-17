import streamlit as st
from streamlit_config import configure_page, load_custom_css, initialize_session_state
from components.navigation import app_header

configure_page(); load_custom_css(); initialize_session_state()
app_header("Help & FAQ")

st.markdown("""
### Frequently asked questions
- How many free analyses? — 5/day on Free plan.
- What about privacy? — We only store usage counts, not your files.
- Billing? — Stripe-ready; add keys to enable.
""")

st.subheader("Contact support")
st.write("Email: support@example.com")
