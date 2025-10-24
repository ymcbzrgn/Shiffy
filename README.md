# Shiffy - AI-Powered Shift Management System

**Smart shift scheduling for part-time employees powered by Meta's Llama AI**

<p align="center">
  <img src="https://img.shields.io/badge/Hackathon-Meta%20%26%20YTU%20Llama-blue?style=for-the-badge" alt="Hackathon" />
  <img src="https://img.shields.io/badge/Theme-Productivity%20Tools-green?style=for-the-badge" alt="Theme" />
  <img src="https://img.shields.io/badge/Status-MVP-orange?style=for-the-badge" alt="Status" />
</p>

---

## 📋 Table of Contents

- [About](#-about)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [Team](#-team)
- [License](#-license)

---

## 🎯 About

**Shiffy** is a mobile-first B2B2C platform that revolutionizes shift management for businesses with part-time employees. Built during the **Meta & YTU Llama Hackathon 2025**, Shiffy leverages Meta's Llama AI models to automatically generate optimal shift schedules based on employee preferences and manager insights.

### Hackathon Details
- **Event:** Meta & YTU Llama Hackathon 2025
- **Dates:** October 24-26, 2025
- **Location:** YTU Historic Hamam, Istanbul
- **Theme:** Productivity Tools
- **Team:** Golden Head

---

## 🔴 The Problem

Part-time workforce management faces critical challenges:

1. **Manual Process:** Managers spend hours manually creating shift schedules
2. **Preference Collection:** Employees submit preferences via WhatsApp/paper, leading to miscommunication
3. **Unfair Distribution:** Without proper tools, shift distribution becomes subjective and unbalanced
4. **Time-Consuming:** The entire process takes 2-3 days per week
5. **Low Satisfaction:** Both managers and employees are frustrated with the current system

**Real-World Impact:**
- Small businesses (cafes, retail stores) waste **10+ hours/week** on scheduling
- Employee turnover increases due to unfair shift distribution
- Managers struggle to balance preferences with business needs

---

## ✅ Our Solution

**Shiffy** automates the entire shift management workflow:

### For Managers (B2B)
- 📱 Self-service registration and store setup
- 👥 Easy employee account creation and management
- 📝 Add contextual notes about employee preferences/strengths
- 🤖 AI-generated shift schedules in seconds (powered by Llama)
- ✏️ Manual editing capabilities for final adjustments
- ✅ One-click approval and distribution

### For Employees (B2C)
- 🔐 Secure username-based login (no email required)
- 📅 Interactive 30-minute slot-based preference selection
- 🎨 Color-coded availability system (Available/Unavailable/Off Request)
- 📊 View approved schedules and shift history
- ⏰ Deadline reminders

### AI-Powered Intelligence
- 🧠 **Meta Llama 3.2 70B** model for complex scheduling
- ⚖️ Fair distribution algorithm considering:
  - Employee availability preferences
  - Manager notes and insights
  - Work hour balance across all employees
  - Rest period requirements (minimum 8 hours between shifts)
  - Weekend shift rotation

---

## 🚀 Features

### MVP Features (Hackathon)

**Manager Dashboard:**
- [x] Employee management (CRUD operations)
- [x] Shift preference review
- [x] AI schedule generation
- [x] Manual schedule editing
- [x] Schedule approval and distribution
- [x] Configurable deadline settings

**Employee Interface:**
- [x] First-login password change (security)
- [x] Interactive shift grid (30-minute slots)
- [x] Color-coded preference selection
- [x] Draft auto-save (offline capability)
- [x] View approved schedules
- [x] Shift history tracking

**Backend & AI:**
- [x] Dual authentication system (Manager: Supabase, Employee: Custom JWT)
- [x] RunPod-hosted Llama API integration
- [x] Automated cron job for deadline-based generation
- [x] RESTful API with 20+ endpoints
- [x] Row-level security (RLS) in Supabase

### Future Enhancements (Post-MVP)
- [ ] Push notifications (shift approved, deadline reminder)
- [ ] Chat-based shift requests
- [ ] Employee shift swapping
- [ ] Analytics dashboard (work hours, patterns)
- [ ] Multi-store support
- [ ] Manager-employee messaging
- [ ] Export schedules (PDF, Calendar)

---

## 🛠 Tech Stack

### Frontend (Mobile App)
```
Framework:     Expo SDK 54 (React Native 0.76)
Language:      TypeScript (strict mode)
Routing:       Expo Router (file-based)
Auth:          Supabase Auth + Custom JWT
State:         React Hooks (no Redux/Zustand)
Storage:       Expo SecureStore
Testing:       Jest + React Native Testing Library
```

### Backend (API Server)
```
Runtime:       Node.js 20.x
Framework:     Express.js
Language:      TypeScript
Database:      PostgreSQL (via Supabase)
Auth:          Supabase Auth + Custom JWT (bcrypt)
ORM:           Direct Supabase client (no ORM)
Scheduling:    node-cron (automated tasks)
Testing:       Jest + Supertest
```

### AI & Infrastructure
```
AI Model:      Meta Llama 3.2 70B Instruct
AI Platform:   RunPod (self-hosted GPU instance)
Deployment:    Oracle Cloud Free Tier (4 vCPU, 24GB RAM)
Process Mgr:   PM2 (cluster mode)
Reverse Proxy: Nginx
SSL:           Let's Encrypt (Certbot)
CI/CD:         GitHub Actions
```

### Database Schema
```
Tables:        managers, employees, shift_preferences, 
               schedules, audit_logs (optional)
Features:      JSONB columns, Row-Level Security (RLS),
               UUID primary keys, Indexes
```

---

## 📁 Project Structure

```
shiffy/
├── README.md                      # This file
├── LICENSE
│
├── docs/                          # Project-wide documentation
│   ├── API.md                    # Backend API contract
│   ├── DATABASE_SCHEMA.md        # Supabase table definitions
│   └── DEPLOYMENT.md             # Deployment guides
│
├── frontend/                      # Mobile app (Expo)
│   ├── src/
│   │   ├── app/                  # Screens (Expo Router)
│   │   │   ├── (auth)/          # Public auth screens
│   │   │   ├── (manager)/       # Manager protected routes
│   │   │   └── (employee)/      # Employee protected routes
│   │   ├── components/           # Reusable UI components
│   │   ├── services/             # API clients (Supabase, Backend)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── types/                # TypeScript definitions
│   │   └── utils/                # Helper functions
│   ├── test/                     # Unit & integration tests
│   ├── docs/                     # Frontend-specific docs
│   ├── package.json
│   └── README.md
│
└── backend/                       # API server (Node.js)
    ├── src/
    │   ├── routes/               # API route handlers
    │   ├── services/             # Business logic layer
    │   ├── repositories/         # Data access layer
    │   ├── middleware/           # Auth, logging, errors
    │   ├── utils/                # Utilities (JWT, bcrypt)
    │   ├── types/                # TypeScript definitions
    │   ├── config/               # Configuration files
    │   ├── cron/                 # Scheduled jobs
    │   └── server.ts             # Entry point
    ├── test/                     # Unit, integration, E2E tests
    ├── docs/                     # Backend-specific docs
    ├── package.json
    └── README.md
```

---

## 🚦 Getting Started

### Prerequisites

**Required:**
- Node.js 20.x or higher
- npm or yarn
- Git
- Expo CLI: `npm install -g expo-cli`
- Supabase account (free tier)
- RunPod account (for Llama API)
- Oracle Cloud account (free tier, for backend deployment)

**Recommended:**
- iOS Simulator (Mac) or Android Emulator
- VS Code with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features

---

### Quick Start (Development)

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/shiffy.git
cd shiffy
```

#### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env

# Run database migrations (see docs/DATABASE_SCHEMA.md)
# Create tables in Supabase dashboard

# Start development server
npm run dev
```

**Backend will run on:** `http://localhost:3000`

#### 3. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with backend URL
nano .env

# Start Expo development server
npx expo start
```

**Expo will provide QR codes for:**
- iOS (Camera app or Expo Go)
- Android (Expo Go app)
- Web (browser)

---

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# JWT (Employee Auth)
JWT_SECRET=your_256_bit_random_secret
JWT_EXPIRY=7d

# RunPod Llama API
RUNPOD_API_URL=https://your-pod-id.runpod.net
RUNPOD_API_KEY=your_custom_api_key

# CORS
CORS_ORIGIN=*  # Set to specific domains in production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

### Running Tests

#### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- auth.test.ts

# Run in watch mode
npm run test:watch
```

#### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- Button.test.tsx
```

---

## 📚 Documentation

### Core Documentation
- **[Frontend Technical Docs](./frontend/docs/FRONTEND_DOCS.md)** - Mobile app architecture, screens, components
- **[Backend Technical Docs](./backend/docs/BACKEND_DOCS.md)** - API server, database, Llama integration
- **[API Reference](./docs/API.md)** - Complete API endpoint specifications
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Supabase table definitions and RLS policies

### Setup Guides
- **[Frontend Setup Guide](./frontend/docs/SETUP.md)** - Detailed Expo setup instructions
- **[Backend Setup Guide](./backend/docs/SETUP.md)** - Node.js server configuration
- **[RunPod Llama Guide](./backend/docs/LLAMA_INTEGRATION.md)** - AI model deployment

### Deployment Guides
- **[Oracle Cloud Deployment](./backend/docs/DEPLOYMENT.md)** - PM2 + Nginx setup
- **[CI/CD Pipeline](./docs/DEPLOYMENT.md#cicd)** - GitHub Actions automation

---

## 🚀 Deployment

### Production Deployment Architecture

```
┌─────────────────┐
│   Mobile App    │
│   (Expo EAS)    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────────┐
│       Nginx (Reverse Proxy)         │
│       Oracle Cloud Free Tier        │
│       Ubuntu 22.04 LTS              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       PM2 (Process Manager)         │
│       Node.js Backend               │
│       Port 3000                     │
└────────┬────────────────┬───────────┘
         │                │
         ▼                ▼
┌────────────────┐  ┌──────────────────┐
│   Supabase     │  │   RunPod Llama   │
│   PostgreSQL   │  │   3.2 70B GPU    │
└────────────────┘  └──────────────────┘
```

### Deployment Steps

#### 1. Backend (Oracle Cloud)
```bash
# SSH into Oracle Cloud instance
ssh ubuntu@<oracle-public-ip>

# Clone repository
git clone https://github.com/your-org/shiffy.git
cd shiffy/backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/server.js --name shiffy-backend
pm2 save
pm2 startup
```

**See:** [Backend Deployment Guide](./backend/docs/DEPLOYMENT.md)

#### 2. Frontend (Expo EAS)
```bash
cd frontend

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

**See:** [Frontend Deployment Guide](./frontend/docs/DEPLOYMENT.md)

#### 3. RunPod Llama Instance
1. Go to https://www.runpod.io
2. Deploy **Text Generation Inference** template
3. Select **A40 GPU** (48GB VRAM)
4. Set model: `meta-llama/Llama-3.2-70B-Instruct`
5. Copy HTTP Service URL
6. Add URL to backend `.env`

**See:** [Llama Integration Guide](./backend/docs/LLAMA_INTEGRATION.md)

---

## 🔐 Security Considerations

### Authentication
- **Managers:** Supabase Auth (email + password, JWT tokens)
- **Employees:** Custom backend auth (username + password, bcrypt hashing)
- **Token Expiry:** Manager: 1hr access + 30d refresh, Employee: 7d access
- **First Login:** Employees forced to change temporary password

### API Security
- **CORS:** Whitelist only authorized domains
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **JWT Verification:** All protected routes validated via middleware
- **SQL Injection:** Prevented via Supabase parameterized queries
- **XSS Prevention:** Input validation and sanitization

### Database Security
- **Row-Level Security (RLS):** Managers can only access their own data
- **Service Role Key:** Never exposed to frontend
- **API Keys:** Stored in secure environment variables
- **Encrypted Storage:** Mobile app uses Expo SecureStore

### Infrastructure Security
- **HTTPS Only:** Let's Encrypt SSL certificates
- **Firewall:** Ubuntu UFW + Oracle Cloud security lists
- **SSH Keys:** Password authentication disabled
- **PM2 User:** Non-root user for Node.js process

---

## 👥 Team

**Team Name:** Golden Head

### Team Members
- **[Your Name]** - Full Stack Developer
- **[Team Member 2]** - Frontend Developer
- **[Team Member 3]** - Backend Developer
- **[Team Member 4]** - UI/UX Designer

### Roles & Responsibilities
- **Frontend Team:** Expo mobile app, UI components, state management
- **Backend Team:** Node.js API, Llama integration, database design
- **DevOps:** Oracle Cloud deployment, CI/CD pipeline
- **Documentation:** Technical docs, API specifications, README

---

## 🏆 Hackathon Deliverables

### Technical Implementation
- ✅ Mobile app (iOS & Android)
- ✅ Backend API (20+ endpoints)
- ✅ AI integration (Llama 3.2 70B)
- ✅ Database (5 tables with RLS)
- ✅ Automated cron jobs
- ✅ Production deployment (Oracle Cloud)

### Documentation
- ✅ Complete technical documentation (frontend + backend)
- ✅ API reference with examples
- ✅ Database schema with relationships
- ✅ Deployment guides
- ✅ Setup instructions

### Presentation Materials
- ✅ Pitch deck (10 slides)
- ✅ Live demo video
- ✅ GitHub repository (public)
- ✅ Technical architecture diagram

---

## 📊 Demo Credentials

### Manager Account
```
Email:    demo@shiffy.com
Password: Demo123!
Store:    Demo Cafe
```

### Employee Accounts
```
Username: employee1    Password: Employee1!
Username: employee2    Password: Employee2!
Username: employee3    Password: Employee3!
```

**Note:** These are test accounts. Please create your own for actual use.

---

## 🐛 Known Issues & Limitations (MVP)

### Current Limitations
- Single store per manager (multi-store support planned)
- No push notifications (planned for v2)
- Manual conflict resolution required for edge cases
- English/Turkish language only
- Limited to 50 employees per store

### Planned Improvements
- Real-time updates via WebSocket
- Advanced analytics dashboard
- Employee shift swap requests
- Mobile app offline mode
- Export to Google Calendar/Outlook

---

## 📝 License

This project was developed for the **Meta & YTU Llama Hackathon 2025**.

**License:** MIT License

Copyright (c) 2025 Team Golden Head

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

- **Meta AI** - For providing Llama models and hosting the hackathon
- **Yıldız Technical University** - For venue and organization
- **Supabase** - For excellent PostgreSQL + Auth platform
- **RunPod** - For affordable GPU compute
- **Oracle Cloud** - For generous free tier
- **Expo Team** - For amazing React Native framework

---

## 📞 Contact & Support

### Project Links
- **GitHub Repository:** https://github.com/your-org/shiffy
- **Live Demo:** https://shiffy.com (if deployed)
- **API Documentation:** https://api.shiffy.com/docs

### Get in Touch
- **Email:** team@shiffy.com
- **Discord:** [Join our server](#)
- **Twitter:** [@ShiffyApp](#)

### Support
For issues and questions:
1. Check [Documentation](#-documentation)
2. Search [GitHub Issues](https://github.com/your-org/shiffy/issues)
3. Create new issue with detailed description

---

## 🎉 Thank You!

Thank you for checking out **Shiffy**! We hope this project demonstrates the power of AI-driven automation in solving real-world workforce management challenges.

**Built with ❤️ by Team Golden Head during Meta & YTU Llama Hackathon 2025**

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-Llama%203.2-purple?style=for-the-badge&logo=meta" alt="Made with Llama" />
  <img src="https://img.shields.io/badge/Built%20with-Expo-black?style=for-the-badge&logo=expo" alt="Built with Expo" />
  <img src="https://img.shields.io/badge/Powered%20by-Node.js-green?style=for-the-badge&logo=node.js" alt="Powered by Node.js" />
</p>

<p align="center">
  <sub>Hackathon Project • October 24-26, 2025 • Istanbul, Turkey</sub>
</p>