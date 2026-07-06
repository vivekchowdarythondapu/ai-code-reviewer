<div align="center">

# ⚡ AI Code Reviewer

### AI-Powered Code Analysis & Optimization Platform

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat&logo=socket.io&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-F55036?style=flat)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=flat&logo=render&logoColor=white)

🔗 **Live Demo →** [ai-code-reviewer-flax-sigma.vercel.app](https://ai-code-reviewer-flax-sigma.vercel.app)

</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [AI Review Algorithm](#ai-review-algorithm)
- [Deployment](#deployment)
- [Author](#author)

---

## 📖 About the Project

**AI Code Reviewer** is a full-stack web application that acts as your personal senior software engineer. Paste any code and instantly receive a deep AI-powered review covering bugs, security vulnerabilities, performance issues, and style problems — along with a fully optimized rewrite of your code.

The platform uses **Groq's LLaMA 3.3 70B** model to analyze code in real-time, detecting time/space complexity issues and generating complete optimized rewrites. Developers can track their improvement over time through a progress dashboard, review history, and team collaboration features.

> 🔐 Secure OTP-based email authentication ensures only verified users can access the platform.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Code Review** | Groq LLaMA 3.3 70B analyzes code for bugs, security, performance, style |
| 🔍 **Language Auto-Detection** | Detects actual language from syntax, auto-switches dropdown |
| ⏱ **Complexity Analysis** | Time & Space complexity with optimization path |
| ⚡ **Optimized Code Rewrite** | Full working code rewrite with best algorithm |
| 📊 **Score Breakdown** | Detailed scoring with reasons for each deduction |
| 🐛 **Rich Issue Cards** | Why it's a problem, impact, before/after diffs, best practices |
| 📈 **Progress Dashboard** | Score over time charts, issue breakdown pie chart |
| 📋 **Review History** | Filter past reviews by language, click to see full details |
| 👥 **Team Mode** | Real-time collaboration via Socket.IO, share snippets with AI review |
| 💬 **Team Comments** | Real-time commenting on shared code snippets |
| 🔐 **OTP Authentication** | Email OTP verification via Nodemailer/Gmail |
| ▶ **Code Execution** | Run code directly via Piston API (8 languages) |
| 🔥 **Streak Tracking** | Daily review streaks to encourage consistent practice |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React.js | 18.x | UI Framework |
| Monaco Editor | Latest | VS Code in browser |
| Socket.IO Client | 4.x | Real-time communication |
| Recharts | Latest | Analytics charts |
| React Router DOM | 6.x | Client-side routing |
| Axios | Latest | HTTP client |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 22.x | JavaScript runtime |
| Express.js | 5.x | Web framework |
| MongoDB Atlas | Cloud | NoSQL database |
| Mongoose | 9.x | MongoDB ODM |
| Socket.IO | 4.x | WebSocket server |
| JWT | Latest | Authentication tokens |
| Nodemailer | Latest | OTP email service |
| Groq SDK | Latest | LLaMA 3.3 70B AI |
| Axios | Latest | Piston API calls |

---

## 📁 Project Structure

```
ai-code-reviewer/
├── client/                          # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx           # Navigation with active states
│       │   └── PrivateRoute.jsx     # Protected route wrapper
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state
│       ├── pages/
│       │   ├── Login.jsx            # Login page
│       │   ├── Register.jsx         # Register with OTP
│       │   ├── VerifyOTP.jsx        # OTP verification
│       │   ├── Review.jsx           # Main editor + AI panel
│       │   ├── Dashboard.jsx        # Stats + charts
│       │   ├── History.jsx          # Past reviews
│       │   └── Team.jsx             # Team collaboration
│       └── utils/
│           ├── api.js               # Axios instance
│           └── socket.js            # Socket.IO config
│
└── server/                          # Express backend
    ├── controllers/
    │   ├── authController.js        # Register, login, OTP
    │   ├── reviewController.js      # AI review, execute code
    │   └── teamController.js        # Teams, snippets, comments
    ├── middleware/
    │   └── auth.js                  # JWT verification
    ├── models/
    │   ├── User.js                  # User schema + streak
    │   ├── Review.js                # Review + issues schema
    │   └── Team.js                  # Team + snippets schema
    ├── routes/
    │   ├── auth.js                  # /api/auth routes
    │   ├── review.js                # /api/review routes
    │   └── team.js                  # /api/team routes
    └── services/
        ├── aiService.js             # Groq LLaMA integration
        ├── emailService.js          # Nodemailer OTP
        └── compilerService.js       # Piston API execution
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or above
- npm v8 or above
- MongoDB Atlas account (free)
- Groq API key (free at [console.groq.com](https://console.groq.com))
- Gmail account with App Password enabled

### 1. Clone the repository

```bash
git clone https://github.com/vivekchowdarythondapu/ai-code-reviewer.git
cd ai-code-reviewer
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create `server/.env` file (see Environment Variables section)

```bash
npm run dev
```

Server runs on → http://localhost:5000

### 3. Setup Frontend

```bash
cd client
npm install
npm start
```

Client runs on → http://localhost:3000

---

## 🔐 Environment Variables

Create a `.env` file inside the `server/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> ⚠️ Never commit your `.env` file to GitHub. It is already in `.gitignore`.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register + send OTP |
| POST | `/api/auth/verify-otp` | Verify OTP + create account |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/me` | Get logged in user |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/review` | Submit code for AI review |
| GET | `/api/review` | Get all user reviews |
| GET | `/api/review/:id` | Get single review |
| DELETE | `/api/review/:id` | Delete review |
| POST | `/api/review/run` | Execute code via Piston |

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/team` | Create a team |
| POST | `/api/team/join` | Join team with invite code |
| GET | `/api/team` | Get my teams |
| GET | `/api/team/:id` | Get team with snippets |
| POST | `/api/team/:id/snippets` | Share snippet with AI review |
| POST | `/api/team/:id/snippets/:snippetId/comments` | Add comment |

---

## 🤖 AI Review Algorithm

The platform uses **Groq's LLaMA 3.3 70B** model with a structured prompt engineering approach:

**Language Detection** — Detects actual language from syntax patterns, flags mismatch with user selection

**Analysis Pipeline:**
- Tokenize → Parse code structure and identify patterns
- Classify → Categorize issues as bug / security / performance / style
- Score → Calculate 0-100 score with breakdown of deductions
- Optimize → Generate complete rewrite with best time/space complexity

**Complexity Analysis:**
- Current complexity → O(n²), O(n log n), O(1), etc.
- Optimized complexity → Best achievable with algorithm change
- Explanation → Why and how to improve

**Score Breakdown** ensures transparency — every point deducted is explained with reason, impact, and fix.

---

## 🌐 Deployment

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | [ai-code-reviewer-flax-sigma.vercel.app](https://ai-code-reviewer-flax-sigma.vercel.app) |
| Backend | Render | [ai-code-reviewer-backend-kkgt.onrender.com](https://ai-code-reviewer-backend-kkgt.onrender.com) |
| Database | MongoDB Atlas | Cloud M0 Free Cluster |
| AI Model | Groq Cloud | LLaMA 3.3 70B Versatile |
| Code Execution | Piston API | Free, no API key needed |

> ⚠️ **Note:** Backend is on Render free tier. First request after inactivity may take ~50 seconds to wake up.

---

## 👨‍💻 Author

**Thondapu Vivek Chowdary**

- 🎓 B.Tech CSE — SRM University AP (2024)
- 💼 GitHub: [@vivekchowdarythondapu](https://github.com/vivekchowdarythondapu)
- 🔗 LinkedIn: [thondapu-vivekchowdary](https://linkedin.com/in/thondapu-vivekchowdary-535312392)

---

## 📄 License

MIT License — feel free to use this project for learning and portfolio purposes.

---

<div align="center">
  Made with ❤️ by Vivek Chowdary
</div>