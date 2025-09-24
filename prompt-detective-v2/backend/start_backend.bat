@echo off
echo Starting Prompt Detective v2.0 Backend...
echo.

:: Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

:: Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

:: Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

:: Check if .env exists, if not copy from example
if not exist .env (
    echo Creating .env file from example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit .env file with your database credentials before running!
    echo.
    pause
)

:: Initialize database
echo Initializing database...
python -c "from app.database import create_tables; create_tables()"
echo.

:: Start the FastAPI server
echo Starting FastAPI server...
echo Backend will be available at: http://localhost:8000
echo API Documentation at: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause