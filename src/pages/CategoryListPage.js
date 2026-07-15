import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getAnimeList, getAnimeByGenre, getAnimeTrend, getGenreList } from '../services/api';
import { AnimeCard, CardSkeleton } from '../components/AnimeCard';

const PAGE_SIZE = 36;

const STATIC_CATEGORIES = {
  popular: {
    label: 'Popular Anime',
    emoji: '⭐',
    fetchFn: (page) => getAnimeList(page, PAGE_SIZE),
  },
  trending: {
    label: 'Trending Anime',
    emoji: '🔥',
    fetchFn: (page) => getAnimeTrend(page, PAGE_SIZE),
  }
};

function getPaginationPages(currentPage, totalPages) {
  const pages = [];
  const delta = 2;
  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
}

export function CategoryListPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryConfig, setCategoryConfig] = useState(STATIC_CATEGORIES);
  const [configReady, setConfigReady] = useState(false);

  useEffect(() => {
    async function loadGenres() {
      try {
        const res = await getGenreList();
        const genres = res.genres || [];

        const dynamicGenres = {};
        genres.forEach((genre) => {
          const key = genre.name.toLowerCase(); // ← no replacing spaces, match URL exactly
          dynamicGenres[key] = {
            label: `${genre.name.charAt(0).toUpperCase() + genre.name.slice(1)} Anime`,
            emoji: '🎬',
            fetchFn: (page) => getAnimeByGenre(genre.name, page, PAGE_SIZE), // ← genre.name not genres array
          };
        });

        setCategoryConfig({ ...STATIC_CATEGORIES, ...dynamicGenres });
      } catch (err) {
        console.error('Failed to load genres', err);
      } finally {
        setConfigReady(true); // ← always mark ready even on error
      }
    }

    loadGenres();
  }, []);

  const config = categoryConfig[category?.toLowerCase()];

  const loadPage = useCallback(async (page) => {
    if (!config) return;
    setLoading(true);
    setResults([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const data = await config.fetchFn(page);
    const items = data.results || [];
    setResults(items);

    if (data.count !== undefined) {
      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / PAGE_SIZE));
    } else {
      const hasNext = !!(data.next);
      setTotalPages(prev => {
        const estimated = hasNext ? page + 1 : page;
        return Math.max(prev, estimated);
      });
    }

    setLoading(false);
  }, [config]);

  useEffect(() => {
    if (!configReady) return; // ← wait for genres to load
    setTotalPages(1);
    loadPage(currentPage);
  }, [category, currentPage, configReady]); // ← configReady in deps

  const goToPage = (page) => {
    setSearchParams({ page: String(page) });
  };

  // Show skeleton while genres are loading
  if (!configReady) {
    return (
      <div className="category-list-page">
        <div className="search-grid"><CardSkeleton count={36} /></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="category-list-page">
        <div className="category-list-header">
          <button className="category-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <h1 className="category-list-title">Category not found</h1>
        </div>
      </div>
    );
  }

  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="category-list-page">
      <div className="category-list-header">
        <button className="category-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div>
          <h1 className="category-list-title">
            {config.emoji} <span>{config.label}</span>
          </h1>
          {totalCount > 0 && (
            <div className="category-list-count">{totalCount} anime found</div>
          )}
        </div>
      </div>

      <div className="search-grid">
        {loading
          ? <CardSkeleton count={36} />
          : results.map(anime => (
            <AnimeCard key={anime.id} anime={anime} className="card grid-card" />
          ))
        }
        {!loading && results.length === 0 && (
          <div className="search-no-results">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No anime found in this category.</div>
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            ← Previous
          </button>

          <div className="pagination-pages">
            {pages.map((p, i) =>
              p === '...'
                ? <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
                : (
                  <button
                    key={p}
                    className={`pagination-page-btn${p === currentPage ? ' active' : ''}`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                )
            )}
          </div>

          <button
            className="pagination-btn"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}