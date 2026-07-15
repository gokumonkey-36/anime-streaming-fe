import { useState, useEffect } from 'react';
import { getNews } from '../services/api';

const DEFAULT_IMAGE = 'https://thumbs.dreamstime.com/b/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available-236105299.jpg?w=768';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const datePart = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const timePart = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${datePart} · ${timePart}`;
}

function NewsCardSkeleton({ count = 8 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div className="news-card news-card-skeleton" key={i}>
      <div className="news-card-thumb skeleton-block" />
      <div className="news-card-body">
        <div className="skeleton-block skeleton-line" style={{ width: '85%' }} />
        <div className="skeleton-block skeleton-line" style={{ width: '55%' }} />
        <div className="skeleton-block skeleton-line" style={{ width: '35%' }} />
      </div>
    </div>
  ));
}

export function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getNews('news').then(res => {
      if (cancelled) return;
      if (res && res.success && Array.isArray(res.data)) {
        setNews(res.data);
      } else {
        setError(true);
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setError(true);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="news-page">
      <div className="news-page-header">
        <h1 className="news-page-title">📰 <span>Anime News</span></h1>
        <div className="news-page-subtitle">Latest updates from the anime & manga world</div>
      </div>

      <div className="news-list">
        {loading && <NewsCardSkeleton count={12} />}

        {!loading && error && (
          <div className="news-empty">
            <div className="empty-icon">⚠️</div>
            <div className="empty-text">Couldn't load news right now. Please try again later.</div>
          </div>
        )}

        {!loading && !error && news.length === 0 && (
          <div className="news-empty">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No news available right now.</div>
          </div>
        )}

        {!loading && !error && news.map((item, idx) => (
          <a
            className="news-card"
            key={item.slug || idx}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="news-card-thumb"
              src={item.image || DEFAULT_IMAGE}
              alt=""
              loading="lazy"
              onError={e => { e.target.onerror = null; e.target.src = DEFAULT_IMAGE; }}
            />
            <div className="news-card-body">
              <h3 className="news-card-title">{item.title}</h3>
              {item.excerpt && <p className="news-card-excerpt">{item.excerpt}</p>}
              <div className="news-card-meta">
                {item.source && <span className="news-card-source">{item.source}</span>}
                <span className="news-card-date">{formatDate(item.date)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}