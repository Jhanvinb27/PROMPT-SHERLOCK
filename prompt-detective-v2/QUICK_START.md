# Prompt Detective v2.0 - Quick Start Guide

## 🚀 **Easy Windows Setup**

### **Option 1: One-Click Startup (Recommended)**

1. **Backend**: Double-click `backend/start_backend.bat`
2. **Frontend**: Double-click `frontend/start_frontend.bat`

### **Option 2: Manual Commands**

#### **Backend Setup:**
```powershell
cd "C:\Aditya\Python\Reverse Engineer Video\prompt-detective-v2\backend"

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment (IMPORTANT!)
copy .env.example .env
# Edit .env with your database credentials

# Initialize database
python -c "from app.database import create_tables; create_tables()"

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### **Frontend Setup:**
```powershell
cd "C:\Aditya\Python\Reverse Engineer Video\prompt-detective-v2\frontend"

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 **Prerequisites**

### **Required Software:**
- **Python 3.8+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL** (database)
- **Redis** (optional - for background tasks)

### **Database Setup:**
1. Install PostgreSQL
2. Create database: `prompt_detective`
3. Update `.env` with your credentials:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/prompt_detective
   ```

### **API Keys (Optional):**
- **GROQ API Key** - For AI analysis features
- **Google OAuth** - For social login

## 📱 **Access Your Application**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:3000/admin

## 🎯 **Key Features**

✅ **Modern React Frontend** with TypeScript  
✅ **FastAPI Backend** with async support  
✅ **JWT Authentication** with refresh tokens  
✅ **File Upload & Analysis** with progress tracking  
✅ **User Management** with profiles and subscriptions  
✅ **Admin Dashboard** for user management  
✅ **Responsive Design** with TailwindCSS  
✅ **Background Processing** with Redis + RQ  

## 🛟 **Troubleshooting**

### **Common Issues:**

1. **Database Connection Error:**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`

2. **Import Errors:**
   - Run `pip install -r requirements.txt` in backend
   - Run `npm install` in frontend

3. **Port Already in Use:**
   - Backend: Change port in start command (`--port 8001`)
   - Frontend: Will auto-assign different port

### **Reset Everything:**
```powershell
# Backend
cd backend
rmdir /s venv
rmdir /s __pycache__

# Frontend  
cd frontend
rmdir /s node_modules
rmdir /s dist
```

## 🎉 **You're Ready!**

Your Streamlit app has been successfully migrated to a modern, scalable SaaS platform!