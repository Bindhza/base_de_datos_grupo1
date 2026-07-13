# base_de_datos_-grupo1

## Cómo ejecutar el proyecto

Este proyecto está dividido en dos partes: el Backend (Django) y el Frontend (React con Vite). **Debes ejecutar ambos simultáneamente en dos consolas distintas.**

### 1. Ejecutar el Backend (Django)
Abre una terminal y sigue estos pasos:
1. Activar el entorno virtual: `.venv\Scripts\activate` (o `venv\Scripts\activate`)
2. Instalar las dependencias de Python: `pip install -r requirements.txt`
3. Ir a la carpeta del backend: `cd lubrishell_web`
4. Ejecutar el servidor: `python manage.py runserver`
*(El backend quedará corriendo en `http://localhost:8000`)*

### 2. Ejecutar el Frontend (React/Vite)
Abre una **nueva terminal** (manteniendo la del backend abierta) y sigue estos pasos:
1. Ir a la carpeta del frontend: `cd frontend`
2. Instalar las dependencias de Node.js (solo es necesario la primera vez): `npm install`
   *(Nota: Si hay problemas de compatibilidad con Vite, puedes usar `npm install vite@5 @vitejs/plugin-react@4`)*
3. Ejecutar el servidor de desarrollo: `npm run dev`
*(El frontend quedará corriendo típicamente en `http://localhost:5173`)*

Una vez que ambos servidores estén corriendo, abre tu navegador y entra a la dirección que te indicó el frontend (usualmente `http://localhost:5173`) para usar la aplicación.