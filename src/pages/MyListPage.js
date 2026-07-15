import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnimeById } from '../services/api';
import { AnimeCard } from '../components/AnimeCard';

export function MyListPage() {
  const { currentUser, myList } = useAuth();
  const [animeItems, setAnimeItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth?mode=login');
      return;
    }
    if (!myList.length) { setAnimeItems([]); return; }

    setLoading(true);
    Promise.all(myList.map(id => getAnimeById(id,0))).then(results => {
      setAnimeItems(results.filter(a => !a.error));
      setLoading(false);
    });
  }, [myList, currentUser, navigate]);

  return (
    <div className="mylist-page">
      <div className="mylist-header">
        <div className="mylist-title">My <span style={{ color: 'var(--accent)' }}>List</span></div>
        <div className="mylist-count">{myList.length} anime saved</div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--muted)', fontSize: '.875rem' }}>Loading...</div>
      ) : myList.length === 0 ? (
        <div className="empty-state" style={{ gridColumn: '1/-1' }}>
          <div className="empty-icon">🎌</div>
          <div className="empty-text">Your list is empty. Browse anime and save your favourites!</div>
          <br />
          <button className="btn-watch" onClick={() => navigate('/')} style={{ margin: 'auto' }}>
            Browse Anime
          </button>
        </div>
      ) : (
        <div className="mylist-grid">
          {animeItems.map(anime => (
            <AnimeCard key={anime.id} anime={anime} className="card grid-card" />
          ))}
        </div>
      )}
    </div>
  );
}
