# Megasys - Sistema de Gestión Empresarial

Sistema integral para gestión de sedes, personal, inventarios y remitos para empresas de infraestructura IT.

## 🚀 Características

- Gestión completa de sedes y personal
- Control de inventarios con sistema de préstamos
- Flujo de remitos con estados y confirmaciones
- Generación automática de PDFs
- Sistema de auditoría completo
- Dashboard con métricas en tiempo real
- Autenticación con Microsoft Entra ID
- Notificaciones por email automáticas

## 🛠️ Stack Tecnológico

### Backend
- Node.js + Express
- PostgreSQL + Sequelize ORM
- Microsoft Entra ID (Azure AD)
- Puppeteer (PDFs)
- Nodemailer (Emails)
- Node-cron (Tareas programadas)

### Frontend
- React + Vite
- Tailwind CSS
- React Query
- React Router v6
- MSAL React (Azure AD)

## 📋 Requisitos Previos

- Docker y Docker Compose
- Node.js 18+ (desarrollo local)
- PostgreSQL 15+ (si no usas Docker)
- Cuenta de Azure AD configurada

## 🔧 Instalación

### Usando Docker (Recomendado)

1. Clonar el repositorio:
\`\`\`bash
git clone https://github.com/tu-usuario/megasys.git
cd megasys
\`\`\`

2. Configurar variables de entorno:
\`\`\`bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Editar los archivos .env con tus configuraciones
\`\`\`

3. Construir y ejecutar:
\`\`\`bash
make build
make up
make migrate
make seed  # Opcional: cargar datos de prueba
\`\`\`

4. Acceder a la aplicación:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- PostgreSQL: localhost:5432

### Instalación Local

1. Backend:
\`\`\`bash
cd backend
npm install
npm run migrate
npm run seed  # Opcional
npm run dev
\`\`\`

2. Frontend:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 📁 Estructura del Proyecto

- `/backend` - API REST con Node.js
- `/frontend` - Aplicación React
- `/docker` - Configuraciones Docker
- `/docs` - Documentación adicional

## 🔐 Seguridad

- Autenticación con Azure AD
- JWT para sesiones
- Auditoría automática de cambios
- Permisos basados en grupos AD
- Rate limiting en API

## 📊 Base de Datos

El sistema utiliza PostgreSQL con las siguientes entidades principales:
- Sedes
- Personal
- Inventario
- Remitos
- Préstamos
- Auditoría

## 🧪 Testing

\`\`\`bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
\`\`\`

## 📝 Documentación API

La documentación completa de la API está disponible en:
http://localhost:4000/api/docs

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

## 👥 Equipo

- Desarrollo: [Tu nombre]
- Contacto: [tu-email@company.com]