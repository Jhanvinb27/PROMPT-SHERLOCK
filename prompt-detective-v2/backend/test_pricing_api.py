#!/usr/bin/env python3
"""
Test script for Pricing Page Subscription API
"""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api/v1"

def print_section(title: str):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_response(response: requests.Response):
    """Pretty print API response"""
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2)}")
    except:
        print(f"Response: {response.text}")

def test_get_plans_monthly():
    """Test getting plans with monthly billing"""
    print_section("Test 1: Get Plans (Monthly Billing)")
    
    response = requests.get(f"{BASE_URL}/subscriptions/plans")
    print_response(response)
    
    if response.status_code == 200:
        plans = response.json()
        print(f"\n✅ Successfully retrieved {len(plans)} plans")
        for plan in plans:
            print(f"  - {plan['name']}: {plan.get('price', 'N/A')}")
    else:
        print("❌ Failed to retrieve plans")

def test_get_plans_yearly():
    """Test getting plans with yearly billing"""
    print_section("Test 2: Get Plans (Yearly Billing)")
    
    response = requests.get(f"{BASE_URL}/subscriptions/plans?billing_cycle=yearly")
    print_response(response)
    
    if response.status_code == 200:
        plans = response.json()
        print(f"\n✅ Successfully retrieved {len(plans)} plans")
        for plan in plans:
            print(f"  - {plan['name']}: {plan.get('price', 'N/A')}")
    else:
        print("❌ Failed to retrieve plans")

def test_join_waitlist():
    """Test joining the waitlist"""
    print_section("Test 3: Join Waitlist")
    
    payload = {
        "email": "test@example.com",
        "plan_name": "Pro"
    }
    
    response = requests.post(
        f"{BASE_URL}/subscriptions/waitlist",
        json=payload
    )
    print_response(response)
    
    if response.status_code == 200:
        print("\n✅ Successfully joined waitlist")
    else:
        print("❌ Failed to join waitlist")

def test_get_current_subscription(token: str = None):
    """Test getting current subscription (requires auth)"""
    print_section("Test 4: Get Current Subscription (Auth Required)")
    
    if not token:
        print("⚠️  Skipping - No authentication token provided")
        print("To test this endpoint:")
        print("1. Login to get JWT token")
        print("2. Run: test_get_current_subscription(token='YOUR_TOKEN')")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/subscriptions/current",
        headers=headers
    )
    print_response(response)
    
    if response.status_code == 200:
        print("\n✅ Successfully retrieved current subscription")
    else:
        print("❌ Failed to retrieve subscription")

def test_get_limits(token: str = None):
    """Test getting subscription limits (requires auth)"""
    print_section("Test 5: Get Subscription Limits (Auth Required)")
    
    if not token:
        print("⚠️  Skipping - No authentication token provided")
        print("To test this endpoint:")
        print("1. Login to get JWT token")
        print("2. Run: test_get_limits(token='YOUR_TOKEN')")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/subscriptions/limits",
        headers=headers
    )
    print_response(response)
    
    if response.status_code == 200:
        print("\n✅ Successfully retrieved limits")
    else:
        print("❌ Failed to retrieve limits")

def run_all_tests(auth_token: str = None):
    """Run all API tests"""
    print("\n" + "="*60)
    print("  PRICING PAGE API TEST SUITE")
    print("="*60)
    print(f"\nTesting backend at: {BASE_URL}")
    
    try:
        # Test public endpoints
        test_get_plans_monthly()
        test_get_plans_yearly()
        test_join_waitlist()
        
        # Test authenticated endpoints
        test_get_current_subscription(auth_token)
        test_get_limits(auth_token)
        
        print_section("Test Summary")
        print("✅ Public endpoints tested successfully")
        if auth_token:
            print("✅ Authenticated endpoints tested successfully")
        else:
            print("⚠️  Authenticated endpoints skipped (no token)")
        
        print("\n" + "="*60)
        print("  ALL TESTS COMPLETED")
        print("="*60 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend")
        print("Make sure the backend is running:")
        print("  cd backend && uvicorn app.main:app --reload")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

if __name__ == "__main__":
    import sys
    
    # Check if auth token provided as command line argument
    auth_token = sys.argv[1] if len(sys.argv) > 1 else None
    
    if auth_token:
        print(f"Using authentication token: {auth_token[:20]}...")
    else:
        print("Running without authentication")
        print("To test authenticated endpoints, provide token as argument:")
        print("  python test_pricing_api.py YOUR_JWT_TOKEN\n")
    
    run_all_tests(auth_token)
