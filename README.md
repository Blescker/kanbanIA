# 🧠 Plataforma de Gestión de Proyectos con IA – PGP-IA-TP2

Proyecto del curso **Taller de Proyectos 2** – Universidad Continental  
Aplicación web MERN con integración de **Inteligencia Artificial** y contenedores Docker.

---
## INTEGRANTES:
- FERRUZO IZQUIERDO JOCABED ISABEL
- CORILLA JUSCAMAITA SAID MARDUX
- ORTEGA BATALLA BRAULIO CESAR
- MUNIVE GUERRA JOSE ALEJANDRO
- SEGURA MEZA GIOVANNY LUIS EDUARDO
- SINCHE ALVARADO YERALD CRISTHIAN

## 🌐 Tecnologías

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + MongoDB + Socket.IO
- **IA:** LangChain + OpenAI
- **Infraestructura:** Docker + Docker Compose
- **Pruebas:** Jest, Cypress, Postman

---

## 📁 Estructura del Proyecto

```bash
PGP-IA-TP2/
├── gestion-APP/        # Frontend en React
├── backend/            # Backend en Node.js + Express
└── langchain-api/      # Servicio de IA con LangChain
```

---

## 🔧 Requisitos Previos

- Tener instalado [Docker](https://www.docker.com/products/docker-desktop)
- Tener instalado [Node.js](https://nodejs.org/) para ejecutar `npm install` localmente

> ⚠️ **IMPORTANTE**: Aunque Docker maneja las dependencias internas, **debes ejecutar `npm install` en tu máquina local** si deseas trabajar desde tu editor (VS Code, WebStorm, etc.), ya que los paquetes del contenedor **no se reflejan fuera** y podrías ver una carpeta `node_modules` vacía.

---

## 🚀 Pasos para Ejecutar el Proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/GiovannyLESM/PGP-IA-TP2.git
cd PGP-IA-TP2
```

---

### 2. Frontend (`gestion-APP`)

```bash
cd gestion-APP
npm install        # Instalación local para evitar errores en el editor
docker-compose up --build
```

Accede a: [http://localhost:5173](http://localhost:5173)

---

### 3. Backend (`backend`)

```bash
cd backend
npm install
docker-compose up --build
```

---

### 4. Servicio de IA (`langchain-api`)

```bash
cd langchain-api
pip install -r requirements.txt
docker-compose up --build
```

---

### 🔁 Reiniciar sin reconstruir contenedores

```bash
docker-compose up
```

Usa este comando si **no cambiaste dependencias ni el Dockerfile**.

---

### 🛑 Detener contenedores

```bash
docker-compose down
```

---

## 🔐 Variables de Entorno

- `backend/.env`:

  ```env
    PORT=5000
    MONGO_URI=url_de_tu_base_mongo
    JWT_SECRET=clave_secreta_segura
    LANGCHAIN_URL=http://tu-ip-actual-de-la-pc:5001
  ```

- `langchain-api/.env`:

  ```env
  OPENAI_API_KEY=tu_api_key_de_openai
  ```

- `gestion-APP/.env` (Frontend):
  ```env
  VITE_API_BASE_URL=http://localhost:5000/api
  VITE_SOCKET_URL=http://localhost:5000
  ```

Estas variables permiten una fácil configuración para despliegue local y remoto. Asegúrate de actualizarlas según el entorno.

---

## 🧪 Pruebas

- **Frontend (Cypress):**
  ```bash
  cd gestion-APP
  npm run cypress:open
  ```

---

## 🛠️ Problemas Comunes

| Error                                         | Solución                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| `Connection refused` entre frontend y backend | Asegúrate de que todos los contenedores están activos y usan la misma red Docker |
| `401 Unauthorized`                            | Verifica que se está enviando correctamente el token JWT                         |
| `docker-compose up` falla                     | Ejecuta `docker system prune -a` y verifica los archivos `Dockerfile` y `.env`   |

---

## 📚 Enlaces de Documentación

- [React](https://react.dev/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/docs/)
- [Docker](https://docs.docker.com/)
- [LangChain](https://js.langchain.com/docs/)

---

# 📘 Documentación de API - PGP-IA-TP2

Todas las rutas están protegidas por JWT. Agrega este header en cada petición:

```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 🔐 Autenticación

### 🟢 POST /api/auth/register

Crea un nuevo usuario.

**Body:**

```json
{
  "nombre": "Blesscker",
  "correo": "blesscker@demo.com",
  "password": "123456"
}
```

**Respuestas:**

- 201 Created:

```json
{ "msg": "Usuario registrado correctamente" }
```

- 400 / 500: Campos faltantes, duplicados o errores internos

### 🔐 POST /api/auth/login

Inicia sesión, devuelve token JWT.

**Body:**

```json
{
  "correo": "blesscker@demo.com",
  "password": "123456"
}
```

**Respuesta exitosa:**

```json
{
  "msg": "Login exitoso",
  "token": "...",
  "usuario": { "id": "...", "nombre": "Blesscker", "correo": "..." }
}
```

---

## 📁 Proyectos

### 📌 POST /api/projects

Crea un nuevo proyecto

**Body:**

```json
{ "nombre": "Mi proyecto", "descripcion": "Opcional" }
```

### 📌 GET /api/projects

Lista proyectos donde eres miembro

### 📌 GET /api/projects/:id

Obtiene detalles de un proyecto

### 📌 PUT /api/projects/:id

Edita nombre o descripción

### 📌 DELETE /api/projects/:id

Elimina el proyecto (solo propietario)

### 📌 POST /api/projects/:id/members

Agrega miembro por correo

**Body:**

```json
{ "correo": "correo@demo.com", "rol": "colaborador" }
```

### 📌 GET /api/projects/:id/members

Lista los miembros del proyecto

### 📌 DELETE /api/projects/:id/members/:memberId

Elimina un miembro del proyecto

---

## 🗂️ Listas (Kanban)

### ✅ POST /api/projects/:id/listas

Crea una lista en el proyecto

**Body:**

```json
{ "nombre": "To Do", "posicion": 0 }
```

### ✅ GET /api/projects/:id/listas

Obtiene todas las listas del proyecto

---

## 📌 Tarjetas

### ✅ POST /api/listas/:id/tarjetas

Crea una tarjeta en una lista

**Body:**

```json
{
  "titulo": "Crear API",
  "descripcion": "JWT + validación",
  "fechaInicio": "2025-05-15",
  "fechaFin": "2025-05-20"
}
```

### ✅ GET /api/listas/:id/tarjetas

Lista todas las tarjetas de una lista

### ✅ PUT /api/cards/:id

Editar título, descripción y fechas

### ✅ PATCH /api/tarjetas/:id/mover

Mover tarjeta a otra lista

**Body:**

```json
{ "nuevaListaId": "..." }
```

### ✅ PATCH /api/tarjetas/:id/completada

Cambiar estado de completada

**Body:**

```json
{ "completada": true }
```

---

## ✅ Asignaciones y Etiquetas

### ✅ PUT /api/cards/:id/assign

Asignar miembros a una tarjeta

**Body:**

```json
{ "miembros": ["userId1", "userId2"] }
```

### ✅ PATCH /api/cards/:id/etiquetas

Agregar etiqueta

```json
{ "nombre": "Urgente", "color": "#ff0000" }
```

### ✅ DELETE /api/cards/:id/etiquetas/:index

Eliminar etiqueta por índice

---

## ✅ Checklist

### ✅ PATCH /api/cards/:id/checklist

Agregar ítem

**Body:**

```json
{ "nombre": "Hacer login" }
```

### ✅ PATCH /api/cards/:id/checklist/:index

Actualizar completado

```json
{ "completado": true }
```

### ✅ DELETE /api/cards/:id/checklist/:index

Eliminar ítem del checklist

---

## 📎 Adjuntos

### ✅ PATCH /api/cards/:id/adjuntos

Agregar link

```json
{ "nombre": "Documento", "url": "https://..." }
```

### ✅ DELETE /api/cards/:id/adjuntos/:index

Eliminar link

---

## 💬 Mensajes

### ✅ POST /api/messages

Guardar mensaje de chat

```json
{ "contenido": "Hola", "proyectoId": "..." }
```

### ✅ GET /api/messages/:proyectoId

Obtener todos los mensajes

---

## 👤 Usuario

### ✅ GET /api/users/me

Obtiene tus datos

### ✅ PATCH /api/users/avatar

Actualizar avatar

```json
{ "avatar": "https://..." }
```

### ✅ PATCH /api/users/profile

Actualizar nombre/apellido

```json
{ "nombre": "Nuevo", "apellido": "Apellido" }
```

### ✅ PATCH /api/users/password

Cambiar contraseña

```json
{ "passwordActual": "123", "nuevaPassword": "456" }
```

---

## 📝 Notas

- Todas las rutas usan middleware `protect`
- El token JWT debe ir en los headers
- Las tarjetas dependen de listas, las listas dependen de proyectos
- Solo el propietario puede editar/eliminar proyectos y miembros

## 👨‍💻 Autor

**Braulio Cesar Ortega Batalla**  
📧 75142209@continental.edu.pe

---
# kanbanIA
