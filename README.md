# GrantPilot AI 🇮🇳

> **AI-assisted Government Opportunity Intelligence & Qualification Platform for Indian Startups**

[![Deploy to GitHub Pages](https://github.com/thanvanthat/GrantPilot-Frontend/actions/workflows/deploy.yml/badge.svg)](https://github.com/thanvanthat/GrantPilot-Frontend/actions/workflows/deploy.yml)
[![Live Website](https://img.shields.io/badge/Website-Live%20on%20GitHub%20Pages-brightgreen)](https://thanvanthat.github.io/GrantPilot-Frontend/)

---

## 🌐 Live Website

- **Production / Live Website Link:** [https://thanvanthat.github.io/GrantPilot-Frontend/](https://thanvanthat.github.io/GrantPilot-Frontend/)
- **Repository:** [https://github.com/thanvanthat/GrantPilot-Frontend](https://github.com/thanvanthat/GrantPilot-Frontend)

---

## 🚀 Overview

GrantPilot simplifies and accelerates public procurement and grant intelligence for Indian startups, innovators, and MSMEs targeting schemes such as:
- **DPIIT Startup India** recognition & seed fund support
- **iDEX / Defence India Startup Challenge (DISC)**
- **BIRAC Biotechnology Ignition Grant (BIG)**
- **TIDE 2.0 / MeitY** incubation grants
- **GeM (Government e-Marketplace)** procurement tenders

### Core Features
1. **Interactive AI Agent Widget**: Floating assistant connected to the SNS Agent Workbench with instant advisory fallback for eligibility, DPIIT recognition, proposal improvement, and compliance checklist questions.
2. **Opportunity Discovery & Search**: Filter and sort Indian government grants, tenders, and challenges across aerospace, healthcare, cybersecurity, clean tech, and agriculture.
3. **Automated Bid-Fit Qualification Engine**: Deep analysis calculating match scores, eligibility pass/fail flags, capability alignment, gaps, risks, and next steps.
4. **Proposal Workspace**: AI-assisted tender-compliant proposal drafting structured around evaluation metrics, budgeting, milestone delivery, and national missions (Atmanirbhar Bharat / Make in India).
5. **Compliance Workspace & Readiness Gate**: Automated document verification, statutory requirement tracker, and risk mitigation register.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router 6 (HashRouter for zero-config static hosting), Tailwind CSS, Lucide Icons, Shadcn-style components.
- **Build Tool**: Vite 5.
- **Backend / AI Integration**:
  - Integrated local proxy (`/api/agent/*`) in Vite dev server & production `server.js`.
  - Upstream AI service: [SNS Agent Workbench](https://agents.snsihub.ai) (`https://api.agents.snsihub.ai`).
  - Seamless hybrid fallback engine for 100% reliability in offline or static hosting environments.

---

## 💻 Local Setup & Development

### 1. Clone the repository
```bash
git clone https://github.com/thanvanthat/GrantPilot-Frontend.git
cd GrantPilot-Frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local development server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Run standalone full-stack production server
```bash
npm run build
npm start
```
Open **[http://localhost:3005](http://localhost:3005)** in your browser.

---

## 🚢 Deployment

The project is configured for continuous deployment via **GitHub Actions** (`.github/workflows/deploy.yml`).
Every push to the `main` branch automatically builds the production distribution and deploys it to **GitHub Pages**.

---

## 📜 License

MIT License. Developed for Indian Startups & Innovation Ecosystem.
