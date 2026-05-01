@echo off
echo Starting Apn-E-Dukaan Development Servers...

:: Start the Django backend on port 8002 in a new window
echo Starting Django Backend on port 8002...
cd backend
start "Backend Server (Port 8002)" cmd /k "python manage.py runserver 8002"
cd ..

:: Start the React (Vite) frontend in a new window
echo Starting React Frontend...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo Done! Both servers are starting up in separate windows.
pause
