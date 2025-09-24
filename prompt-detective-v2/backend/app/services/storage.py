"""
File storage service for handling uploads - Cloud version
"""
import os
import tempfile
import uuid
from pathlib import Path
from typing import Tuple, Optional
from fastapi import UploadFile

from .cloud_storage import upload_file_to_cloud, generate_thumbnail_url

async def save_upload_file(file: UploadFile, user_id: int) -> Tuple[str, str, str]:
    """
    Save uploaded file to cloud storage and return (file_url, public_id, temp_path)
    """
    try:
        # Create a unique filename
        file_extension = Path(file.filename or "").suffix
        unique_filename = f"{user_id}_{uuid.uuid4()}{file_extension}"
        
        # Save to temporary file first
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Upload to cloud storage
        file_url, public_id = upload_file_to_cloud(
            temp_path, 
            unique_filename, 
            file.content_type or "application/octet-stream"
        )
        
        return file_url, public_id, temp_path
        
    except Exception as e:
        print(f"❌ Error saving upload file: {e}")
        # Clean up temp file if it exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.unlink(temp_path)
        raise

def cleanup_temp_file(temp_path: str):
    """Clean up temporary file"""
    try:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
    except Exception as e:
        print(f"⚠️ Warning: Could not clean up temp file {temp_path}: {e}")

def get_file_size(file_path: str) -> int:
    """Get file size in bytes"""
    try:
        return os.path.getsize(file_path)
    except:
        return 0