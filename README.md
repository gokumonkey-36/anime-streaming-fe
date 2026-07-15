# AniFlix — React Upgrade

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set your API base URL (optional — defaults to http://192.168.0.110:8000/api)
# Create a .env file:
echo "REACT_APP_API_BASE=http://your-server:8000/api" > .env

# 3. Start dev server
npm start

# 4. Build for production
npm run build
```

---

## 📁 Project Structure

```
src/
├── services/
│   └── api.js              ← All API calls in one place
├── context/
│   ├── AuthContext.js      ← Global auth + watchlist state
│   └── ToastContext.js     ← Toast notifications
├── components/
│   ├── Navbar.js           ← Navbar with search dropdown
│   ├── HeroSlider.js       ← Auto-sliding hero
│   ├── AnimeRow.js         ← Horizontal row with infinite scroll
│   ├── AnimeCard.js        ← Reusable card + skeleton
│   └── Footer.js
├── pages/
│   ├── HomePage.js         ← / (hero + genre rows)
│   ├── AnimeDetailsPage.js ← /anime/:id
│   ├── SearchPage.js       ← /search?q=... (infinite scroll)
│   ├── MyListPage.js       ← /mylist
│   └── AuthPage.js         ← /auth?mode=login|register
├── App.js                  ← Router setup
├── index.js
└── index.css               ← All styles (unchanged from original)
```

---

## ✅ What Changed vs Original

| Feature | Before | After |
|---|---|---|
| Routing | Manual `display:none` toggling | React Router v6 with `<Routes>` |
| Back/Forward nav | Broken | Works correctly (browser history) |
| Search page | Didn't exist | `/search?q=...` with infinite scroll |
| Row pagination | One page only | Loads next page on scroll/arrow |
| State | DOM manipulation | React state + Context API |
| API calls | Inline scattered | Centralized `src/services/api.js` |
| Auth | Manual DOM updates | Context + localStorage |
| Watchlist | Global variable | React Context (persisted) |

## 🎨 What Stayed the Same

- **All CSS** (exact copy, zero changes)
- **All animations** (hero slider, card hover, shimmer skeleton)
- **All component designs** (cards, navbar, hero, auth form, etc.)
- **API endpoints** (same backend URLs)
- **Auth flow** (login/register/logout with token)
- **Toast notifications**

---

## 🔧 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_BASE` | `http://192.168.0.110:8000/api` | Your Django API base URL |
