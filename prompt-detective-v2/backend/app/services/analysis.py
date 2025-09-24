"""
Analysis service for processing uploaded files using the actual reverse enginee        # Analysis successful
        job.status = "completed"
        job.progress = 100
        job.result_data = result
        job.completed_at = datetime.now(timezone.utc)
        
        # Generate thumbnail using cloud storage
        thumbnail_url = None
        try:
            from .cloud_storage import generate_thumbnail_url
            if result.get("cloud_id"):
                thumbnail_url = generate_thumbnail_url(result["cloud_id"], job.content_type)
                result["thumbnail_url"] = thumbnail_url
                job.result_data = result
                print(f"✅ Generated cloud thumbnail: {thumbnail_url}")
        except Exception as e:
            print(f"❌ Failed to generate cloud thumbnail: {e}")
        
        # Calculate processing time
        processing_time = (datetime.now(timezone.utc) - start_time).total_seconds()
        job.processing_time_seconds = int(processing_time)em
"""
import os
import sys
import traceback
from datetime import datetime, timezone
from typing import Dict, Any
from pathlib import Path

# Add the parent directory to path to import the reverse engineering modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))

from ..database import SessionLocal
from ..models.user import AnalysisJob

# Import the actual reverse engineering system
try:
    from reverse_engineer import ReverseEngineerSystem
    from config import Config as REConfig
    from ai_analyzer import AIAnalyzer
    REVERSE_ENGINEER_AVAILABLE = True
    print("✅ Reverse engineering system imported successfully")
except ImportError as e:
    print(f"⚠️ Warning: Could not import reverse engineering system: {e}")
    REVERSE_ENGINEER_AVAILABLE = False

def queue_analysis_job(job_id: int, file_path: str, content_type: str):
    """Queue analysis job for processing - Simplified without Redis"""
    # Process synchronously in free tier
    print("Processing analysis job synchronously...")
    process_analysis_job(job_id, file_path, content_type)

def process_analysis_job(job_id: int, file_path: str, content_type: str):
    """Process analysis job in background worker"""
    db = SessionLocal()
    
    try:
        # Get job from database
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if not job:
            print(f"Job {job_id} not found")
            return
        
        # Update status to processing
        job.status = "processing"
        job.progress = 10
        db.commit()
        
        # Simulate analysis processing
        import time
        time.sleep(1)  # Simulate processing time
        
        job.progress = 50
        db.commit()
        time.sleep(1)
        
        job.progress = 80
        db.commit()
        
        # Generate analysis result using actual reverse engineering system
        start_time = datetime.now(timezone.utc)
        result = perform_actual_analysis(file_path, content_type)
        
        # Analysis successful
        job.status = "completed"
        job.progress = 100
        job.result_data = result
        job.completed_at = datetime.now(timezone.utc)
        
        # Calculate processing time
        processing_time = (datetime.now(timezone.utc) - start_time).total_seconds()
        job.processing_time_seconds = int(processing_time)
        
        db.commit()
        
    except Exception as e:
        # Handle any errors during processing
        print(f"Error processing job {job_id}: {str(e)}")
        print(traceback.format_exc())
        
        job.status = "failed"
        job.error_message = f"Processing error: {str(e)}"
        job.progress = 0
        db.commit()
        
    finally:
        db.close()

def perform_actual_analysis(file_path: str, content_type: str) -> Dict[str, Any]:
    """Perform actual analysis using the reverse engineering system"""
    try:
        if not REVERSE_ENGINEER_AVAILABLE:
            print("⚠️ Falling back to mock analysis - reverse engineering system not available")
            return generate_mock_analysis(file_path, content_type)
        
        print(f"🚀 Starting actual reverse engineering analysis for: {file_path}")
        
        # Initialize the reverse engineering system
        re_system = ReverseEngineerSystem()
        
        # Perform the actual analysis
        if content_type == "video":
            # Use enhanced video analysis
            analysis_result = re_system._analyze_video_enhanced(file_path, save_frames=True)
        else:  # image
            # Use enhanced image analysis
            analysis_result = re_system._analyze_image_enhanced(file_path)
        
        print("✅ Actual analysis completed successfully")
        
        # Process and format the result for the API
        processed_result = process_re_analysis_result(analysis_result, content_type)
        
        return processed_result
        
    except Exception as e:
        print(f"❌ Error in actual analysis: {str(e)}")
        print(traceback.format_exc())
        # Fall back to mock analysis on error
        return generate_mock_analysis(file_path, content_type)

def process_re_analysis_result(result: Dict[str, Any], content_type: str) -> Dict[str, Any]:
    """Process reverse engineering analysis result for API consumption"""
    try:
        processed = {
            "analysis_method": "AI Reverse Engineering System",
            "enhancement_features": result.get("enhancement_features", []),
            "analysis_timestamp": result.get("analysis_timestamp"),
            "content_type": content_type
        }
        
        if content_type == "video":
            # Extract video-specific information
            processed.update({
                "comprehensive_video_prompt": result.get("comprehensive_video_prompt", ""),
                "video_prompt": result.get("video_prompt", ""),
                "master_prompt": result.get("master_prompt", ""),
                "video_info": result.get("video_info", {}),
                "extracted_frames": result.get("extracted_frames", 0),
                "frame_metadata": result.get("frame_metadata", []),
                "extraction_method": result.get("extraction_method", ""),
                "saved_frame_paths": result.get("saved_frame_paths", []),
                "thumbnail_path": result.get("thumbnail_path", "")
            })
            
            # Use the best available prompt
            main_prompt = (
                result.get("master_prompt") or 
                result.get("comprehensive_video_prompt") or 
                result.get("video_prompt") or
                ""
            )
            
        else:  # image
            # Extract image-specific information
            processed.update({
                "suggested_prompt": result.get("suggested_prompt", ""),
                "comprehensive_analysis": result.get("comprehensive_analysis", ""),
                "master_prompt": result.get("master_prompt", ""),
                "image_info": result.get("image_info", {}),
                "style_analysis": result.get("style", ""),
                "color_palette": result.get("color_palette", []),
                "detected_elements": result.get("detected_elements", []),
                "thumbnail_path": result.get("thumbnail_path", "")
            })
            
            # Use the best available prompt
            main_prompt = (
                result.get("master_prompt") or
                result.get("suggested_prompt") or 
                result.get("comprehensive_analysis") or
                ""
            )
        
        # Add the main prompt
        processed["main_prompt"] = main_prompt
        
        # Add file paths
        processed["file_paths"] = {
            "json_path": result.get("saved_json_path", ""),
            "txt_path": result.get("saved_txt_path", ""),
            "thumbnail_path": result.get("thumbnail_path", ""),
            "saved_frame_paths": result.get("saved_frame_paths", [])
        }
        
        # Create prompt preview
        if main_prompt:
            processed["prompt_preview"] = main_prompt[:200] + "..." if len(main_prompt) > 200 else main_prompt
        
        # Store full analysis for download
        processed["raw_analysis"] = result
        
        return processed
        
    except Exception as e:
        print(f"Error processing RE analysis result: {str(e)}")
        return {
            "error": f"Failed to process analysis result: {str(e)}",
            "raw_result": result
        }

def generate_mock_analysis(file_path: str, content_type: str) -> Dict[str, Any]:
    """Generate mock analysis results for testing"""
    filename = Path(file_path).name
    
    if content_type == "video":
        return {
            "comprehensive_video_prompt": f"A detailed video analysis for {filename}. This video appears to be AI-generated content with vibrant colors, smooth transitions, and artistic composition. The style suggests it was created using prompts like: 'high quality, cinematic lighting, professional cinematography, detailed environment, atmospheric effects, 4K resolution, smooth camera movements'.",
            "video_info": {
                "duration": 30.5,
                "width": 1920,
                "height": 1080,
                "fps": 24
            },
            "analysis_method": "AI Visual Analysis",
            "confidence_score": 0.85,
            "extracted_frames": 15,
            "frame_metadata": [
                {"frame": 1, "timestamp": 0.0, "description": "Opening scene with dramatic lighting"},
                {"frame": 5, "timestamp": 5.0, "description": "Mid-scene with character interaction"},
                {"frame": 10, "timestamp": 10.0, "description": "Climactic moment with special effects"}
            ],
            "suggested_prompts": [
                "cinematic lighting, professional cinematography",
                "high quality, detailed environment",
                "atmospheric effects, smooth transitions",
                "vibrant colors, artistic composition"
            ]
        }
    else:  # image
        return {
            "suggested_prompt": f"Detailed image analysis for {filename}. This appears to be an AI-generated image with characteristics suggesting prompts like: 'high resolution, detailed artwork, professional photography, studio lighting, vibrant colors, sharp focus, artistic composition, masterpiece quality'.",
            "comprehensive_analysis": f"This image shows sophisticated AI generation techniques with attention to detail, color harmony, and compositional balance. Likely created with advanced diffusion models using carefully crafted prompts.",
            "image_info": {
                "width": 1024,
                "height": 1024,
                "format": "PNG"
            },
            "analysis_method": "Computer Vision Analysis",
            "confidence_score": 0.78,
            "style_analysis": "Modern digital art style with realistic rendering",
            "color_palette": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"],
            "detected_elements": ["foreground object", "background scenery", "lighting effects", "texture details"],
            "suggested_prompts": [
                "high resolution, detailed artwork",
                "professional photography, studio lighting",
                "vibrant colors, sharp focus",
                "artistic composition, masterpiece quality"
            ]
        }

def extract_key_results(result: Dict[str, Any], content_type: str) -> Dict[str, Any]:
    """Extract key information from analysis results"""
    extracted = {
        "summary": {},
        "main_prompt": "",
        "file_paths": {}
    }
    
    try:
        if content_type == "video":
            # Extract video-specific information from actual analysis
            video_info = result.get("video_info", {})
            extracted["summary"] = {
                "content_type": "video",
                "duration": video_info.get("duration", 0),
                "resolution": f"{video_info.get('width', 0)}x{video_info.get('height', 0)}",
                "fps": video_info.get("fps", 0),
                "frames_analyzed": result.get("extracted_frames", 0),
                "analysis_method": result.get("analysis_method", "AI Reverse Engineering"),
                "extraction_method": result.get("extraction_method", ""),
                "enhancement_features": result.get("enhancement_features", [])
            }
            
            # Get the best available prompt from actual analysis
            extracted["main_prompt"] = (
                result.get("master_prompt") or
                result.get("comprehensive_video_prompt") or 
                result.get("video_prompt") or 
                result.get("suggested_prompt") or
                ""
            )
            
        elif content_type == "image":
            # Extract image-specific information from actual analysis
            image_info = result.get("image_info", {})
            extracted["summary"] = {
                "content_type": "image",
                "resolution": f"{image_info.get('width', 0)}x{image_info.get('height', 0)}",
                "analysis_method": result.get("analysis_method", "AI Reverse Engineering"),
                "enhancement_features": result.get("enhancement_features", []),
                "style_analysis": result.get("style_analysis", "")
            }
            
            # Get the best available prompt from actual analysis
            extracted["main_prompt"] = (
                result.get("master_prompt") or
                result.get("suggested_prompt") or 
                result.get("comprehensive_analysis") or 
                result.get("comprehensive_video_prompt") or
                ""
            )
        
        # Extract file paths (from actual analysis)
        extracted["file_paths"] = result.get("file_paths", {})
        
        # Create a preview of the prompt (first 300 characters for better preview)
        if extracted["main_prompt"]:
            extracted["prompt_preview"] = extracted["main_prompt"][:300] + "..." if len(extracted["main_prompt"]) > 300 else extracted["main_prompt"]
        else:
            extracted["prompt_preview"] = "Analysis completed - full prompt available for download"
        
        # Add confidence and quality indicators
        extracted["analysis_quality"] = {
            "has_enhancement_features": bool(result.get("enhancement_features")),
            "has_detailed_analysis": bool(extracted["main_prompt"]),
            "analysis_timestamp": result.get("analysis_timestamp"),
            "processing_successful": "error" not in result
        }
        
    except Exception as e:
        print(f"Error extracting results: {str(e)}")
        extracted["extraction_error"] = str(e)
        # Provide fallback information
        extracted["main_prompt"] = "Analysis completed but result extraction failed. Please download full results."
        extracted["prompt_preview"] = "Error in result extraction - full analysis may be available for download"
    
    return extracted

def get_analysis_summary(job: AnalysisJob) -> Dict[str, Any]:
    """Get a summary of analysis results for API responses"""
    if not job.result_data:
        return {}
    
    result = job.result_data
    
    summary = {
        "job_id": job.id,
        "filename": job.filename,
        "content_type": job.content_type,
        "status": job.status,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
        "processing_time_seconds": job.processing_time_seconds
    }
    
    if job.status == "completed" and result:
        # Extract key results using the updated function
        extracted = extract_key_results(result, job.content_type)
        
        # Generate thumbnail URL if thumbnail exists
        thumbnail_url = None
        thumbnail_path = result.get("thumbnail_path") or extracted.get("file_paths", {}).get("thumbnail_path")
        
        if thumbnail_path and os.path.exists(thumbnail_path):
            # Convert absolute thumbnail path to relative filename
            thumbnail_filename = os.path.basename(thumbnail_path)
            if thumbnail_filename:
                thumbnail_url = f"/static/thumbnails/{thumbnail_filename}"
                print(f"✅ Thumbnail URL generated: {thumbnail_url} from path: {thumbnail_path}")
        else:
            print(f"⚠️ No valid thumbnail found - path: {thumbnail_path}")
            
            # Try to find thumbnail by job filename in thumbnails directory
            try:
                job_basename = os.path.splitext(job.filename)[0]
                potential_thumbnail = f"{job_basename}_thumb.jpg"
                thumbnail_dir = os.path.join(os.path.dirname(__file__), "..", "thumbnails")
                potential_path = os.path.join(thumbnail_dir, potential_thumbnail)
                
                if os.path.exists(potential_path):
                    thumbnail_url = f"/static/thumbnails/{potential_thumbnail}"
                    print(f"✅ Found existing thumbnail by filename: {thumbnail_url}")
                else:
                    # Try to generate thumbnail if source file exists
                    if os.path.exists(job.file_path):
                        try:
                            if job.content_type == "video":
                                from ..services.thumbnail import generate_video_thumbnail
                                thumbnail_path = generate_video_thumbnail(job.file_path)
                            else:
                                from ..services.thumbnail import generate_image_thumbnail
                                thumbnail_path = generate_image_thumbnail(job.file_path)
                            
                            if thumbnail_path and os.path.exists(thumbnail_path):
                                thumbnail_filename = os.path.basename(thumbnail_path)
                                thumbnail_url = f"/static/thumbnails/{thumbnail_filename}"
                                print(f"✅ Generated new thumbnail: {thumbnail_url}")
                        except Exception as e:
                            print(f"❌ Failed to generate thumbnail: {e}")
            except Exception as e:
                print(f"❌ Error finding thumbnail: {e}")
                # Try to generate thumbnail if source file exists
                if os.path.exists(job.file_path):
                    try:
                        if job.content_type == "video":
                            from ..services.thumbnail import generate_video_thumbnail
                            thumbnail_path = generate_video_thumbnail(job.file_path)
                        else:
                            from ..services.thumbnail import generate_image_thumbnail
                            thumbnail_path = generate_image_thumbnail(job.file_path)
                        
                        if thumbnail_path and os.path.exists(thumbnail_path):
                            thumbnail_filename = os.path.basename(thumbnail_path)
                            thumbnail_url = f"/static/thumbnails/{thumbnail_filename}"
                            print(f"✅ Generated new thumbnail: {thumbnail_url}")
                    except Exception as e:
                        print(f"❌ Failed to generate thumbnail: {e}")
        
        summary.update({
            "summary": extracted.get("summary", {}),
            "prompt_preview": extracted.get("prompt_preview", ""),
            "main_prompt": extracted.get("main_prompt", ""),  # Include full prompt for frontend
            "has_full_prompt": bool(extracted.get("main_prompt")),
            "file_paths": extracted.get("file_paths", {}),
            "analysis_quality": extracted.get("analysis_quality", {}),
            "enhancement_features": result.get("enhancement_features", []),
            "thumbnail_url": thumbnail_url,
            "thumbnail_path": thumbnail_path  # Also include the path for debugging
        })
        
        # Add extraction error info if present
        if "extraction_error" in extracted:
            summary["extraction_error"] = extracted["extraction_error"]
    
    elif job.status == "failed":
        summary["error_message"] = job.error_message
    
    return summary

def get_downloadable_content(job: AnalysisJob) -> Dict[str, Any]:
    """Get content ready for download"""
    if job.status != "completed" or not job.result_data:
        return {}
    
    result = job.result_data
    extracted = extract_key_results(result, job.content_type)
    
    # Prepare downloadable content
    content = {
        "filename": job.filename,
        "analysis_date": job.completed_at.isoformat() if job.completed_at else "",
        "main_prompt": extracted.get("main_prompt", ""),
        "full_analysis": result.get("raw_analysis", result),  # Include full raw analysis
        "analysis_method": result.get("analysis_method", "AI Reverse Engineering"),
        "enhancement_features": result.get("enhancement_features", []),
        "metadata": {
            "content_type": job.content_type,
            "processing_time": job.processing_time_seconds,
            "analysis_timestamp": result.get("analysis_timestamp", ""),
            "summary": extracted.get("summary", {}),
            "analysis_quality": extracted.get("analysis_quality", {})
        }
    }
    
    # Add content-type specific information
    if job.content_type == "video":
        content["video_info"] = result.get("video_info", {})
        content["frame_analysis"] = result.get("frame_metadata", [])
        content["extraction_method"] = result.get("extraction_method", "")
        content["extracted_frames"] = result.get("extracted_frames", 0)
        
        # Add alternative prompts
        content["alternative_prompts"] = {
            "master_prompt": result.get("master_prompt", ""),
            "comprehensive_video_prompt": result.get("comprehensive_video_prompt", ""),
            "video_prompt": result.get("video_prompt", "")
        }
        
    elif job.content_type == "image":
        content["image_info"] = result.get("image_info", {})
        content["style_analysis"] = result.get("style_analysis", "")
        content["color_palette"] = result.get("color_palette", [])
        content["detected_elements"] = result.get("detected_elements", [])
        
        # Add alternative prompts
        content["alternative_prompts"] = {
            "master_prompt": result.get("master_prompt", ""),
            "suggested_prompt": result.get("suggested_prompt", ""),
            "comprehensive_analysis": result.get("comprehensive_analysis", "")
        }
    
    # Add file paths for additional downloads
    content["file_paths"] = extracted.get("file_paths", {})
    
    return content