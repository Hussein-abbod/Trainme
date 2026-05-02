import cloudinary
import cloudinary.uploader
from fastapi import HTTPException
from app.config import get_settings

import os
import re

settings = get_settings()

if settings.CLOUDINARY_URL:
    match = re.match(r'cloudinary://([^:]+):([^@]+)@(.+)', settings.CLOUDINARY_URL)
    if match:
        cloudinary.config(
            api_key=match.group(1),
            api_secret=match.group(2),
            cloud_name=match.group(3),
            secure=True
        )

def upload_file_to_cloudinary(file_bytes: bytes, folder: str, resource_type: str = "auto") -> str:
    """
    Uploads a file (in bytes) to Cloudinary and returns the secure URL.
    """
    if not settings.CLOUDINARY_URL:
        raise HTTPException(status_code=500, detail="Cloudinary is not configured.")
        
    try:
        response = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            resource_type=resource_type
        )
        return response.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {str(e)}")
