# 🛡️ Users & Permissions Management Dashboard

A full-stack Role-Based Access Control (RBAC) system built with **NestJS**, **React**, and **PostgreSQL**.

## ✨ Features

### 🔐 Authentication & Security
- ✅ JWT-based authentication (access & refresh tokens)
- ✅ Password hashing with bcrypt
- ✅ Password reset functionality
- ✅ Rate limiting on authentication endpoints
- ✅ Secure HTTP-only cookie support

### 👥 User Management
- ✅ Create, Read, Update, Delete users
- ✅ Search users by name or email
- ✅ Pagination with customizable page size
- ✅ Sort by multiple fields
- ✅ Activate/deactivate user accounts
- ✅ Assign multiple roles to users

### 🎭 Role Management
- ✅ Create, Read, Update, Delete roles
- ✅ Attach/detach permissions from roles
- ✅ View role-permission relationships
- ✅ Prevent deletion of roles assigned to users

### 🔑 Permission System
- ✅ Granular permissions (user.create, user.read, etc.)
- ✅ Pre-seeded permission set
- ✅ Permission-based route guards

### 📝 Audit Logging
- ✅ Track all user/role/permission changes
- ✅ Store who made changes and when
- ✅ JSON-based change tracking
- ✅ IP address logging

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for auth
- **bcrypt** - Password hashing
- **class-validator** - DTO validation
- **Passport** - Authentication middleware

### Frontend
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Fetch API** - HTTP requests

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone <your-repo-url>
cd rbac-dashboard

# Start services
docker-compose up -d

# Backend will be on http://localhost:4000
# Frontend will be on http://localhost:3000
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start PostgreSQL
# Make sure PostgreSQL is running on port 5432

# Run migrations (auto-sync is enabled by default)
npm run start:dev

# Seed database
npm run seed
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 🔑 Default Credentials

After seeding, use these accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Admin | admin@example.com | password123 | All permissions |
| Manager | manager@example.com | password123 | User management |
| User | john.doe@example.com | password123 | Read-only |
| Viewer | bob.viewer@example.com | password123 | View-only |

