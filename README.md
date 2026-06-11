# CrowdFAQ

A crowd-sourced FAQ platform built with the **MERN stack** (MongoDB, Express, React, Node.js) and **Tailwind CSS v3**.

Browse FAQs and community questions without an account. **Sign up or log in** to ask questions and submit answers. Includes dark mode, voting, categories, duplicate detection, a moderation workflow, AI-powered answer suggestions, and a reputation/leaderboard system.

---

## ✨ Features
### Core
- **FAQ browser** — search, filter by category, sort by latest / helpful / views, yes/no voting
- **Community Q&A** — ask questions, view answers, moderation (approve / reject / pending)
- **Authentication** — JWT login & signup; protected question and answer submission
- **Dark mode** — toggle with persistence across sessions

### Smart Features
- **Duplicate detection** — warns when similar FAQs or questions already exist before submitting
- **Spam prevention** — one question per account per hour (server-side enforcement)
- **Multi-field search** — searches question text, answer text, tags, keywords, and category simultaneously
- **Sort modes** — sort FAQs by Latest, Most Helpful, or Most Viewed

### Moderation
- **Question moderation** — Approve / Reject / Mark Pending on any community question
- **Answer moderation** — Approve / Reject / Mark Pending on any individual answer
- **Status tabs** — filter questions and answers by status (all / pending / approved / rejected)

### 🤖 AI-Powered Suggested Answers
- When a logged-in user opens a pending question, an **AI Suggest** panel appears above the answer form
- Analyses question text against all approved FAQs using keyword-overlap scoring
- Displays the best-matching FAQ answer with a **confidence percentage bar**
- Admin/user can click **"Use this suggestion"** to pre-fill the answer textarea

### 🎯 AI Confidence Scores on Answers
- Every submitted answer receives a computed **confidence score (0–100%)**
- Score blends: keyword coverage of the question (60%) + alignment with existing FAQ content (40%)
- Displayed as a colour-coded bar under each answer (🟢 ≥70%, 🟡 ≥40%, 🔴 <40%)
- Visible on the question detail page and on the user's profile page

### 🏆 Reputation System
- **Points** awarded for contributions:

  | Action | Points |
  |--------|--------|
  | Ask a question | +2 pts |
  | Submit an answer | +5 pts |
  | Answer gets approved | +15 pts |
  | Answer receives an upvote | +10 pts |

- **Levels** based on total points: 🌱 Beginner (0–49) · ⭐ Contributor (50–199) · 🏆 Expert (200+)
- **Upvote buttons** on each answer (toggle; logged-in users only)
- **Leaderboard page** (`/leaderboard`) ranks top contributors with progress bars, level badges, and stats

### 👤 User Profile Page
- Beautiful profile page at `/profile` with gradient banner matching the user's level
- **Level progress bar** — shows current points and points needed for next level
- **4-stat grid**: Questions Asked, Answers Given, Answers Approved, Upvotes Received
- **Tabbed sections**:
  - ❓ **Questions** — all questions asked, with status badges, links to detail page
  - 💬 **Answers** — all answers given, with confidence score bars, status, upvote count
  - ❤️ **Saved FAQs** — all bookmarked FAQs with full content preview
- Navbar avatar is now a clickable link to the profile page

### ❤️ Save FAQs
- Heart icon on every FAQ card (visible when logged in)
- Toggles save/unsave; saved state persisted in database (User model)
- Saved FAQs appear in the profile page's **Saved FAQs** tab

### 👥 People Like You Also Asked
- Sidebar panel on the FAQ page that appears when a FAQ is expanded
- Shows up to 4 related FAQs sharing the same **category** or **tags**
- On desktop (large screens) as a sticky right rail
- Login CTA card shown to guests to encourage saving FAQs

### 🎨 Modernised UI
- `btn-primary` now uses gradient + shadow glow
- `card-hover` adds lift on hover with shadow transition
- `stat-card` component for dashboard-style stat tiles
- `confidence-bar` utility classes for animated progress bars
- No-scrollbar utility, `glow-primary`, `slide-up` animation
- FAQ hero has decorative blur blobs and quick-stats bar with progress bars, level badges, and stats

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router, Tailwind CSS v3, Axios |
| Backend | Node.js, Express 4, Mongoose |
| Database | MongoDB |
| Auth | JWT + bcrypt |

---

## Prerequisites

Install these before cloning:

| Tool | Version | Notes |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | v18+ | Includes npm |
| [MongoDB](https://www.mongodb.com/try/download/community) | 6+ | Local install **or** [MongoDB Atlas](https://www.mongodb.com/atlas) free tier |

**MongoDB must be reachable** before starting the server.

| Platform | Start MongoDB locally |
|----------|----------------------|
| Windows | `net start MongoDB` or open MongoDB Compass |
| macOS | `brew services start mongodb-community` |
| Linux | `sudo systemctl start mongod` |

---

## Getting Started (Clone & Run)

### 1. Clone the repository

```bash
git clone https://github.com/Just-Here-TO-Code/cs-faq.git
cd cs-faq
```

### 2. Install dependencies

From the project root:

```bash
npm install
```

This installs root, `server/`, and `client/` packages automatically via the `postinstall` script.

### 3. Configure environment variables

Copy the example env file and edit if needed:

**macOS / Linux**
```bash
cp server/.env.example server/.env
```

**Windows (PowerShell)**
```powershell
Copy-Item server\.env.example server\.env
```

Default `server/.env` values work for local development:

```env
MONGO_URI=mongodb://localhost:27017/crowdfaq
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-me
```

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string (local or Atlas) |
| `PORT` | Express API port (default `5000`) |
| `JWT_SECRET` | Secret for signing auth tokens — **change in production** |

**Using MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string, e.g.:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/crowdfaq
```

### 4. Seed sample data

Populates the database with 10 sample FAQs (required for AI suggestions to work):

```bash
npm run seed
```

### 5. Start the development servers

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| **Frontend** (React + Vite) | http://localhost:3000 |
| **Backend** (Express API) | http://localhost:5000 |

The Vite dev server proxies `/api/*` to the Express server, so no extra CORS setup is needed during development.

### 6. Try it out

1. Open http://localhost:3000 — browse FAQs
2. Go to **Log In** → **Sign Up** to create an account
3. Visit **Ask Question** to submit a community question
4. Open **Community** to view and moderate questions
5. Click a question → answer it → see the 🤖 AI suggestion panel
6. Check **🏆 Leaderboard** to see top contributors

---

## Project Structure

```
crowdfaq/
├── package.json              # Root scripts (dev, seed, build)
├── .gitignore
├── README.md
├── CONTEXT.md                # Development history & decisions
│
├── server/                   # Express API
│   ├── index.js
│   ├── seed.js
│   ├── .env.example          # Template — copy to .env (not committed)
│   ├── middleware/auth.js
│   ├── models/               # User, FAQ, Question, Answer
│   └── routes/               # auth, faqs, questions, answers, users, suggest
│
└── client/                   # React + Vite frontend
    ├── vite.config.js        # Dev proxy: /api → localhost:5000
    └── src/
        ├── pages/            # FAQ, Auth, Ask, Community, Detail, Leaderboard
        ├── components/
        ├── context/          # Theme + Auth providers
        └── services/api.js
```

---

## npm Scripts

Run all commands from the **project root**:

| Script | Description |
|--------|-------------|
| `npm install` | Install dependencies (root + server + client) |
| `npm run dev` | Start API (nodemon) + frontend (Vite) together |
| `npm run seed` | Seed 10 sample FAQs into MongoDB |
| `npm run build` | Build React app to `client/dist/` |
| `npm run start` | Run Express in production mode (`node index.js`) |

---

## Pages & Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | No | FAQ page with search, filters, voting, People-like-you sidebar |
| `/auth` | No | Login & signup |
| `/ask` | Yes | Submit a community question |
| `/community` | No | Browse questions with moderation tabs |
| `/community/:id` | No (answer: Yes) | Question detail + answers + confidence scores + AI suggestion |
| `/leaderboard` | No | Top contributors ranked by reputation points |
| `/profile` | Yes | Personal profile: stats, questions, answers, saved FAQs |

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Log in |
| `GET` | `/api/auth/me` | Yes | Current user |
| `GET` | `/api/faqs` | No | List FAQs (`?search`, `?category`, `?sort`) |
| `POST` | `/api/faqs/:id/vote` | No | Vote helpful / not helpful |
| `GET` | `/api/questions` | No | List community questions |
| `POST` | `/api/questions` | Yes | Create question (+2 pts) |
| `GET` | `/api/answers/:questionId` | No | List answers |
| `POST` | `/api/answers` | Yes | Submit answer (+5 pts) |
| `PATCH` | `/api/answers/:id/status` | No | Approve answer (+15 pts to author) |
| `POST` | `/api/answers/:id/upvote` | Yes | Toggle upvote (+10 pts to author) |
| `GET` | `/api/suggest?q=` | No | AI-suggested answer from FAQ data |
| `GET` | `/api/users/leaderboard` | No | Top contributors by points |
| `GET` | `/api/health` | No | Health check |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB connection error` | Ensure MongoDB is running; check `MONGO_URI` in `server/.env` |
| `Port 5000 already in use` | Change `PORT` in `server/.env` and update Vite proxy in `client/vite.config.js` |
| `Port 3000 already in use` | Change `server.port` in `client/vite.config.js` |
| `401` when posting questions | Log in first — auth token is required |
| Empty FAQ page | Run `npm run seed` to populate sample data |
| AI suggestion returns nothing | The seeded FAQs need to match some keywords; try questions about eligibility, stipend, certificates, etc. |
| `npm install` fails | Use Node.js v18+; delete `node_modules` folders and retry |

---

## Publishing to GitHub

When you are ready to push this project:

```bash
git init
git add .
git status          # verify .env and node_modules are NOT listed
git commit -m "Initial commit: CrowdFAQ MERN app"
git branch -M main
git remote add origin https://github.com/Just-Here-TO-Code/cs-faq.git
git push -u origin main
```

> **Never commit** `server/.env` — it is listed in `.gitignore`. Only `server/.env.example` is tracked.

---

## Environment & Security Notes

- `server/.env` is gitignored; each developer copies from `.env.example`
- Use a strong, unique `JWT_SECRET` in production
- For production deployment, build the client (`npm run build`) and serve `client/dist/` behind a reverse proxy alongside the API

---

## License

This project is provided as-is for learning and portfolio use.

---

## See Also

- [`CONTEXT.md`](./CONTEXT.md) — full development history, architecture decisions, and session log
