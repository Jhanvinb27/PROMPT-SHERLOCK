"""
User-friendly error handling utilities
"""
from contextlib import contextmanager
import streamlit as st
import traceback

@contextmanager
def friendly_errors(context: str = ""):
    try:
        yield
    except Exception as e:
        st.error(f"Something went wrong. {context}")
        with st.expander("Show details"):
            st.code("\n".join(traceback.format_exc().splitlines()[-20:]))
