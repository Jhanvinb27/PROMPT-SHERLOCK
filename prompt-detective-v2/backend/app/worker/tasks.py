"""
Background worker tasks for analysis processing
"""
import os
import sys
from pathlib import Path

# Add the original codebase to Python path
original_codebase = Path(__file__).parent.parent.parent.parent.parent
sys.path.append(str(original_codebase))

from ..services.analysis import process_analysis_job

# This module defines the background tasks that can be queued
# The actual task execution is handled in services/analysis.py

def start_worker():
    """Start the RQ worker process"""
    try:
        from rq import Worker
        from redis import Redis
        
        redis_conn = Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
        worker = Worker(["prompt-detective-queue"], connection=redis_conn)
        worker.work()
        
    except ImportError:
        print("Error: Redis and RQ are required for background processing")
        print("Install with: pip install redis rq")
        sys.exit(1)

if __name__ == "__main__":
    start_worker()