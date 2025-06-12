# 🛒 Proyecto Tienda

Este es un proyecto Full Stack para gestionar una tienda virtual. Incluye:

- 🔧 Backend con Node.js, Express y MongoDB
- 💻 Frontend con React

---

## 📁 Estructura del proyecto

Proyecto_Tienda/
├── config/ # Configuración de la base de datos
├── models/ # Modelos de MongoDB (Mongoose)
├── routes/ # Rutas de la API
├── server.js # Servidor principal Express
├── frontend/ # Aplicación React
│ ├── public/
│ ├── src/
│ └── package.json
├── .env # Variables de entorno del backend
└── .gitignore

## 🚀 Cómo ejecutar

### 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/Proyecto_Tienda.git
cd Proyecto_Tienda 
```

### 2. Configurar el backend
📄 Crear el archivo .env en la raíz:

# Conectar MongoDB de forma remota:
```
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<contraseña>@base01.kldoepc.mongodb.net/tienda_virtual
```
# Conectar MongoDB de forma local:
```
MONGO_URI=mongodb://localhost:27017/tienda_virtual
PORT=5000
```
En una Terminal Bash Ejecutar los siguientes comandos:
🔧 Instalar dependencias e iniciar:
```bash
npm install
npm start
```

### 3. Ejecutar el Frontend
```bash
cd frontend
npm install
npm start
```

📍 Se abrirá automáticamente en: http://localhost:3000


### 🧪 Tecnologías utilizadas

* React

* Node.js

* Express

* MongoDB

* Mongoose

* Axios
