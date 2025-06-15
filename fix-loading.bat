@echo off
echo ====================================
echo   Solucionando "Cargando predicciones..."
echo ====================================
echo.

REM Crear carpeta de estilos
echo Creando carpeta de estilos...
if not exist "src\styles" mkdir src\styles

REM Crear archivo CSS básico
echo Creando archivo CSS básico...
echo /* Estilos temporales */ > src\styles\globals.css
echo body { margin: 0; font-family: sans-serif; } >> src\styles\globals.css

REM Crear TestLogin.js
echo Creando componente de prueba...
echo import React from 'react'; > src\TestLogin.js
echo import AuthSystem from './components/auth/AuthSystem'; >> src\TestLogin.js
echo function TestLogin() { return ^<AuthSystem /^>; } >> src\TestLogin.js
echo export default TestLogin; >> src\TestLogin.js

echo.
echo ====================================
echo   INSTRUCCIONES:
echo ====================================
echo.
echo 1. Abre src\index.js
echo 2. Cambia esta linea:
echo    import App from './App';
echo.
echo 3. Por esta:
echo    import App from './TestLogin';
echo.
echo 4. Guarda el archivo
echo 5. La pagina deberia recargar automaticamente
echo.
echo Si funciona, el problema esta en los Contexts
echo.
pause