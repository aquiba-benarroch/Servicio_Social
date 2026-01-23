# Backend - Servicio Social API

Backend API REST para la plataforma de servicios sociales.

## Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Hash de contraseñas

## Requisitos

- Node.js v16 o superior
- MongoDB v4.4 o superior (debe estar corriendo en tu máquina o usar MongoDB Atlas)

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

3. Configurar las variables de entorno en `.env`:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/servicio_social
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

## Ejecución

### Desarrollo (con auto-reload)
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Tests
```bash
npm test
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración (base de datos, etc.)
│   ├── controllers/     # Lógica de negocio
│   ├── models/          # Modelos de datos (Mongoose)
│   ├── routes/          # Definición de rutas
│   ├── middleware/      # Middleware (autenticación, etc.)
│   └── index.js         # Punto de entrada
├── package.json
└── .env.example
```

## Endpoints API

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token (requiere auth)

### Usuarios
- `GET /api/users` - Obtener todos los usuarios (requiere auth admin)
- `GET /api/users/:id` - Obtener usuario por ID (requiere auth)
- `PUT /api/users/:id` - Actualizar usuario (requiere auth)
- `DELETE /api/users/:id` - Eliminar usuario (requiere auth admin)

### Organizaciones
- `GET /api/organizations` - Obtener todas las organizaciones
- `GET /api/organizations/:id` - Obtener organización por ID
- `POST /api/organizations` - Crear organización (requiere auth)
- `PUT /api/organizations/:id` - Actualizar organización (requiere auth)
- `DELETE /api/organizations/:id` - Eliminar organización (requiere auth admin)

### Oportunidades
- `GET /api/opportunities` - Obtener todas las oportunidades
- `GET /api/opportunities/:id` - Obtener oportunidad por ID
- `POST /api/opportunities` - Crear oportunidad (requiere auth admin org)
- `PUT /api/opportunities/:id` - Actualizar oportunidad (requiere auth admin org)
- `DELETE /api/opportunities/:id` - Eliminar oportunidad (requiere auth admin org)

### Inscripciones (Signups)
- `POST /api/signups` - Inscribirse a una oportunidad (requiere auth)
- `GET /api/signups/volunteer/:id` - Obtener inscripciones de un voluntario (requiere auth)
- `GET /api/signups/opportunity/:id` - Obtener inscripciones de una oportunidad (requiere auth admin)
- `PUT /api/signups/:id` - Actualizar inscripción (requiere auth)
- `DELETE /api/signups/:id` - Cancelar inscripción (requiere auth)

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT
- ✅ Validación de roles y permisos
- ✅ Protección CORS
- ✅ Variables de entorno para secretos
- ⚠️ **IMPORTANTE**: Cambiar `JWT_SECRET` y credenciales de admin por defecto en producción

## Usuario Administrador por Defecto

Al iniciar el backend por primera vez, se crea automáticamente un usuario super admin:

- **Email**: Ver en tu `.env` (`DEFAULT_ADMIN_EMAIL`)
- **Contraseña**: Ver en tu `.env` (`DEFAULT_ADMIN_PASSWORD`)

⚠️ **IMPORTANTE**: Cambiar la contraseña inmediatamente después del primer inicio de sesión.

## Notas de Desarrollo

- El servidor incluye auto-reload con nodemon en modo desarrollo
- Los logs se muestran en consola
- La conexión a MongoDB se verifica al iniciar
- Si MongoDB no está disponible, el servidor seguirá corriendo en desarrollo pero mostrará un error
