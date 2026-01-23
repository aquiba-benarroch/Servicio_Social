# Servicio Social Comunidad Judía de México

## Descripción del Proyecto
Este proyecto tiene como objetivo crear una página web o aplicación donde los miembros de la comunidad judía de México puedan consultar y participar en servicios sociales disponibles. La plataforma busca incentivar la ayuda mutua y promover todos los servicios que la comunidad ofrece para apoyar a quienes lo necesitan.

## ¿Cómo funciona?
La idea principal es que cualquier persona que tenga tiempo libre pueda ingresar a la plataforma y encontrar oportunidades para realizar actos de bondad y servicio social. Los usuarios podrán ver las actividades disponibles, inscribirse y contribuir de manera activa al bienestar de la comunidad.

## Público objetivo
El proyecto está dirigido principalmente a los judíos de la comunidad judía de México, con el propósito de fortalecer los lazos comunitarios y fomentar la cultura de ayuda y solidaridad.

## Equipo de trabajo
### Desarrollo de la aplicación
- Aquiba Yudah Benarroch Bittan
- Aquiba Samuel Benarroch Serfaty
- Gabriel Masri Arakindji

### Comunicaciones y vinculación (Head Hunter)
- Jose Amkie Lobaton
- Salomon Achar Saad Mograbi
- Albert Harari Samra

## Tecnologías
- **Frontend**: React Admin
- **Backend**: Node.js/Express (API REST)
- **Base de datos**: MongoDB/PostgreSQL
- **Autenticación**: JWT
- **Hosting**: Vercel/Netlify

## Características principales
- 📋 Panel de administración para gestionar servicios sociales
- 👥 Sistema de registro y autenticación de usuarios
- 📅 Calendario de actividades y eventos
- 📊 Dashboard con estadísticas de participación
- 📱 Diseño responsive (móvil y desktop)
- 🔐 Sistema de permisos y roles

## Instalación y desarrollo

### Requisitos Previos
- Node.js v16 o superior
- MongoDB v4.4 o superior (local o MongoDB Atlas)
- Git

### Instalación Completa

1. Clonar el repositorio
```bash
git clone https://github.com/aquiba-benarroch/Servicio_Social.git
cd Servicio_Social
```

2. Instalar dependencias de backend y frontend
```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

3. Configurar variables de entorno

**Backend** - Crear `backend/.env`:
```bash
cd ../backend
cp .env.example .env
# Editar .env con tus configuraciones
```

**Frontend** - Crear `frontend/.env`:
```bash
cd ../frontend
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Asegurarse que MongoDB está corriendo
```bash
# Si tienes MongoDB instalado localmente:
mongod

# O usar MongoDB Atlas (cloud) configurando MONGODB_URI en backend/.env
```

5. Iniciar el proyecto

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# El backend correrá en http://localhost:3001
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm start
# El frontend correrá en http://localhost:3000
```

### Acceso Inicial

Al iniciar el backend por primera vez, se creará automáticamente un usuario super admin. Las credenciales se configuran en `backend/.env`:

- Email: `DEFAULT_ADMIN_EMAIL` (default: admin@leyajad.com)
- Contraseña: `DEFAULT_ADMIN_PASSWORD` (default: ChangeThisPassword123!)

⚠️ **IMPORTANTE**: Cambiar estas credenciales inmediatamente después del primer inicio de sesión.

### Scripts Disponibles

**Desde la raíz del proyecto**:
```bash
npm run install:all      # Instalar todas las dependencias
npm run dev:backend      # Iniciar backend en modo desarrollo
npm run dev:frontend     # Iniciar frontend en modo desarrollo
```

**Backend** (`cd backend`):
```bash
npm run dev              # Desarrollo con auto-reload
npm start                # Producción
npm test                 # Ejecutar tests
```

**Frontend** (`cd frontend`):
```bash
npm start                # Desarrollo
npm run build            # Build para producción
npm test                 # Ejecutar tests
```

## Diseño y organización
El proyecto se desarrollará con enfoque en la usabilidad, accesibilidad y diseño moderno, asegurando que la experiencia del usuario sea intuitiva y agradable. Se priorizará la organización semántica de la información y la facilidad para encontrar oportunidades de servicio social.

---
¡Juntos podemos hacer una diferencia positiva en nuestra comunidad!