import { useNavigate } from 'react-router-dom';

export function AnimeCard({ anime, className = 'card' }) {
  const navigate = useNavigate();

  return (
    <div className={className} onClick={() => navigate(`/anime/${anime.id}`)}>
      <div className="card-img-wrap">
        <img
          className="card-img"
          src={anime.image || ''}
          alt={anime.name}
          loading="lazy"
          onError={e => { e.target.src = 'https://via.placeholder.com/160x240/1a1a24/dd2476?text=No+Image'; }}
        />
        <div className="card-overlay">
          <div className="card-overlay-type">{anime.type || 'Anime'}</div>
          <div className="card-overlay-rating">★ {anime.rating || '?'}</div>
        </div>
      </div>
      <div className="card-info">
        <div className="card-title">{anime.name || 'Unknown'}</div>
        <div className="card-meta">
          <span className="rating-star">★</span>
          {anime.rating || '?'} · {anime.type || ''}
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-skeleton">
          <div className="skeleton img-sk" />
          <div className="skeleton title-sk" />
          <div className="skeleton meta-sk" />
        </div>
      ))}
    </>
  );
}
