#!/bin/bash
# setup.sh - Quick Setup Script for Grok SDR System

echo "🚀 Setting up Grok SDR System..."

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }

# Create project structure
echo "📁 Creating project structure..."
mkdir -p grok-sdr-system/backend/app
mkdir -p grok-sdr-system/frontend/src

cd grok-sdr-system

# Setup Backend
echo "🔧 Setting up backend..."
cd backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy python-dotenv httpx pydantic[email] python-multipart

# Create .env file
echo "📝 Creating .env file..."
cat > .env << EOF
GROK_API_KEY=your_grok_api_key_here
DATABASE_URL=sqlite:///./sdr_system.db
EOF

echo "⚠️  Please edit backend/.env and add your Grok API key!"

# Create __init__.py
touch app/__init__.py

cd ..

# Setup Frontend
echo "🎨 Setting up frontend..."
cd frontend

# Initialize package.json
npm init -y
npm install react react-dom axios
npm install -D vite @vitejs/plugin-react

# Update package.json scripts
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="vite build"
npm pkg set scripts.preview="vite preview"

cd ../..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add your Grok API key to grok-sdr-system/backend/.env"
echo "2. Copy the Python files to grok-sdr-system/backend/app/"
echo "3. Copy the React files to grok-sdr-system/frontend/src/"
echo "4. Start the backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "5. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🎉 Happy coding!"

# setup.bat - Windows Setup Script
@echo off
echo 🚀 Setting up Grok SDR System...

REM Check prerequisites
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 3 is required but not installed.
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not installed.
    exit /b 1
)

REM Create project structure
echo 📁 Creating project structure...
mkdir grok-sdr-system\backend\app 2>nul
mkdir grok-sdr-system\frontend\src 2>nul

cd grok-sdr-system

REM Setup Backend
echo 🔧 Setting up backend...
cd backend

REM Create Python virtual environment
python -m venv venv
call venv\Scripts\activate

REM Install dependencies
pip install fastapi uvicorn sqlalchemy python-dotenv httpx pydantic[email] python-multipart

REM Create .env file
echo 📝 Creating .env file...
(
echo GROK_API_KEY=your_grok_api_key_here
echo DATABASE_URL=sqlite:///./sdr_system.db
) > .env

echo ⚠️  Please edit backend\.env and add your Grok API key!

REM Create __init__.py
type nul > app\__init__.py

cd ..

REM Setup Frontend
echo 🎨 Setting up frontend...
cd frontend

REM Initialize package.json
call npm init -y
call npm install react react-dom axios
call npm install -D vite @vitejs/plugin-react

cd ..\..

echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Add your Grok API key to grok-sdr-system\backend\.env
echo 2. Copy the Python files to grok-sdr-system\backend\app\
echo 3. Copy the React files to grok-sdr-system\frontend\src\
echo 4. Start the backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo 5. Start the frontend: cd frontend ^&^& npm run dev
echo.
echo 🎉 Happy coding!