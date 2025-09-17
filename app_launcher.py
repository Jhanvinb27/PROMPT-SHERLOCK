"""Unified launcher with graceful fallback to legacy interface.

Usage:
  streamlit run app_launcher.py

Behavior:
  1. Attempt to redirect user into modern multipage Home page.
  2. If critical import / runtime errors occur (e.g., new pages broken), offer
     immediate fallback to legacy single-page interface (streamlit_app.py)
     without touching core analysis logic.
  3. Surface diagnostics to help rapid recovery while keeping tool usable.
"""
import streamlit as st
from datetime import datetime

def _try_new_ui():
    try:
        st.switch_page("pages/00_🏠_Home.py")
    except Exception as e:
        raise RuntimeError(f"Failed to switch to new UI: {e}")

def _run_legacy():
    try:
        import streamlit_app as legacy
        legacy.main()
    except Exception as e:
        st.error("Legacy interface also failed to load.")
        st.exception(e)

def main():
    st.set_page_config(page_title="Prompt Detective Launcher", page_icon="🧪", layout="wide")
    st.markdown("# Prompt Detective Launcher")
    st.caption("Unified entry — attempting to load modern experience.")
    try:
        _try_new_ui()
    except Exception as err:
        st.warning("Modern multipage UI failed to initialize. You can continue using the legacy interface below.")
        with st.expander("Diagnostics", expanded=False):
            st.code(str(err))
        col1, col2 = st.columns([1,1])
        with col1:
            if st.button("Retry New UI", type="primary"):
                st.rerun()
        with col2:
            if st.button("Load Legacy Interface"):
                _run_legacy(); return
        st.markdown("---")
        st.caption("If issues persist, inspect recent changes or restore previous commit.")

if __name__ == "__main__":
    main()
