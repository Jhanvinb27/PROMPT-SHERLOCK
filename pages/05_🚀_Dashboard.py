from components.auth_bootstrap import ensure_session_bootstrap
ensure_session_bootstrap()
import streamlit as st
from streamlit_config import configure_page, load_custom_css, initialize_session_state
from components.navigation import app_header
from components.onboarding import render_tooltip
from services.auth_service import current_user, can_analyze, track_usage
from reverse_engineer import ReverseEngineerSystem
from services.db import db
from models.analysis import Analysis
from datetime import datetime

configure_page(); load_custom_css(); initialize_session_state()
app_header("Dashboard")

user = current_user()
if not user:
    st.info("Please login first.")
    st.page_link("pages/01_🔐_Login.py", label="Login")
    st.stop()

st.info("Upload images or videos for analysis.")
render_tooltip('dashboard_upload')
plan = getattr(user, 'role', 'free')

with st.expander("Advanced Parameters (Pro)"):
    disabled = plan == 'free'
    st.selectbox("Vision Model", ["meta-llama/llama-4-maverick-17b-128e-instruct","llama-3.2-vision-preview"], index=0, disabled=disabled, help="Select model (upgrade to unlock")
    st.slider("Max Frames (override)", 3, 25, 10, disabled=disabled, help="Increase for better coverage (Pro)")
    if disabled:
        st.caption("Upgrade to Pro to customize model & frame count.")
    render_tooltip('dashboard_params')
files = st.file_uploader("Upload", type=['mp4','avi','mov','mkv','wmv','flv','webm','jpg','jpeg','png','bmp','tiff','webp'], accept_multiple_files=True)

if files:
    ok, msg = can_analyze(user)
    st.caption(msg)
    if not ok:
        st.warning("Limit reached. Visit Pricing to upgrade.")
        st.page_link("pages/04_💳_Pricing.py", label="See Pricing")
    else:
        sys = ReverseEngineerSystem()
        for f in files:
            import tempfile, os, time, pathlib
            # Preserve original extension so format detection works
            suffix = pathlib.Path(f.name).suffix or ""
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(f.getvalue()); tmp_path = tmp.name
            with st.spinner(f"Analyzing {f.name}..."):
                res = sys.analyze_content(tmp_path, save_frames=True)
            os.unlink(tmp_path)
            if 'error' in res:
                st.error(res['error'])
            else:
                track_usage(user.id, 'analyze', {"filename": f.name})
                st.success(f"Done: {f.name}")
                prompt = res.get('comprehensive_video_prompt') or res.get('suggested_prompt', '')
                if prompt:
                    st.text_area("Prompt", prompt, height=200)
                # Persist analysis summary
                try:
                    preview = (prompt[:180] + '…') if prompt and len(prompt) > 180 else (prompt or '')
                    content_type = res.get('content_type','unknown')
                    duration = res.get('video_info',{}).get('duration') if content_type=='video' else None
                    frames = res.get('extracted_frames') or res.get('frames_analyzed') if content_type=='video' else None
                    full_prompt_path = None  # could map to saved txt if needed later
                    thumbnail_path = None  # placeholder (frame saving already occurs in core logic)
                    analysis = Analysis(
                        id=None,
                        user_id=user.id,
                        content_type=content_type,
                        source_filename=f.name,
                        stored_path=res.get('source_file',''),
                        prompt_preview=preview,
                        full_prompt_path=full_prompt_path or '',
                        thumbnail_path=thumbnail_path or '',
                        duration=duration,
                        frames=frames,
                        created_at=datetime.utcnow()
                    )
                    db.save_analysis(analysis)
                except Exception as e:
                    st.caption(f"(Could not save analysis record: {e})")
