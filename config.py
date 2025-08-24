"""
Configuration settings for the AI Reverse Engineering System
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for the system"""
    
    # API Configuration
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct"  # Vision model for image analysis
    
    # API Limitations
    MAX_IMAGES_PER_REQUEST = 5   # Groq vision model limit
    
    # Video Processing Configuration
    VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm']
    IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp']
    
    # Frame Selection Parameters
    MIN_FRAME_DIFFERENCE = 0.15  # Minimum difference threshold for frame selection
    MAX_FRAMES_PER_VIDEO = 10    # Maximum frames to extract per video
    FRAME_RESIZE_WIDTH = 1024    # Resize frames for processing
    
    # Scene Detection Parameters
    SCENE_THRESHOLD = 30.0       # Threshold for scene change detection
    MIN_SCENE_LENGTH = 1.0       # Minimum scene length in seconds
    
    # Output Configuration
    OUTPUT_DIR = "analysis_results"
    FRAMES_DIR = "extracted_frames"
    
    # Prompt Enhancement
    DETAILED_ANALYSIS = True
    INCLUDE_TECHNICAL_DETAILS = True
    STYLE_ANALYSIS = True
    COMPOSITION_ANALYSIS = True
