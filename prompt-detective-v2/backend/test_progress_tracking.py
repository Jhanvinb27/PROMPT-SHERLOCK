"""
Test script for progress tracking and cancellation
Run this after starting the backend server
"""
import requests
import time
import json

# Configuration
BASE_URL = "http://localhost:8000"
# You'll need to get a valid token from logging in
TOKEN = "YOUR_JWT_TOKEN_HERE"  # Replace with actual token

headers = {
    "Authorization": f"Bearer {TOKEN}"
}

def test_progress_tracking():
    """Test if progress updates are working"""
    print("\n=== Testing Progress Tracking ===\n")
    
    # Get a recent job
    response = requests.get(f"{BASE_URL}/api/v1/jobs", headers=headers)
    if response.status_code == 200:
        jobs = response.json().get('jobs', [])
        if jobs:
            job_id = jobs[0]['job_id']
            print(f"Testing with job ID: {job_id}")
            
            # Poll for progress
            for i in range(5):
                response = requests.get(f"{BASE_URL}/api/v1/jobs/{job_id}", headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    print(f"  Poll {i+1}: Status={data['status']}, Progress={data['progress']}%")
                time.sleep(1)
        else:
            print("No jobs found. Upload a file first.")
    else:
        print(f"Failed to get jobs: {response.status_code}")

def test_cancellation(job_id):
    """Test if cancellation works"""
    print(f"\n=== Testing Cancellation for Job {job_id} ===\n")
    
    # Try to cancel
    response = requests.delete(
        f"{BASE_URL}/api/v1/progress/{job_id}/cancel",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Cancellation successful:")
        print(f"  - Message: {data.get('message')}")
        print(f"  - Quota refunded: {data.get('quota_refunded')}")
    else:
        print(f"❌ Cancellation failed: {response.status_code}")
        print(f"  Response: {response.text}")

def check_backend_health():
    """Check if backend is running"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"⚠️ Backend returned status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running?")
        print(f"   Expected URL: {BASE_URL}")
        return False

if __name__ == "__main__":
    print("Backend Progress & Cancellation Test")
    print("=" * 50)
    
    # Check backend
    if not check_backend_health():
        print("\n⚠️ Please start the backend first:")
        print("   cd backend && uvicorn app.main:app --reload")
        exit(1)
    
    # Check token
    if TOKEN == "YOUR_JWT_TOKEN_HERE":
        print("\n⚠️ Please set a valid JWT token in this script")
        print("   1. Login at http://localhost:8000/docs")
        print("   2. Copy the token from the response")
        print("   3. Update TOKEN variable in this script")
        exit(1)
    
    # Run tests
    test_progress_tracking()
    
    # To test cancellation, uncomment and provide a job ID:
    # test_cancellation(123)  # Replace 123 with actual job ID
    
    print("\n" + "=" * 50)
    print("Tests complete!")
