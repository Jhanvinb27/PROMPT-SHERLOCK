import streamlit as st
from streamlit_config import configure_page, load_custom_css, initialize_session_state
from components.navigation import app_header
from services.auth_service import current_user, can_analyze, track_usage
from reverse_engineer import ReverseEngineerSystem

configure_page(); load_custom_css(); initialize_session_state()
app_header("Dashboard")

user = current_user()
if not user:
    st.info("Please login first.")
    st.page_link("pages/01_🔐_Login.py", label="Login")
    st.stop()

st.info("Upload images or videos for analysis.")
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
