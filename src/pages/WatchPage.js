import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnimeById, recordWatch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RANGE_SIZE = 100;

function buildRanges(total) {
  const ranges = [];
  for (let start = 1; start <= total; start += RANGE_SIZE) {
    const end = Math.min(start + RANGE_SIZE - 1, total);
    ranges.push({ start, end, label: `EPS: ${start}–${end}` });
  }
  return ranges;
}

export function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const toast = useToast();

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [currentLanguage, setCurrentLanguage] = useState('sub');
  const [selectedRangeIdx, setSelectedRangeIdx] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const iframeRef = useRef(null);
  const progressRef = useRef({ time: 0, duration: 0, percent: 0 });

  useEffect(() => {
    setLoading(true);
    setAnime(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getAnimeById(id,1).then(data => {
      if (data.error) { setAnime({ error: data.error }); setLoading(false); return; }
      setAnime(data);

      // Set default language based on availability
      const avail = data.availability || {};
      if (avail.sub) setCurrentLanguage('sub');
      else if (avail.dub) setCurrentLanguage('dub');

      setCurrentEpisode(1);
      setSelectedRangeIdx(0);
      setLoading(false);

      if (currentUser) recordWatch(data.id);
    });
  }, [id]);
  
  const numEpisodes = anime?.num_episodes || 1;
  const ranges = useMemo(() => buildRanges(numEpisodes), [numEpisodes]);
  const currentRange = ranges[selectedRangeIdx] || ranges[0];
  const episodesInRange = useMemo(() => {
    if (!currentRange) return [];
    const arr = [];
    for (let i = currentRange.start; i <= currentRange.end; i++) arr.push(i);
    return arr;
  }, [currentRange]);

  const streamUrl = anime
    ? `https://megaplay.buzz/stream/mal/${anime.id}/${currentEpisode}/${currentLanguage}`
    : '';

  const avail = anime?.availability || {};
  const showSub = !!avail.sub;
  const showDub = !!avail.dub;

  const handleEpisodeClick = (ep) => {
    setCurrentEpisode(ep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLanguageSwitch = (lang) => {
    setCurrentLanguage(lang);
  };

  const goToNextEpisode = () => {
    setCurrentEpisode(prev => {
      const next = prev + 1;
      if (next > numEpisodes) return prev; // already on last episode
      // Keep the episode-range dropdown in sync if we cross into the next range
      const nextRangeIdx = ranges.findIndex(r => next >= r.start && next <= r.end);
      if (nextRangeIdx !== -1 && nextRangeIdx !== selectedRangeIdx) {
        setSelectedRangeIdx(nextRangeIdx);
      }
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen for player postMessage events (auto-next & watch time tracking)
  useEffect(() => {
    function handlePlayerMessage(event) {
      // In production you may want to also check event.origin matches the
      // MegaPlay embed origin (e.g. "https://megaplay.buzz") before trusting data.
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          return;
        }
      }
      if (!data || typeof data !== 'object') return;

      // "time" — periodic progress updates while playing
      if (data.event === 'time') {
        progressRef.current = { time: data.time, duration: data.duration, percent: data.percent };
        if (anime) {
          try {
            localStorage.setItem(
              `aniflix_progress_${anime.id}_${currentEpisode}`,
              JSON.stringify({ time: data.time, duration: data.duration, percent: data.percent })
            );
          } catch (e) { /* ignore storage errors */ }
        }
      }

      // "watching-log" — alternate progress/log event some servers send
      if (data.type === 'watching-log') {
        progressRef.current = { time: data.currentTime, duration: data.duration };
      }

      // "complete" — episode finished, auto-advance to the next one
      if (data.event === 'complete') {
        goToNextEpisode();
      }

      // "error" — playback failed
      if (data.event === 'error') {
        toast?.('Playback error — try switching server or episode.', 'error');
      }
    }

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [anime, currentEpisode, numEpisodes, ranges, selectedRangeIdx]);

  const handleRangeChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedRangeIdx(idx);
    // Auto-select first episode of new range
    const range = ranges[idx];
    if (range) setCurrentEpisode(range.start);
  };

  if (loading) return (
    <div className="page watch-page">
      <div style={{ padding: '8rem 2rem', color: 'var(--muted)', textAlign: 'center' }}>Loading...</div>
    </div>
  );

  if (!anime || anime.error) return (
    <div className="page watch-page">
      <div style={{ color: '#ff6b6b', padding: '8rem 2rem', textAlign: 'center' }}>
        {anime?.error || 'Anime not found'}
      </div>
    </div>
  );

  const desc = anime.description || 'No description available.';
  const shortDesc = desc.length > 180 ? desc.slice(0, 180) + '...' : desc;

  return (
    <div className="page watch-page">
      <div className="watch-layout">

        {/* ── LEFT: Episodes Panel ── */}
        <aside className="watch-episodes-panel">
          <div className="ep-panel-header">
            <span className="ep-panel-title">List of Episodes</span>
            {ranges.length > 1 && (
              <select
                className="ep-range-select"
                value={selectedRangeIdx}
                onChange={handleRangeChange}
              >
                {ranges.map((r, i) => (
                  <option key={i} value={i}>{r.label}</option>
                ))}
              </select>
            )}
          </div>
          <div className="ep-grid-scroll">
            <div className="ep-grid">
              {episodesInRange.map(ep => (
                <button
                  key={ep}
                  className={`ep-btn${currentEpisode === ep ? ' ep-btn-active' : ''}`}
                  onClick={() => handleEpisodeClick(ep)}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── CENTER: Player ── */}
        <main className="watch-player-section">
          <div className="watch-player-wrap">
            <iframe
              ref={iframeRef}
              key={streamUrl}
              src={streamUrl}
              className="watch-iframe"
              allowFullScreen
              frameBorder="0"
              allow="autoplay; fullscreen"
              title={`${anime.name} Episode ${currentEpisode}`}
            />
          </div>

          <div className="watch-player-meta">
            <div className="watch-now-label">
              <span className="watch-now-dot" />
              Now Watching
            </div>
            <div className="watch-now-title">
              {anime.name} — Episode {currentEpisode}
            </div>
          </div>

          <div className="watch-server-row">
            <span className="watch-server-label">Stream:</span>
            {showSub && (
              <button
                className={`watch-server-btn${currentLanguage === 'sub' ? ' active' : ''}`}
                onClick={() => handleLanguageSwitch('sub')}
              >
                SUB
              </button>
            )}
            {showDub && (
              <button
                className={`watch-server-btn${currentLanguage === 'dub' ? ' active' : ''}`}
                onClick={() => handleLanguageSwitch('dub')}
              >
                DUB
              </button>
            )}
          </div>
        </main>

        {/* ── RIGHT: Anime Info ── */}
        <aside className="watch-info-panel">
          <div className="watch-info-poster">
            <img
              src={anime.image || ''}
              alt={anime.name}
              onError={e => { e.target.src = 'https://via.placeholder.com/220x310/1a1a24/dd2476?text=No+Image'; }}
            />
          </div>
          <div className="watch-info-body">
            <div className="watch-info-title">{anime.name}</div>
            <div className="watch-info-desc">
              {descExpanded ? desc : shortDesc}
              {desc.length > 180 && (
                <button
                  className="watch-info-more"
                  onClick={() => setDescExpanded(v => !v)}
                >
                  {descExpanded ? ' Less' : ' More'}
                </button>
              )}
            </div>
            <button
              className="btn-watch"
              style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem' }}
              onClick={() => navigate(`/anime/${anime.id}`)}
            >
              View Detail
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
