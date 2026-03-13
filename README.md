# ATSC — Andes Talleres Sporting Club
## Sistema de Gestión — React + Node.js + PostgreSQL

---

## 📁 Estructura del proyecto

```
atsc-app/
├── frontend/          ← React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/layout/   ← Header, Navbar, Layout
│   │   ├── pages/               ← Home, Dashboard, Jugadores...
│   │   ├── context/             ← AuthContext
│   │   ├── services/            ← api.js (axios)
│   │   └── App.jsx              ← Rutas
│   └── package.json
│
└── backend/           ← Node.js + Express + Prisma
    ├── src/
    │   ├── routes/    ← auth, personas, partidos, torneos...
    │   ├── middleware/ ← auth JWT
    │   └── prisma/    ← schema.prisma (modelo de BD)
    └── package.json
```

---

## 🚀 Instalación y arranque

### 1. Requisitos previos
- Node.js 18+
- PostgreSQL instalado y corriendo
- VS Code

### 2. Clonar/abrir en VS Code
Abrí la carpeta `atsc-app` en VS Code.

### 3. Configurar base de datos
```bash
# Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE atsc_db;"
```

### 4. Configurar backend
```bash
cd backend

# Instalar dependencias
npm install

# Copiar y editar variables de entorno
cp .env.example .env
# Editá .env con tus credenciales de PostgreSQL

# Crear las tablas en la BD
npx prisma migrate dev --name init --schema src/prisma/schema.prisma

# (Opcional) Ver la BD visualmente
npx prisma studio --schema src/prisma/schema.prisma
```

### 5. Configurar frontend
```bash
cd frontend
npm install
```

### 6. Correr el proyecto

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Corre en http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Corre en http://localhost:3000
```

---

## 🗂️ Módulos del sistema

| Módulo         | Ruta frontend    | API backend          | Estado     |
|----------------|------------------|----------------------|------------|
| Home público   | `/`              | —                    | ✅ Listo   |
| Login          | navbar           | `POST /api/auth/login` | ✅ Listo |
| Dashboard      | `/dashboard`     | `GET /api/estadisticas/resumen` | ✅ Listo |
| Jugadores      | `/jugadores`     | `GET/POST/PUT /api/personas` | 🔜 Etapa 2 |
| Partidos       | `/partidos`      | `GET/POST /api/partidos` | 🔜 Etapa 2 |
| Torneos        | `/torneos`       | `GET/POST /api/torneos` | 🔜 Etapa 2 |
| Estadísticas   | `/estadisticas`  | `GET /api/estadisticas` | 🔜 Etapa 2 |
| Cuotas         | `/cuotas`        | `GET/POST /api/cuotas` | 🔜 Etapa 2 |
| Asistencia     | `/asistencia`    | `GET/POST /api/asistencias` | 🔜 Etapa 2 |

---

## 🛠️ Tecnologías

- **Frontend:** React 18 + Vite + TailwindCSS + React Query + React Router
- **Backend:** Node.js + Express + Prisma ORM
- **Base de datos:** PostgreSQL
- **Auth:** JWT (jsonwebtoken) + bcrypt

---

## 📌 Usuario admin inicial

Después de correr las migraciones, crear un usuario admin en la BD:

```sql
INSERT INTO usuarios (usuario, password, nombre, "tipoId", activo)
VALUES ('admin', '$2b$10$HASH_AQUI', 'Administrador', 1, true);
```

O usar el seed:
```bash
cd backend
npm run db:seed
```
