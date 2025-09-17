from components.auth_bootstrap import ensure_session_bootstrap
ensure_session_bootstrap()
import streamlit as st
from streamlit_config import configure_page, load_custom_css, initialize_session_state
from components.navigation import app_header
from components.onboarding import render_tooltip
from services.auth_service import current_user
from services.db import db
from datetime import datetime
import pandas as pd

configure_page(); load_custom_css(); initialize_session_state()
app_header("Usage & History")

user = current_user()
if not user:
    st.info("Login to view analysis history")
    st.page_link("pages/01_🔐_Login.py", label="Login")
    st.stop()

st.markdown("### Your Analyses")
render_tooltip('usage_history')
used = db.count_user_daily_analyses(user.id)
st.caption(f"Analyses today: {used}")

col_search, col_type, col_limit = st.columns([3,1,1])
with col_search:
    q = st.text_input("Search", placeholder="filename or prompt text…")
with col_type:
    type_filter = st.selectbox("Type", ["All","image","video"], index=0)
with col_limit:
    limit = st.number_input("Limit", min_value=10, max_value=500, value=100, step=10)

rows = db.list_analyses(user.id, limit=limit)
records = []
for r in rows:
    (aid, uid, content_type, source_filename, stored_path, prompt_preview, full_prompt_path, thumbnail_path, duration, frames, created_at) = r
    records.append({
        "ID": aid,
        "Type": content_type,
        "File": source_filename,
        "Preview": (prompt_preview or '')[:120],
        "Duration(s)": duration if content_type=='video' else None,
        "Frames": frames if content_type=='video' else None,
        "Created": created_at
    })

df = pd.DataFrame(records)
if type_filter != "All":
    df = df[df.Type.str.lower()==type_filter.lower()]
if q:
    ql = q.lower()
    df = df[df.apply(lambda row: ql in str(row.File).lower() or ql in str(row.Preview).lower(), axis=1)]

st.dataframe(df, use_container_width=True, height=500)
st.caption(f"Showing {len(df)} record(s). Newest first.")

if not df.empty:
    with st.expander("Record details & actions"):
        selected_id = st.number_input("Analysis ID", min_value=int(df.ID.min()), max_value=int(df.ID.max()), value=int(df.ID.iloc[0]))
        sel = df[df.ID==selected_id]
        if not sel.empty:
            row = sel.iloc[0]
            st.markdown(f"**File:** {row.File}  |  **Type:** {row.Type}  |  **Created:** {row.Created}")
            st.markdown(f"**Prompt Preview:** {row.Preview}")
            st.caption("(Full prompt path not yet stored; future enhancement will link txt file)")
