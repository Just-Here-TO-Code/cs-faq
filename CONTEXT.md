# CONTEXT.md — CrowdFAQ Development History

> This file tracks **everything** that has been discussed, designed, and built in this project across all sessions.
> At the start of every new conversation, the AI assistant should read this file first to resume context instantly.

---

## 📌 Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | CrowdFAQ |
| **Type** | Crowd-sourced FAQ web application (MVP) |
| **Stack** | MERN (MongoDB, Express, React/Vite, Node.js) + Tailwind CSS v3 |
| **Workspace Path** | `d:\FAQ_TRY` |
| **Frontend URL** | http://localhost:3000 |
| **Backend URL** | http://localhost:5000 |
| **Database** | MongoDB local — `mongodb://localhost:27017/crowdfaq` |

---

## 🧑 User Preferences & Style Notes

- Prefers **clean, modern UI** — professional color palette, good spacing, rounded cards
- Does **not** want admin panels, notifications, or AI features yet (MVP+)
- **Authentication added** in Session 4 — JWT login/signup required to ask questions and submit answers
- Wants the project to be **fully runnable** with just `npm install && npm run seed && npm run dev`
- Tailwind CSS v3 was explicitly requested
- Inter font from Google Fonts used for typography
- Indigo/Violet gradient chosen as primary palette
- Wants `CONTEXT.md` and `README.md` **kept updated** after every session/change so future AI sessions can resume instantly

---

## 🗓️ Session Log

### Session 1 — 2026-06-09 (Initial Build)

**Conversation ID**: `2da32c39-ebd0-4337-8ef7-748fa50ee2cc`

**User Request**: Build a complete MVP crowd-sourced FAQ website using the MERN stack.

#### Requirements Discussed
- 3 pages: FAQ (`/`), Ask Question (`/ask`), Community Answers (`/community`)
- Question Detail sub-page at `/community/:id`
- MongoDB models for FAQ, Question, Answer
- REST API for all CRUD operations
- Seed database with 10 sample FAQs
- Responsive design with Tailwind CSS
- Loading states, error handling, search functionality

#### What Was Built

**Backend (server/)**
- `index.js` — Express server, MongoDB via Mongoose, CORS, global error handler
- `.env` — `MONGO_URI=mongodb://localhost:27017/crowdfaq`, `PORT=5000`
- `models/FAQ.js` — Fields: `question`, `answer`, `category`, timestamps
- `models/Question.js` — Fields: `title`, `description`, `answerCount` (default 0), timestamps
- `models/Answer.js` — Fields: `questionId` (ObjectId ref to Question), `body`, `author` (default "Anonymous"), timestamps
- `routes/faqs.js` — `GET /api/faqs` (with `?search=` query), `GET /api/faqs/:id`
- `routes/questions.js` — `GET /api/questions`, `POST /api/questions`, `GET /api/questions/:id`
- `routes/answers.js` — `GET /api/answers/:questionId`, `POST /api/answers` (increments `answerCount` on parent question)
- `seed.js` — Seeds 10 FAQs across categories: General, Getting Started, Community

**Frontend (client/src/)**
- `services/api.js` — Axios instance with `baseURL: '/api'`; functions: `fetchFAQs`, `fetchQuestions`, `fetchQuestion`, `createQuestion`, `fetchAnswers`, `createAnswer`
- `App.jsx` — React Router v6 with `BrowserRouter` + `Routes` for all 4 routes
- `index.css` — Tailwind directives + component layer classes: `.btn-primary`, `.btn-secondary`, `.card`, `.input-field`, `.badge`, `.gradient-text`, `.hero-gradient`
- `components/Navbar.jsx` — Sticky, glassmorphism (`bg-white/80 backdrop-blur-md`), active link underline, mobile hamburger menu
- `components/Footer.jsx` — Logo + nav links + copyright
- `components/AccordionItem.jsx` — Animated `max-h` expand/collapse, numbered index, category badge, chevron rotates on open
- `components/Spinner.jsx` — Configurable size spinner with label text
- `components/ErrorMessage.jsx` — Warning icon + error message
- `pages/FAQPage.jsx` — Gradient hero, 350ms debounced search, accordion list, empty/loading/error states
- `pages/AskQuestionPage.jsx` — Form with `title` + `description`, char counters (200/2000), tips box, inline spinner on submit, success state with redirect options
- `pages/CommunityPage.jsx` — All questions sorted newest first, answer count badge (green if >0), relative `timeAgo()` timestamps, empty state CTA
- `pages/QuestionDetailPage.jsx` — Breadcrumb nav, question card, all answers with avatar initials + numbered badge, inline answer form (author optional), optimistic UI update (answer appended immediately to list without refetch)

**Config Files**
- `vite.config.js` — Port 3000, `/api` proxy to `:5000`
- `tailwind.config.js` — Custom `primary` color = Indigo scale, font = Inter
- `postcss.config.js` — Standard Tailwind/Autoprefixer
- Root `package.json` — `postinstall` installs server + client, `dev` uses `concurrently`

#### npm Commands Run
```bash
npm install          # All deps installed (root + server + client via postinstall)
npm run seed         # ✅ 10 FAQs seeded to MongoDB
npm run dev          # ✅ Both servers running
```

#### Verified Working
- ✅ FAQ page loads with 10 accordion cards
- ✅ Search works with debounce
- ✅ Ask Question form submits and shows success state
- ✅ Community page shows submitted questions with answer count + timestamps
- ✅ Question detail page loads question + answers
- ✅ Answer submission appends answer immediately (optimistic update)
- ✅ Navbar active links, mobile menu, sticky glassmorphism effect
- ✅ Server connected to MongoDB on startup

---

### Session 3 — 2026-06-09 (Major Feature Expansion)

**Conversation ID**: `2da32c39-ebd0-4337-8ef7-748fa50ee2cc`

**User Request**: Add full feature set to all 3 pages + dark mode toggle.

#### New Features Added

**Backend**
- `FAQ.js` model: added `tags[]`, `keywords[]`, `status` (approved/pending/rejected), `helpfulYes`, `helpfulNo`, `views`
- `Question.js` model: added `name`, `email`, `category`, `tags[]`, `status`
- `Answer.js` model: added `status` (pending/approved/rejected)
- `routes/faqs.js`: smart multi-field search (question, answer, tags, keywords, category), 3 sort modes (latest/helpful/views), category filter, `POST /:id/vote` for yes/no voting
- `routes/questions.js`: spam prevention (1 email/hour via DB check), `GET /similar?q=` for duplicate detection (word-based regex), status filter, `PATCH /:id/status` for approve/reject
- `routes/answers.js`: status filter on GET, `PATCH /:id/status` for approve/reject
- `seed.js`: 10 internship-themed FAQs with realistic categories (Applications, Stipend, Timeline, Certificates, Projects), tags, keywords, vote counts, view counts

**Frontend Infrastructure**
- `tailwind.config.js`: added `darkMode: 'class'`, custom `fadeIn`/`slideDown` animations
- `src/context/ThemeContext.jsx`: React context for dark mode, persists to `localStorage`, detects system preference on first visit
- `src/utils/constants.js`: `CATEGORIES`, `QUESTION_CATEGORIES`, `timeAgo()`, `STATUS_META` (badge colors), `CATEGORY_COLORS` (per-category badge colors), all with dark variants
- `src/services/api.js`: added `fetchFAQCategories`, `voteFAQ`, `fetchSimilar`, `updateQuestionStatus`, `updateAnswerStatus`, params support on `fetchFAQs`/`fetchQuestions`/`fetchAnswers`
- `src/index.css`: full dark mode variants for all component classes; new `.btn-success`, `.btn-danger`, `.page-header`, `.select-field`, `.tag-chip`, `.glass` utilities
- `src/App.jsx`: wrapped in `<ThemeProvider>`

**Page 1 — FAQ Page (`/`)**
- Sticky category filter bar with pill buttons (All + 8 categories)
- Sort dropdown: Latest / Most Helpful / Most Viewed
- Debounced search (350ms) hits server-side multi-field regex
- `AccordionItem`: category badge, tag chips, view count, Yes/No voting with localStorage dedup, helpful percentage shown after voting

**Page 2 — Ask Question (`/ask`)**
- Fields: Name, Email, Category dropdown, Question Title, Description, Tags
- Chip-based `TagInput` component (Enter/comma to add, Backspace to remove, max 5)
- Real-time duplicate detection: debounced 600ms call to `/api/questions/similar`, collapsible SimilarPanel shows matching FAQs with expandable answers
- Spam prevention: server returns 429 with wait time if same email submitted within 1 hour
- Animated success screen with pending-review status message

**Page 3 — Community / Answering (`/community`)**
- Status tabs: All | Pending (with red count badge) | Approved | Rejected
- Search bar + category dropdown filter
- Each card shows: status badge, category badge, answer count, relative time, submitter name + email, tags
- Inline Approve / Reject / Mark Pending buttons with loading state

**Question Detail (`/community/:id`)**
- Question moderation bar (Approve/Reject/Mark Pending on the question itself)
- Answer filter tabs: all / pending / approved / rejected
- Each answer has Approve / Reject / Mark Pending buttons
- Status badge on each answer
- Submit answer form: pending status by default, success toast

**Dark Mode**
- Toggle button in Navbar (sun/moon icon)
- Persists to `localStorage` key `crowdfaq-theme`
- Detects OS preference on first visit
- All pages, cards, inputs, buttons, badges have `dark:` variants

#### Files Created/Modified in Session 3
```
server/models/FAQ.js           ← updated
server/models/Question.js      ← updated
server/models/Answer.js        ← updated
server/routes/faqs.js          ← major update
server/routes/questions.js     ← major update
server/routes/answers.js       ← major update
server/seed.js                 ← updated (internship FAQs)
client/tailwind.config.js      ← darkMode: 'class' + animations
client/src/index.css           ← dark mode variants for all classes
client/src/context/ThemeContext.jsx  ← NEW
client/src/utils/constants.js       ← NEW
client/src/services/api.js     ← updated
client/src/App.jsx             ← ThemeProvider wrapper
client/src/components/Navbar.jsx    ← dark mode toggle
client/src/components/Footer.jsx    ← dark variants
client/src/components/Spinner.jsx   ← dark variants
client/src/components/AccordionItem.jsx ← full rewrite with voting + tags
client/src/pages/FAQPage.jsx        ← full rewrite
client/src/pages/AskQuestionPage.jsx ← full rewrite
client/src/pages/CommunityPage.jsx  ← full rewrite
client/src/pages/QuestionDetailPage.jsx ← full rewrite
```

---

### Session 5 — 2026-06-09 (GitHub Readiness)

**User Request**: Make project GitHub-ready with proper `.gitignore`, updated README for clone-and-run, prepare for pushing to a repo.

#### What Was Done
- `.gitignore` — MERN-standard ignores: `node_modules/`, `server/.env`, `client/dist/`, logs, OS/IDE files, `.cursor/`
- `.gitattributes` — normalized LF line endings for cross-platform clones
- `server/.env.example` — committed template; developers copy to `server/.env` (gitignored)
- `package.json` — added `engines` (Node 18+, npm 9+), `keywords`, `start` script
- `README.md` — rewritten for open-source onboarding: features, clone steps, env setup, Atlas notes, troubleshooting, GitHub publish guide

#### Clone & Run Checklist (for new developers)
1. `git clone <repo>`
2. `npm install`
3. Copy `server/.env.example` → `server/.env`
4. Start MongoDB
5. `npm run seed`
6. `npm run dev` → http://localhost:3000

---

### Session 4 — 2026-06-09 (Dark Mode Fix + Authentication)

**User Request**: Fix non-working dark mode toggle; add login/signup page and auth system; update README.md and CONTEXT.md.

#### Dark Mode Fix
**Root cause**: `ThemeContext` applied the `dark` class to `<html>`, but `index.css` used a `body.dark` selector that never matched. Body background stayed light (`bg-slate-50`) regardless of toggle state.

**Fix applied**:
- `index.css` — replaced `body.dark { … }` with Tailwind `dark:` variants on `body`
- `index.html` — blocking inline script applies theme class + `color-scheme` before React paints (prevents flash)
- `ThemeContext.jsx` — applies theme synchronously on init; sets `color-scheme`; throws if used outside provider

#### Authentication System Added

**Backend**
- `models/User.js` — name, email (unique), bcrypt-hashed password
- `middleware/auth.js` — `signToken`, `requireAuth`, `optionalAuth`; JWT 7-day expiry
- `routes/auth.js` — `POST /register`, `POST /login`, `GET /me`
- `routes/questions.js` — `POST /` now requires auth; uses `req.user.name` and `req.user.email`
- `routes/answers.js` — `POST /` now requires auth; author set from `req.user.name`
- `.env` — added `JWT_SECRET`
- Dependencies: `bcryptjs`, `jsonwebtoken`

**Frontend**
- `context/AuthContext.jsx` — login/register/logout; token in `localStorage` key `crowdfaq-token`
- `pages/AuthPage.jsx` — tabbed login/signup UI at `/auth`
- `components/ProtectedRoute.jsx` — redirects guests to `/auth` with return path
- `services/api.js` — `setAuthToken`, `register`, `login`, `fetchMe`
- `App.jsx` — `AuthProvider`; `/auth` route; `/ask` wrapped in `ProtectedRoute`
- `Navbar.jsx` — Log In / user avatar + Log out; Ask Question redirects guests to auth
- `AskQuestionPage.jsx` — removed manual name/email fields; shows logged-in user card
- `QuestionDetailPage.jsx` — answer form hidden for guests; login CTA with return path

#### Auth Flow
1. Guest browses FAQs and community freely
2. Guest clicks Ask Question or Submit Answer → redirected to `/auth`
3. After login/signup, JWT stored and user returned to intended page
4. POST question/answer uses authenticated identity server-side

#### Files Created/Modified in Session 4
```
server/models/User.js              ← NEW
server/middleware/auth.js          ← NEW
server/routes/auth.js              ← NEW
server/index.js                    ← auth routes mounted
server/routes/questions.js         ← requireAuth on POST
server/routes/answers.js           ← requireAuth on POST
server/.env                        ← JWT_SECRET
server/package.json                ← bcryptjs, jsonwebtoken
client/index.html                  ← theme flash-prevention script
client/src/index.css               ← dark mode body fix
client/src/context/ThemeContext.jsx ← robust theme apply
client/src/context/AuthContext.jsx  ← NEW
client/src/components/ProtectedRoute.jsx ← NEW
client/src/pages/AuthPage.jsx       ← NEW
client/src/services/api.js          ← auth functions
client/src/App.jsx                  ← AuthProvider + routes
client/src/components/Navbar.jsx    ← auth UI
client/src/pages/AskQuestionPage.jsx  ← auth integration
client/src/pages/QuestionDetailPage.jsx ← login prompt for answers
README.md                           ← full rewrite with auth docs
CONTEXT.md                          ← this update
```

---

### Session 2 — 2026-06-09 (Documentation Update)

**Conversation ID**: `2da32c39-ebd0-4337-8ef7-748fa50ee2cc` (same session)

**User Request**: Update README.md with comprehensive documentation and create CONTEXT.md to track everything across sessions.

#### What Was Done
- `README.md` — Fully rewritten with: project structure tree, prerequisites table, all npm scripts, full API reference table, MongoDB schema summary, design system description, planned features list
- `CONTEXT.md` — Created (this file) with: project identity, user preferences, session-by-session log, all implementation decisions, verified working status

---

## 🏗️ Architecture Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| Vite dev server proxy for `/api` | Avoids CORS setup in development; no need for separate CORS config on client |
| `answerCount` field on Question model | Avoids expensive `Answer.countDocuments()` on every list render; incremented atomically on answer POST |
| Optimistic UI update on answer submit | Better UX — answer appears immediately without a round-trip refetch |
| 350ms debounce on FAQ search | Reduces API calls while typing; server-side search using MongoDB `$regex` |
| `author` defaults to "Anonymous" | Legacy for old answers; new answers use authenticated user name |
| JWT auth with bcrypt passwords | Industry standard; stateless; 7-day token expiry |
| `localStorage` for token + theme | Simple persistence without cookies; works with Vite proxy |
| Blocking theme script in `index.html` | Prevents flash of wrong theme; syncs with React ThemeContext |
| `max-h` CSS trick for accordion | Pure CSS animation without JS height measurement or libraries |
| `concurrently` in root package.json | Single `npm run dev` starts both nodemon + vite; color-coded output |
| Global `.card`, `.btn-primary` etc. in `index.css` | Consistent design tokens; avoids duplicating long Tailwind utility chains |

---

## 🗄️ Database State

| Collection | Records | Notes |
|------------|---------|-------|
| `faqs` | 10 | Seeded via `npm run seed`; seed clears existing FAQs first |
| `users` | Grows with signups | Created via `/auth` register |
| `questions` | Grows with usage | Created via `/ask` form (requires login) |
| `answers` | Grows with usage | Created via question detail page (requires login) |

### Seeded FAQ Categories
- **General** (5 FAQs): What is CrowdFAQ, is it free, no account needed, different from static FAQ, future features
- **Getting Started** (3 FAQs): How to submit a question, how to answer, how to search
- **Community** (2 FAQs): What topics, what to do with wrong answers

---

## 🔧 Environment Variables

**Template**: `server/.env.example` (committed to git)

**Local file**: `server/.env` (gitignored — copy from example)

```env
MONGO_URI=mongodb://localhost:27017/crowdfaq
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-me
```

> If MongoDB runs on a different port or uses a remote URI (e.g. MongoDB Atlas), update `MONGO_URI` in your local `.env`.

---

## 📦 Dependencies

### Server (`server/package.json`)
| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.19.2 | HTTP server framework |
| `mongoose` | ^8.4.0 | MongoDB ODM |
| `bcryptjs` | latest | Password hashing |
| `jsonwebtoken` | latest | JWT auth tokens |
| `cors` | ^2.8.5 | Enable CORS headers |
| `dotenv` | ^16.4.5 | Load `.env` file |
| `nodemon` | ^3.1.4 (dev) | Auto-restart on file change |

### Client (`client/package.json`)
| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI library |
| `react-dom` | ^18.3.1 | DOM renderer |
| `react-router-dom` | ^6.24.0 | Client-side routing |
| `axios` | ^1.7.2 | HTTP client |
| `vite` | ^5.3.1 (dev) | Build tool + dev server |
| `@vitejs/plugin-react` | ^4.3.1 (dev) | React plugin for Vite |
| `tailwindcss` | ^3.4.4 (dev) | Utility-first CSS |
| `autoprefixer` | ^10.4.19 (dev) | CSS vendor prefixes |
| `postcss` | ^8.4.39 (dev) | CSS processor |

---

## 🔮 Future Work (Not Yet Started)

These features were explicitly excluded from the MVP. If the user asks to add them, implement them incrementally:

✅ **DONE** — Answer voting (Yes/No helpful on FAQs)
✅ **DONE** — Question tags/categories
✅ **DONE** — Dark mode toggle
✅ **DONE** — Duplicate detection
✅ **DONE** — Spam prevention
✅ **DONE** — Approve/Reject workflow for questions and answers
✅ **DONE** — Smart multi-field search
✅ **DONE** — Sort by latest/helpful/views
✅ **DONE** — User authentication (JWT, User model, login/signup page, protected POST routes)

✅ **DONE** — AI-Powered Suggested Answers (keyword-overlap matching against FAQ corpus)
✅ **DONE** — Reputation system (points, levels, leaderboard, upvotes)

**Still Remaining:**
1. **Pagination** — Add `?page=` and `?limit=` to list endpoints; add pagination UI
2. **Admin panel** — Dedicated protected route; role-based moderation; manage FAQs directly (CRUD on FAQ collection)
3. **Email notifications** — Nodemailer; notify question author when answer is posted
4. **Rich text editor** — Markdown support for answers (e.g., react-markdown + remark)
5. **Delete functionality** — Delete questions/answers (currently only status change is supported)

---

### Session 6 — 2026-06-11 (AI Suggestions + Reputation System)

**User Request**: Add AI-powered suggested answers for admins and a reputation/leaderboard system.

#### Feature 1: AI-Powered Suggested Answers

**How it works** (no external API key required):
- When a logged-in user opens the question detail page, an **🤖 AI Suggest** collapsible panel appears above the answer textarea
- On first expand, it calls `GET /api/suggest?q=<title + description>` which:
  1. Tokenises the question into significant keywords (filters stop words)
  2. Loads all approved FAQs from MongoDB (capped at 200)
  3. Scores each FAQ by `hits / totalKeywords` (word-overlap ratio)
  4. Returns the best match if `score >= 0.25` (25% confidence threshold)
- The panel shows: confidence bar, suggested text, source FAQ citation
- "Use this suggestion" button pre-fills the answer textarea; admin can edit before submitting

**Files changed:**
- `server/routes/suggest.js` ← **NEW** — keyword overlap scoring engine
- `server/index.js` ← mount `/api/suggest`
- `client/src/services/api.js` ← `fetchSuggestion(q)`
- `client/src/pages/QuestionDetailPage.jsx` ← `AISuggestionPanel` component (collapsible, confidence bar, pre-fill)

#### Feature 2: Reputation System

**Points schema (User model):**
| Action | Points | Stat field |
|--------|--------|------------|
| Ask a question | +2 | `questionsAsked` |
| Submit an answer | +5 | `answersGiven` |
| Answer gets approved | +15 | `answersApproved` |
| Receive upvote | +10 | `upvotesReceived` |

**Levels** auto-recalculated on every point award:
- 🌱 Beginner: 0–49 pts
- ⭐ Contributor: 50–199 pts
- 🏆 Expert: 200+ pts

**Upvote system:**
- Toggle upvote on any answer (`POST /api/answers/:id/upvote`)
- Tracked per voter email (`upvotedBy[]` array on Answer model) to prevent double-voting
- Upvote button appears on each answer card; fills solid when voted; shows count
- Requires auth; disabled/grayed for guests with tooltip

**Leaderboard:**
- `GET /api/users/leaderboard` — top contributors sorted by points (public endpoint)
- `LeaderboardPage.jsx` at `/leaderboard` — gradient hero with level legend, ranked cards with progress bars, stats row, points-system explanation
- Medal icons for top 3 (🥇🥈🥉)
- Navbar updated with "🏆 Leaderboard" link (desktop + mobile)

**Files created/modified in Session 6:**
```
server/models/User.js              ← added points, level, stats fields + recalcLevel()
server/models/Answer.js            ← added authorId, upvotes, upvotedBy
server/routes/answers.js           ← awardPoints helper, upvote endpoint, approval bonus
server/routes/questions.js         ← award 2 pts on question submit
server/routes/suggest.js           ← NEW: AI suggestion engine
server/routes/users.js             ← NEW: leaderboard + public profile endpoints
server/index.js                    ← mount /api/users and /api/suggest
client/src/services/api.js         ← upvoteAnswer, fetchSuggestion, fetchLeaderboard, fetchUserProfile
client/src/pages/QuestionDetailPage.jsx  ← AISuggestionPanel + upvote buttons
client/src/pages/LeaderboardPage.jsx     ← NEW: full leaderboard UI
client/src/App.jsx                 ← /leaderboard route
client/src/components/Navbar.jsx   ← 🏆 Leaderboard nav link
README.md                          ← full rewrite with all features documented
CONTEXT.md                         ← this update
```

---

### Session 7 — 2026-06-11 (Profile Page, Save FAQs, Confidence Scores, People-like-you, UI Overhaul)

**User Request**: Profile page, save-FAQ heart button, AI confidence scores on answers, "People like you asked" sidebar, and a UI modernisation pass.

#### Feature 1: User Profile Page (`/profile`)

- `GET /api/users/me/profile` — returns full user data + populated savedFAQs + last 10 questions + last 10 answers (with `questionId.title` populated)
- `ProfilePage.jsx` — rich profile with:
  - Gradient banner (colour matches user level)
  - Gradient avatar with initial
  - Level progress bar showing pts to next level
  - 4 `stat-card` tiles: Questions Asked, Answers Given, Answers Approved, Upvotes Received
  - **3 tabs**: Questions / Answers / Saved FAQs — each with empty-state CTAs
  - Answers tab shows confidence score bars
  - Sign out button
- Navbar: user avatar chip is now a clickable `<Link to="/profile">` with gradient background

#### Feature 2: Save FAQs (Heart button)

- `User.savedFAQs: [ObjectId ref FAQ]` added to User model
- `POST /api/auth/save-faq/:faqId` — toggles save/unsave; returns `{ saved: bool, savedFAQs: [...] }`
- `GET /api/auth/me` — now populates `savedFAQs` array
- `AuthContext.saveFAQ(faqId)` — calls API, updates `user.savedFAQs` locally
- `AuthContext.isFAQSaved(faqId)` — checks if an FAQ id is in `user.savedFAQs`
- `AccordionItem` — heart icon appears when logged in; filled/rose when saved, hollow/grey otherwise
- Saving state (`saving`) prevents double-click; propagation stopped so click doesn't toggle accordion

#### Feature 3: AI Confidence Scores on Answers

- `Answer.confidence: Number (0–100)` added to Answer model
- `computeConfidence(title, desc, body)` in `answers.js` — runs at submit time:
  - Blends **60% question keyword coverage** + **40% FAQ corpus alignment**
  - Capped at 100, stored on the Answer document
- **Question Detail page**: confidence bar shown under each answer body (green ≥70, amber ≥40, red <40)
- **Profile page Answers tab**: same colour-coded bar shown for each answer

#### Feature 4: "People Like You Also Asked" Sidebar

- `GET /api/faqs/related?category=<>&tags=<>&exclude=<>` — returns up to 4 FAQs in same category / sharing tags, sorted by helpful votes + views
- `FAQPage` two-column layout (main + sidebar) on desktop; sidebar has:
  - `RelatedFAQs` component — renders when any FAQ is expanded (tracked via `openFaq` state)
  - Login CTA card for guests to encourage saving FAQs

#### Feature 5: UI Modernisation

- `index.css` — `btn-primary` now gradient + shadow-glow; `card-hover` with lift; `stat-card`, `confidence-bar-track/fill`, `glow-primary`, `animate-slide-up`, `no-scrollbar`
- `AccordionItem` — gradient number badge (rounded-xl), gradient chevron background, modern vote buttons with shadow
- `FAQPage` — hero has decorative blur blobs, quick-stats count bar, gradient category pills, two-column layout
- Navbar user chip — gradient rounded-lg avatar, icon-only logout button with tooltip

**Files created/modified in Session 7:**
```
server/models/User.js              ← added savedFAQs field
server/models/Answer.js            ← added confidence field
server/routes/auth.js              ← publicUser with reputation, /save-faq/:faqId, /me with populate
server/routes/faqs.js              ← /related endpoint
server/routes/answers.js           ← computeConfidence(), confidence stored at submit
server/routes/users.js             ← /me/profile with questions+answers+savedFAQs
client/src/services/api.js         ← toggleSaveFAQ, fetchRelatedFAQs, fetchMyProfile
client/src/context/AuthContext.jsx ← saveFAQ(), isFAQSaved()
client/src/index.css               ← full modernisation pass
client/src/components/AccordionItem.jsx  ← heart save button, gradient badge/chevron
client/src/pages/FAQPage.jsx       ← two-col layout, blobs, RelatedFAQs sidebar
client/src/pages/QuestionDetailPage.jsx  ← confidence score bars on answers
client/src/pages/ProfilePage.jsx   ← NEW: full profile UI
client/src/App.jsx                 ← /profile route
client/src/components/Navbar.jsx   ← profile link, icon-only logout, mobile profile link
README.md                          ← updated with all features
CONTEXT.md                         ← this update
```

---

✅ **DONE** — User Profile Page with stats, history, and saved FAQs
✅ **DONE** — Save FAQ (heart toggle, persisted in DB)
✅ **DONE** — AI Confidence Scores on answers (stored at submit time)
✅ **DONE** — "People Like You Also Asked" related-FAQ sidebar
✅ **DONE** — UI Modernisation (gradients, glow, stats cards, animations)

**Still Remaining:**
1. **Pagination** — Add `?page=` and `?limit=` to list endpoints; add pagination UI
2. **Admin panel** — Dedicated protected route; role-based moderation; manage FAQs directly (CRUD on FAQ collection)
3. **Email notifications** — Nodemailer; notify question author when answer is posted
4. **Rich text editor** — Markdown support for answers (e.g., react-markdown + remark)
5. **Delete functionality** — Delete questions/answers (currently only status change is supported)

---

## 📋 How To Resume In A New Session

1. Read this file (`CONTEXT.md`) and `README.md`
2. Check current state of code in `d:\FAQ_TRY`
3. Ensure MongoDB is running locally on port `27017`
4. Run `npm run dev` from `d:\FAQ_TRY` if servers are not already running
5. The app should work at http://localhost:3000
6. Pick up from **Future Work** or address user's new request

---

*Last updated: 2026-06-11 — Session 7 (Profile page, Save FAQs, confidence scores, People-like-you sidebar, UI overhaul)*
