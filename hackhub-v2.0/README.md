# HackHub — Hackathon Team and Delivery Hub

A clean, modern React web application built for college engineering students to discover hackathons, assemble compatible teams with AI-powered matching, manage sprint deliverables, and review guidelines with an interactive Rulebook AI assistant.

---

## ✨ Key Features

- 🎯 **Hackathon & Challenge Discovery**: Multi-track search with filtering by AI, Web, Cybersecurity, and IoT.
- 🤝 **Intelligent Team Finder**: Natural language candidate search and compatibility scoring with "Why this person?" reasoning.
- 📊 **Team Sprint Workspace**: Real-time mock task Kanban board, milestone timeline, and architectural decision logger.
- 🚀 **Submission Hub**: Comprehensive checklist validation, GitHub & demo link collection, and celebratory submission effects.
- 🤖 **Rulebook & AI Assistant**: Mock RAG assistant answering question prompts with exact section citations.
- ⏱️ **AI Sprint Delivery Planner**: Velocity risk calculation, critical path schedule optimizer, and interactive proposal approval flow.
- 🏆 **Reputation Scoring**: Transparent point history and badge breakdown across past hackathons.
- 🎭 **Interactive Demo Role Switcher**: Test role-specific dashboards for **Participants**, **Mentors**, **Judges**, and **Organizers** with zero backend setup.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + JavaScript + Vite
- **Routing**: React Router v7 (`react-router-dom`)
- **Styling**: Tailwind CSS v4 (Design tokens: `#F8FAFC`, `#172033`, `#4F46E5`, rounded 12px/14px/16px corners)
- **Icons**: Lucide React
- **Mock State**: React Context API (`AuthContext`, `TeamContext`, `ToastContext`) + LocalStorage persistence

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🔌 Future Backend Integration

All UI components are decoupled from mock data through the service layer in [`src/services/`](src/services/). To attach a real backend server (Node.js/Express/MongoDB/Atlas Vector Search), refer to the detailed integration guide at [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md).
