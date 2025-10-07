# 🏭 FlowForge — Modular Manufacturing Management System

A **modular manufacturing management platform** that enables businesses to create, track, and manage their end-to-end production process digitally.  
FlowForge replaces fragmented spreadsheets and manual tracking with a centralized, intelligent, and user-friendly solution.

---

## 🚀 Tech Stack

**Frontend:**  
- [Next.js 15 (App Router)](https://nextjs.org/) + TypeScript  
- [Shadcn UI](https://ui.shadcn.com/) for beautiful, accessible components  
- Tailwind CSS for styling

**Backend:**  
- [Express.js](https://expressjs.com/) + TypeScript  
- JWT Authentication (Access + Refresh Tokens)  
- Role-based access control (Admin, Manager, Operator, Inventory)

**Database:**  
- [PostgreSQL](https://www.postgresql.org/)  
- [Drizzle ORM](https://orm.drizzle.team/) for schema-safe queries and migrations

---

## ⚙️ Core Features

### 🧩 Manufacturing Operations
- Create, edit, and manage **Manufacturing Orders (MO)**.
- Auto-generate **Work Orders (WO)** from linked **Bill of Materials (BOM)**.
- Track order progress by status: *Planned, In Progress, Done, Canceled*.

### 🧠 Work Orders Management
- Automatically created from BOM work steps.
- Assign to operators, update live status (*Started, Paused, Completed*).
- Custom WO creation for additional steps (e.g., Testing, QA, Packaging).

### 🏗️ Work Centers
- Define production centers, capacity, and cost per hour.
- Track utilization and downtime for accurate costing.

### 📦 Stock Ledger
- Real-time tracking of material movements and stock balances.
- Auto-update stock after work order completion.
- Supports both **raw materials** and **finished goods**.

### 📋 Bill of Materials (BOM)
- Define components and work steps per finished product.
- Link BOM to Manufacturing Orders for automatic workflow creation.

### 📊 Dashboard & Reports
- Real-time KPIs: completed, in-progress, delayed orders.
- Analytics dashboard for throughput, delays, and resource utilization.
