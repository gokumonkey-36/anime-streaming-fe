function getCurrentSeasonAndYear() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1–12
  const year = now.getFullYear();

  let season;

  if (month >= 1 && month <= 3) {
    season = "winter";
  } else if (month >= 4 && month <= 6) {
    season = "spring";
  } else if (month >= 7 && month <= 9) {
    season = "summer";
  } else {
    season = "fall";
  }

  return { year, season };
}
const BASE = process.env.REACT_APP_API_BASE || 'http://192.168.0.4:8000/api';

function getToken() {
  return localStorage.getItem('aniflix_token');
}

async function apiFetch(url, opts = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };

  // Only send Authorization to your Django backend
  if (token && url.startsWith(BASE)) {
    headers.Authorization = `Token ${token}`;
  }

  try {
    const res = await fetch(url, { ...opts, headers });
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}

// Anime
export const getAnimeList = (page = 1, pageSize = 10) =>
  apiFetch(`${BASE}/anime/?page=${page}&page_size=${pageSize}`);

export const getLatestAnimeList = (page, pageSize) =>
  apiFetch(`${BASE}/anime/latest/?page=${page}&page_size=${pageSize}`);

export const getAnimeTrend = (page = 1, pageSize = 10) =>{
  const { year, season } = getCurrentSeasonAndYear();
  return apiFetch(`${BASE}/anime/trend/?year=${year}&season=winter&page=${page}&page_size=${pageSize}`);
};

export const getLastWatch = (id=3) =>
  apiFetch(`${BASE}/history/last-seen/${id}/`);

export const getAnimeById = (id,flag) =>
  apiFetch(`${BASE}/anime/${id}/${flag}/`);

export const getAnimeByGenre = (genre, page = 1, pageSize = 10) =>
  apiFetch(`${BASE}/anime/genre/${encodeURIComponent(genre)}/?page=${page}&page_size=${pageSize}`);

export const getGenreList = (genre, page = 1, pageSize = 10) =>
  apiFetch(`${BASE}/genres/`);

export const searchAnime = (q, page = 1, pageSize = 5) =>
  apiFetch(`${BASE}/anime/search/?q=${encodeURIComponent(q)}&page=${page}&page_size=${pageSize}`);

// Auth
export const loginUser = (email, password) =>
  apiFetch(`${BASE}/auth/login/`, { method: 'POST', body: JSON.stringify({ email, password }) });

export const registerUser = (username, email, password, password2, avatar) =>
  apiFetch(`${BASE}/auth/register/`, { method: 'POST', body: JSON.stringify({ username, email, password, password2, avatar }) });

export const logoutUser = () =>
  apiFetch(`${BASE}/auth/logout/`, { method: 'POST' });

// Profile
// NOTE: this expects a backend endpoint at PATCH /auth/profile/ that accepts
// { username, email, avatar } and returns the updated user. Wire this up on
// the Django side (and add `avatar` to the register serializer) to persist
// these fields — until then this call will fail gracefully via apiFetch's
// try/catch and the UI will just show an error toast.
export const updateProfile = (payload) =>
  apiFetch(`${BASE}/auth/profile/`, { method: 'PATCH', body: JSON.stringify(payload) });

// History
export const recordWatch = (animeId) =>
  apiFetch(`${BASE}/history/watch/`, { method: 'POST', body: JSON.stringify({ anime_id: animeId }) });

// News
const NEWS_BASE = process.env.REACT_APP_NEWS_API_BASE || 'http://localhost:3000/api';

export const getNews = (tag = 'news') =>
  apiFetch(`${NEWS_BASE}/news`);
