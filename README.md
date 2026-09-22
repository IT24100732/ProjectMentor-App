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
