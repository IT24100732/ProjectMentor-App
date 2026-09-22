# ProjectMentor

ProjectMentor is a comprehensive platform designed to provide student developers with customized project roadmaps. It simplifies the transition from learning to building by offering tailored project milestones, resource recommendations, and progress tracking mechanisms based on individual student needs.

## 🏗️ Architecture & Tech Stack

ProjectMentor is built as a modern full-stack application spanning web, mobile, and backend services.

- **Backend API:** .NET 8, C#, Entity Framework Core, PostgreSQL
- **Web App:** React 18, Vite, React Router
- **Mobile App:** Flutter (Android/iOS client)
- **Infrastructure:** Docker & Docker Compose (Database hosting)

---

## 🚀 Current Progress (Completed Features)

This is an ongoing project. Here are the parts that have already been covered and implemented:

### ⚙️ Backend Services
- **Authentication & Authorization:** Secure JWT-based authentication system with role-based access control (Student/Admin).
- **Core Entities & Database:** Fully configured PostgreSQL database schema via EF Core Code-First migrations.
- **Agent Workflow System:** Simulated multi-agent orchestration (Planner, Resource, Analysis, and Validation agents) for intelligent roadmap generation.
- **RESTful Endpoints:** Complete API controllers for managing intake requests, roadmaps, and the resource catalog.

### 🌐 Web Frontend
- **User Onboarding:** Complete Login and Registration flows.
- **Student Intake:** An interactive intake form allowing students to submit their project parameters, deadlines, and time availability.
- **Roadmap Management:** 
  - A dashboard to view all requested roadmaps.
  - Detailed roadmap views showcasing specific milestones, phases, due dates, and recommended resources.
- **Resource Hub:** A centralized hub to browse learning resources.

### 📱 Mobile Client (Flutter)
- **Workflow Client:** A minimal, focused mobile application for students to track their roadmap progress on the go.
- **Authentication Flow:** Registration and login capabilities.
- **Quick Approvals:** Ability to review generated roadmaps and accept or request revisions directly from the mobile app.

---

## 🚧 Upcoming Features / Ongoing Work

- **Interactive Planning Workspace:** Turning an approved intake into an actionable workspace with drag-and-drop milestones.
- **Progress Tracking & Analytics:** Real-time milestone status, overdue notifications, and overall completion tracking.
- **Guidance Library:** Built-in templates for project reports, presentations, and deployment checklists.
- **Admin Dashboard:** Administrative tools for managing the resource catalog and monitoring system usage.

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js & npm](https://nodejs.org/)
- [Flutter SDK](https://flutter.dev/docs/get-started/install)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Database Setup
Start the PostgreSQL database using Docker Compose:
```bash
docker-compose up -d
```

### 2. Backend (Web API)
Navigate to the backend directory, apply migrations, and run the API:
```bash
cd backend/ProjectMentor.Api
dotnet ef database update
dotnet run
```
*The API will start and seed initial data automatically in the development environment. Swagger UI is available for testing endpoints.*

### 3. Web Frontend
Open a new terminal and start the Vite development server:
```bash
cd web
npm install
npm run dev
```

### 4. Mobile App
Ensure you have an emulator running or a device connected, then launch the Flutter app:
```bash
cd mobile
flutter pub get
flutter run
```

---

## 📄 License
*To be determined.*
