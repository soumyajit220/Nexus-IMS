# Enterprise Incident Management System (E-IMS)

## 📌 Project Overview
The **Enterprise Incident Management System** is a robust, full-stack operational risk management platform designed to streamline IT support workflows. Unlike simple ticketing systems, E-IMS incorporates **Service Level Agreements (SLA)** monitoring, **Audit Trails**, and **Role-Based Analytics** to ensure accountability and operational efficiency.

Built with the **MERN Stack** (MongoDB, Express, React, Node.js) and styled with a modern **Tailwind CSS** enterprise theme.

---

## 🚀 Key Enterprise Features

### 1. SLA-Driven Incident Handling
- **Automated Deadlines**: System calculates resolution deadlines based on Priority (e.g., Critical = 4 hours).
- **Proactive Monitoring**: Real-time statuses (`On Track`, `Breached`) help agents prioritize work.

### 2. Comprehensive Audit Logging
- **Immutable History**: Every action (creation, status change, assignment) is cryptographically logged.
- **Compliance**: `AuditLog` collection tracks *who* changed *what* and *when*.

### 3. Role-Based Dashboards
- **User Portal**: Simple interface for reporting incidents and tracking status.
- **Agent Command Center**: "My Queue" view with SLA countdowns and quick-resolve actions.
- **Admin Analytics**: High-level metrics on system health, SLA compliance, and agent performance.

### 4. Intelligent Automation
- **AI Classification**: (Mock) Service automatically categorizes tickets (e.g., "Network", "Hardware") based on description keywords.
- **Auto-Prioritization**: Detects urgency words ("server down", "critical") to auto-set priority.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Context API.
- **Backend**: Node.js, Express.js (REST API).
- **Database**: MongoDB (with Mongoose ODM).
- **Security**: JWT Authentication, Bcrypt Hashing, Role-Based Access Control (RBAC).

---

## ⚡ Deployment & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Cloud)

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file with:
# MONGO_URI=mongodb://localhost:27017/smart-incident-db
# JWT_SECRET=your_jwt_secret
# PORT=5000

# Run Seeder (Optional: Creates Admin/Agent/User accounts)
node seeder.js

npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@example.com` | `password123` |
| **L1 Agent** | `agent1@example.com` | `password123` |
| **End User** | `alice@example.com` | `password123` |

---

## 👨‍💻 Viva/Presentation Talking Points
1. **"Why this stack?"**: Chosen for JSON consistency (Full JS), scalability, and rapid development.
2. **"How is it 'Enterprise'?"**: Focus on *Process* (SLAs) and *Governance* (Audit Logs), not just CRUD.
3. **"Future Scope"**: Integration with Slack/Teams bots, Email parsing for ticket creation, and ML-based predictive analytics.
