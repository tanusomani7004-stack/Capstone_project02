# 🚀 StudyOS — AI Productivity Dashboard for Students

> Capstone Project | Domain: Education | React + Vite + Tailwind CSS

---

## 🌐 Live APIs Used

| API | Endpoint | Used For |
|-----|----------|----------|
| **quotable.io** | `https://api.quotable.io` | Daily motivational quotes on Dashboard |
| **Open Library** | `https://openlibrary.org` | Book search in Notes section |
| **Numbers API** | `http://numbersapi.com` | Math facts in Analytics / Dashboard |

> ✅ All APIs are **free**, **no API key required**, **no sign-up needed**

---

## ⚡ Quick Start (3 commands)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# http://localhost:5173
```

**Login:** Any email + password (min 4 chars)  
**OR:** Click **"Try Demo Account"** for instant access

---

## 📁 Project Structure

```
src/
├── services/
│   └── api.js              ← All 3 API integrations (Quotes, Books, Numbers)
├── context/
│   └── AppContext.jsx       ← Global state (Context API + useReducer)
├── hooks/
│   └── index.js             ← useDebounce, useAIInsights, useLocalStorage
├── components/
│   ├── common/
│   │   ├── ErrorBoundary.jsx   ← Class-based error boundary
│   │   └── ProtectedRoute.jsx  ← Auth guard
│   └── layout/
│       ├── Layout.jsx          ← Main layout wrapper
│       └── Sidebar.jsx         ← Navigation + score display
├── pages/
│   ├── Login.jsx           ← Auth (login + register + demo)
│   ├── Dashboard.jsx       ← Home + Quote API + Numbers API
│   ├── Tasks.jsx           ← Full CRUD + filter/sort/search/pagination
│   ├── Notes.jsx           ← Notes CRUD + Open Library book search
│   ├── Calendar.jsx        ← Monthly calendar planner
│   ├── Analytics.jsx       ← Charts + weekly summary
│   └── Insights.jsx        ← AI rule-based insights + tips
├── App.jsx                 ← Router + lazy loading
├── main.jsx                ← Entry point
└── index.css               ← Global styles + Tailwind
```

---

## ✅ SOP Requirements Checklist

| SOP Requirement | Implementation |
|----------------|----------------|
| React (Vite) | ✅ `vite.config.js` |
| Context API | ✅ `AppContext.jsx` with `useReducer` |
| React Router v6 | ✅ 7 routes with protected routes |
| API Integration (3 real APIs) | ✅ quotable.io + Open Library + Numbers API |
| CRUD Operations | ✅ Tasks (full) + Notes (full) |
| Tailwind CSS | ✅ Custom config + dark mode |
| Lazy Loading | ✅ All pages via `React.lazy + Suspense` |
| Pagination | ✅ Tasks page (10 per page) |
| Search + Filter + Sort | ✅ Tasks & Notes pages |
| Dark Mode Toggle | ✅ Sidebar toggle, persisted |
| Error Boundary | ✅ Class-based, catches all render errors |
| Debounced Search | ✅ 300ms debounce hook |
| Dashboard with Charts | ✅ Bar, Line, Doughnut (Chart.js) |
| Authentication | ✅ Mock login/register with localStorage |
| Performance (useMemo/useCallback) | ✅ Throughout all pages |

---

## 🛠 Tech Stack

```
React 18        — UI Library
Vite            — Build tool (lightning fast HMR)
React Router v6 — Client-side routing
Context API     — Global state management
Chart.js        — Data visualizations
date-fns        — Date formatting
lucide-react    — Icons
Tailwind CSS    — Styling
uuid            — Unique IDs
```

---

## 🌟 Features

### Dashboard
- Greeting based on time of day
- **Live quote** from quotable.io API (refresh button)
- 4 stat cards (Done Today, Pending, Total, Overdue)
- Weekly bar chart + all-time doughnut chart
- Circular productivity gauge
- **Math fact** from Numbers API based on completed count
- AI-powered rule-based insights

### Tasks (Full CRUD)
- Add / Edit / Delete / Toggle complete
- Priority: High / Medium / Low
- Categories: Study / Project / Personal / Exam
- Overdue highlighting in red
- Search (debounced), filter, sort
- Pagination (10 per page)

### Notes + Book Search
- Create / Edit / Delete notes
- Tag system with quick-add tags
- Search by title, content, tags
- Tag filter buttons
- **📚 Books tab:** Real-time Open Library search
  - Search millions of books
  - See cover, author, year, rating, pages
  - Save books locally
  - Open in Open Library

### Calendar
- Monthly view with navigation
- Task dots colored by priority
- Click any day → see tasks
- Month summary stats

### Analytics
- 4 KPI cards
- 7-day productivity trend (Line chart)
- Priority breakdown (Doughnut chart)
- Weekly summary table with progress bars

### AI Insights
- 8 different smart messages (real-time conditions)
- Detects overdue, tomorrow load, high priority, time of day
- Trend comparison (today vs yesterday)
- 6 Productivity tips (Pomodoro, Spaced Repetition etc.)

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🚀 Deploy to Netlify

```bash
# Build first
npm run build

# Drag /dist folder to netlify.com/drop
```

---

## 📝 Submission Checklist

- [ ] GitHub repository (push this folder)
- [ ] Live deployed link (Vercel/Netlify)
- [ ] Project report PDF
- [ ] Demo video (optional)
- [ ] Viva / presentation

---

*Built with ❤️ using React + Vite + Tailwind CSS*
