@echo off
echo Starting Prompt Detective v2.0 Frontend...
echo.

:: Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

:: Start the development server
echo Starting development server...
echo Frontend will be available at: http://localhost:3000
echo.
npm run dev

pause