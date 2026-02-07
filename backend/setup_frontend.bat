@echo off
echo Creating React + Vite frontend...
cd ..
call npm create vite@latest frontend -- --template react
cd frontend
call npm install
call npm install -D tailwindcss postcss autoprefixer
call npx tailwindcss init -p
call npm install axios react-router-dom recharts lucide-react
echo Frontend setup complete!
