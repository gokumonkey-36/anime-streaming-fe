import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnimeById, recordWatch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnimeRow } from '../components/AnimeRow';
import { getAnimeByGenre, searchAnime } from '../services/api';
import { SimilarAnimeGrid } from '../components/SimilarAnimeGrid';

export function AnimeDetailsPage() {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, isInList, toggleList } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setAnime(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    getAnimeById(id,0).then(data => {
      console.log("anime",data)
      if (data.error) setAnime({ error: data.error });
      else setAnime(data);
      setLoading(false);
    });
  }, [id]);

  const handleToggleList = () => {
    if (!currentUser) {
      toast('Login to save anime to your list', 'error');
      navigate('/auth?mode=login');
      return;
    }
    const wasIn = isInList(anime.id);
    toggleList(anime.id);
    toast(wasIn ? 'Removed from My List' : 'Added to My List ♥', 'success');
  };

  const handleWatch = async () => {
    if (currentUser) {
      await recordWatch(anime.id);
    }
    navigate(`/watch/${anime.id}`);
    console.log(`/watch/${anime.id}`)
  };

  if (loading) return (
    <div className="page" id="details-page">
      <div style={{ padding: '8rem 2rem', color: 'var(--muted)', textAlign: 'center' }}>Loading...</div>
    </div>
  );

  if (!anime || anime.error) return (
    <div className="page" id="details-page">
      <div style={{ color: '#ff6b6b', padding: '8rem 2rem', textAlign: 'center' }}>
        {anime?.error || 'Anime not found'}
      </div>
    </div>
  );

  const studios = Array.isArray(anime.studio) ? anime.studio.join(', ') : (anime.studio || 'Unknown');
  const inList = isInList(anime.id);
  const avail = anime.availability || {};
  const firstGenre = anime.genres && anime.genres.length ? anime.genres[0].name.toLowerCase() : null;

  return (
    <div className="page" id="details-page">
      {/* Banner */}
      <div className="details-banner">
        <img
          src={anime.image || ''}
          alt={anime.name}
          // onError={e => { e.target.src = 'https://via.placeholder.com/1920x500/0b0b0f/dd2476?text=AniFlix'; }}
        />
        <div className="details-banner-grad" />
      </div>

      {/* Body */}
      <div className="details-body">
        {/* Poster */}
        <div>
          <div className="details-poster">
            <img
              src={anime.image || ''}
              alt={anime.name}
              // onError={e => { e.target.src = 'https://via.placeholder.com/200x300/1a1a24/dd2476?text=No+Image'; }}
            />
          </div>
        </div>

        {/* Main Info */}
        <div className="details-main">
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1, marginBottom: '.3rem', letterSpacing: '1px' }}>
            {anime.name || 'Unknown'}
          </h1>
          {anime.japanese_name && <div className="details-ja">{anime.japanese_name}</div>}
          <div className="details-badges">
            <span className="badge badge-type">{anime.type || 'Anime'}</span>
            <span className="badge badge-status">{(anime.status || '').replace(/_/g, ' ')}</span>
            {(anime.genres || []).map(g => (
              <span
                key={g.name}
                className="badge badge-genre"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/list/${g.name.toLowerCase()}`)}
              >
                {g.name}
              </span>
            ))}
          </div>
          <div className="details-rating-row">
            <div className="big-rating">★ {anime.rating || 'N/A'}</div>
            <div className="details-meta-item">
              <div className="details-meta-label">Episodes</div>
              <div className="details-meta-value">{anime.num_episodes || '?'}</div>
            </div>
            <div className="details-meta-item">
              <div className="details-meta-label">Studio</div>
              <div className="details-meta-value" style={{ fontSize: '.85rem' }}>{studios}</div>
            </div>
            <div className="details-meta-item">
              <div className="details-meta-label">Year</div>
              <div className="details-meta-value" style={{ fontSize: '.85rem' }}>{anime.start_year || anime.start_season?.year || '?'}</div>
            </div>
            <div className="details-meta-item">
              <div className="details-meta-label">Season</div>
              <div className="details-meta-value" style={{ fontSize: '.85rem' }}>{typeof anime.start_season === 'object'
                ? anime.start_season.season
                : anime.start_season || '?'}</div>
            </div>
          </div>
          <div className="details-desc">{anime.description || 'No description available.'}</div>
          <div className="details-btns">
            <button className="btn-watch" onClick={handleWatch}>▶ Watch Now</button>
            <button className="btn-info" onClick={handleToggleList}>
              {inList ? '♥ In My List' : '♡ Add to List'}
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="details-side">
          <div className="side-card">
            <div className="side-title">Info</div>
            <div className="side-row"><span className="side-label">Type</span><span className="side-value">{anime.type || '?'}</span></div>
            <div className="side-row"><span className="side-label">Episodes</span><span className="side-value">{anime.num_episodes || '?'}</span></div>
            <div className="side-row"><span className="side-label">Status</span><span className="side-value">{(anime.status || '?').replace(/_/g, ' ')}</span></div>
            <div className="side-row"><span className="side-label">Studio</span><span className="side-value" style={{ fontSize: '.75rem' }}>{studios}</span></div>
            {/* <div className="side-row"><span className="side-label">Year</span><span className="side-value">{anime.start_year || '?'}</span></div>
            <div className="side-row"><span className="side-label">Season</span><span className="side-value">{anime.start_season || '?'}</span></div> */}
          </div>
          <div className="side-card">
            <div className="side-title">Availability</div>
            <div className="avail-badges">
              {avail.sub && <span className="avail-sub">SUB</span>}
              {avail.dub && <span className="avail-dub">DUB</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Anime Row */}
      {/* {firstGenre && (
        <AnimeRow
          title='Similar <span>Anime</span>'
          fetchPage={(page, pageSize) => getAnimeByGenre(firstGenre, page, pageSize)}
        />
      )} */}

      {anime.name && (
        <SimilarAnimeGrid animeName={anime.name} />
      )}
    </div>
  );
}