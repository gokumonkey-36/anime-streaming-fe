import { useState, useEffect } from 'react';
import { getAnimeList } from '../services/api';

const TABS = ['Weekly', 'Monthly', 'All'];

export function TopAnimePanel({ onAnimeClick }) {
  const [activeTab, setActiveTab] = useState('Weekly');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setItems([]);
    getAnimeList(1, 10).then(data => {
      setItems(data.results || []);
      setLoading(false);
    });
  }, [activeTab]);

  return (
    <div className="top-anime-panel">
      <div className="top-anime-header">
        <h3 className="top-anime-title">Top Anime</h3>
        <div className="top-anime-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`top-anime-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="top-anime-list">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="top-anime-item-sk">
                <div className="skeleton top-rank-sk" />
                <div className="skeleton top-img-sk" />
                <div className="top-item-info-sk">
                  <div className="skeleton top-title-sk" />
                  <div className="skeleton top-meta-sk" />
                  <div className="skeleton top-rating-sk" />
                </div>
              </div>
            ))
          : items.map((anime, i) => (
              <div
                key={anime.id}
                className="top-anime-item"
                onClick={() => onAnimeClick?.(anime)}
              >
                <span className={`top-rank${i < 3 ? ' top-rank-gold' : ''}`}>
                  {i + 1}
                </span>
                <div className="top-anime-img-wrap">
                  <img src={anime.image} alt={anime.name} className="top-anime-img" loading="lazy" />
                </div>
                <div className="top-anime-info">
                  <div className="top-anime-name">{anime.name}</div>
                  <div className="top-anime-genres">
                    {anime.genres?.slice(0, 3).map(g => g.name).join(', ')}
                  </div>
                  <div className="top-anime-rating">
                    {'★'.repeat(Math.round((anime.rating || 0) / 2))}{'☆'.repeat(5 - Math.round((anime.rating || 0) / 2))}
                    <span className="top-rating-num">{anime.rating?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
