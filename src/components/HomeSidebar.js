import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGenreList } from '../services/api';
import { TopAnimePanel } from './TopAnimePanel';

const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'];
const STATUSES = ['Ongoing', 'Completed'];
const TYPES = ['TV', 'Movie', 'OVA', 'ONA'];
const ORDERS = ['Rating', 'Latest Update', 'Name A-Z'];

function getCurrentSeason() {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  let season = 'Winter';
  if (month >= 4 && month <= 6) season = 'Spring';
  else if (month >= 7 && month <= 9) season = 'Summer';
  else if (month >= 10 && month <= 12) season = 'Fall';
  return { season, year };
}

function MultiSelectField({ label, options, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const displayText = selected.length === 0
    ? label
    : selected.length === 1
      ? selected[0]
      : `${selected[0]} +${selected.length - 1}`;

  return (
    <div className="qf-multiselect" ref={wrapRef}>
      <button
        type="button"
        className={`qf-field qf-select-btn${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={selected.length ? '' : 'qf-placeholder'}>{displayText}</span>
        <span className="qf-caret">▾</span>
      </button>
      {open && (
        <div className="qf-dropdown">
          {options.map(opt => (
            <label key={opt} className="qf-option">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
          {options.length === 0 && <div className="qf-option-empty">No options</div>}
        </div>
      )}
    </div>
  );
}

export function HomeSidebar() {
  const navigate = useNavigate();
  const [genreOptions, setGenreOptions] = useState([]);
  const [genres, setGenres] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [types, setTypes] = useState([]);
  const [order, setOrder] = useState('');

  useEffect(() => {
    getGenreList().then(res => setGenreOptions((res.genres || []).map(g => g.name))).catch(() => {});
  }, []);

  const makeToggle = (setFn) => (value) => {
    setFn(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const handleSearch = () => {
    if (genres.length) navigate(`/list/${genres[0].toLowerCase()}`);
    else navigate('/list/trending');
  };

  const { season: curSeason, year } = getCurrentSeason();

  return (
    <aside className="home-sidebar">
      <div className="quick-filter-box">
        <h3 className="quick-filter-title">Quick filter</h3>
        <div className="quick-filter-grid">
          <MultiSelectField label="Genre" options={genreOptions} selected={genres} onToggle={makeToggle(setGenres)} />
          <MultiSelectField label="Season" options={SEASONS} selected={seasons} onToggle={makeToggle(setSeasons)} />
          <MultiSelectField label="Status" options={STATUSES} selected={statuses} onToggle={makeToggle(setStatuses)} />
          <MultiSelectField label="Type" options={TYPES} selected={types} onToggle={makeToggle(setTypes)} />
          <select className="qf-field" value={order} onChange={e => setOrder(e.target.value)}>
            <option value="">Order by Default</option>
            {ORDERS.map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <button className="qf-search-btn" onClick={handleSearch}>🔍 Search</button>
      </div>

      <div className="season-banner" onClick={() => navigate('/news')}>
        <div className="season-banner-top">{curSeason} Season {year}</div>
        <div className="season-banner-box">
          {/* <span className="season-banner-tag">{curSeason.toUpperCase()} {year}</span> */}
          <span className="season-banner-tag">Latest Anime News</span>
        </div>
      </div>

      <TopAnimePanel onAnimeClick={(anime) => navigate(`/anime/${anime.id}`)} />
    </aside>
  );
}
