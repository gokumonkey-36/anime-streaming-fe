import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnimeList } from '../services/api';

export function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAnimeList(1, 8).then(data => {
      const items = (data.results || []).filter(a => a.image).slice(0, 5);
      setSlides(items);
    });
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    startTimer();
    return () => clearTimeout(timerRef.current);
  }, [slides, current]);

  const startTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent(c => (c + 1) % slides.length);
    }, 5000);
  };

  const goTo = (idx) => {
    clearTimeout(timerRef.current);
    setCurrent((idx + slides.length) % slides.length);
  };

  if (!slides.length) return (
    <div className="hero" style={{ background: 'linear-gradient(135deg,#0b0b0f,#1a1a24)' }} />
  );

  return (
    <div className="hero">
      {slides.map((anime, i) => (
        <div key={anime.id} className={`hero-slide${i === current ? ' active' : ''}`}>
          <div className="hero-media">
            <img
              className="hero-bg"
              src={anime.image}
              alt={anime.name}
              onError={e => { e.target.src = 'https://via.placeholder.com/1920x1080/111118/dd2476?text=AniFlix'; }}
            />
            <div className="hero-gradient" />
          </div>
          <div className="hero-content">
            <div className="hero-badge">★ Featured</div>
            <div className="hero-title">{anime.name || 'Unknown'}</div>
            {anime.japanese_name && <div className="hero-ja">{anime.japanese_name}</div>}
            <div className="hero-meta">
              <span className="hero-rating">★ {anime.rating || 'N/A'}</span>
              <div className="hero-genres">
                {(anime.genres || []).slice(0, 3).map(g => (
                  <span key={g.name} className="genre-pill">{g.name}</span>
                ))}
              </div>
            </div>
            <div className="hero-desc">{anime.description || ''}</div>
            <div className="hero-btns">
              <button className="btn-watch" onClick={() => navigate(`/anime/${anime.id}`)}>▶ Watch Now</button>
              <button className="btn-info" onClick={() => navigate(`/anime/${anime.id}`)}>ℹ More Info</button>
            </div>
          </div>
        </div>
      ))}

      <button className="hero-arrow left" onClick={() => goTo(current - 1)}>‹</button>
      <button className="hero-arrow right" onClick={() => goTo(current + 1)}>›</button>

      <div className="hero-nav">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === current ? ' active' : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}