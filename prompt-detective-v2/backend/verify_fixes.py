"""
Quick verification script - Run this in the backend directory to check if fixes are applied
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def check_fix_1():
    """Check if progress data is merged in get_analysis_summary"""
    print("\n🔍 Checking Fix 1: Progress data in job summary...")
    
    with open('app/services/analysis.py', 'r', encoding='utf-8') as f:
        content = f.read()
        
    if 'from ..api.v1.progress import get_job_progress' in content:
        print("  ✅ Import statement found")
    else:
        print("  ❌ Missing import: from ..api.v1.progress import get_job_progress")
        return False
    
    if 'progress_data = get_job_progress(job.id)' in content:
        print("  ✅ Progress data retrieval found")
    else:
        print("  ❌ Missing: progress_data = get_job_progress(job.id)")
        return False
    
    if '"progress": progress_data.get("progress"' in content:
        print("  ✅ Progress field added to summary")
    else:
        print("  ❌ Missing: progress field in summary dict")
        return False
    
    if '"current_stage": progress_data.get("stage"' in content:
        print("  ✅ Current stage field added to summary")
    else:
        print("  ❌ Missing: current_stage field in summary dict")
        return False
    
    print("  ✅ Fix 1 APPLIED SUCCESSFULLY\n")
    return True

def check_fix_2():
    """Check if SQLite JSON query is fixed"""
    print("🔍 Checking Fix 2: SQLite-compatible JSON query...")
    
    with open('app/api/v1/progress.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "details.op('->>')('job_id')" in content:
        print("  ❌ BROKEN: Still using PostgreSQL JSON syntax")
        print("     Found: details.op('->>')('job_id')")
        return False
    
    if '.all()' in content and 'UsageLog' in content and 'user_id' in content:
        print("  ✅ Query all logs found")
    else:
        print("  ❌ Missing: Query all logs")
        return False
    
    if 'log.details.get(\'job_id\') == job_id' in content or 'log.details and log.details.get(\'job_id\')' in content:
        print("  ✅ Python-side filtering found")
    else:
        print("  ❌ Missing: Python-side filtering")
        return False
    
    print("  ✅ Fix 2 APPLIED SUCCESSFULLY\n")
    return True

def check_fix_3():
    """Check if asyncio is replaced with time module"""
    print("🔍 Checking Fix 3: Time module instead of asyncio...")
    
    with open('app/api/v1/progress.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'asyncio.get_event_loop().time()' in content:
        print("  ❌ BROKEN: Still using asyncio.get_event_loop().time()")
        return False
    
    if 'import time' in content:
        print("  ✅ Time module imported")
    else:
        print("  ❌ Missing: import time")
        return False
    
    if '"timestamp": time.time()' in content:
        print("  ✅ Using time.time() for timestamp")
    else:
        print("  ❌ Missing: time.time() call")
        return False
    
    print("  ✅ Fix 3 APPLIED SUCCESSFULLY\n")
    return True

def main():
    print("=" * 60)
    print("VERIFICATION: Critical Bug Fixes")
    print("=" * 60)
    
    results = {
        "Fix 1 (Progress in Summary)": check_fix_1(),
        "Fix 2 (SQLite JSON Query)": check_fix_2(),
        "Fix 3 (Time Module)": check_fix_3()
    }
    
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    all_passed = all(results.values())
    
    for fix_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {fix_name}: {status}")
    
    print("\n" + "=" * 60)
    
    if all_passed:
        print("🎉 ALL FIXES VERIFIED!")
        print("\nNext steps:")
        print("  1. Restart backend: uvicorn app.main:app --reload")
        print("  2. Test with a file upload")
        print("  3. Watch console for progress messages")
        print("  4. Test cancel button")
        return 0
    else:
        print("⚠️  SOME FIXES NOT APPLIED")
        print("\nPlease check the errors above and re-apply fixes.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
