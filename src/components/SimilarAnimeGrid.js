import { useState, useEffect } from 'react';
import { searchAnime } from '../services/api';
import { AnimeCard, CardSkeleton } from '../components/AnimeCard';

const SIMILAR_PAGE_SIZE = 18;

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

export function SimilarAnimeGrid({ animeName }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!animeName) return;
    setLoading(true);
    setResults([]);
    // window.scrollTo({ top: 0, behavior: 'smooth' });

    searchAnime(animeName, currentPage, SIMILAR_PAGE_SIZE).then(data => {
      setResults(data.results || []);
      if (data.count != null) {
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / SIMILAR_PAGE_SIZE));
      } else {
        const hasNext = !!(data.paging?.next);
        setTotalPages(prev => Math.max(prev, hasNext ? currentPage + 1 : currentPage));
      }
      setLoading(false);
    });

  }, [animeName, currentPage]);

  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title">Similar <span>Anime</span></div>
        {totalCount > 0 && (
          <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
            {totalCount} results
          </span>
        )}
      </div>

      <div className="search-grid">
        {loading
          ? <CardSkeleton count={SIMILAR_PAGE_SIZE} />
          : results.length === 0
            ? (
              <div className="search-no-results">
                <div className="empty-icon">🔍</div>
                <div className="empty-text">No similar anime found</div>
              </div>
            )
            : results.map(a => (
              <AnimeCard key={a.id} anime={a} className="card grid-card" />
            ))
        }
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage <= 1}
          >
            ← Previous
          </button>

          <div className="pagination-pages">
            {pages.map((p, i) =>
              p === '...'
                ? <span key={`e-${i}`} className="pagination-ellipsis">…</span>
                : (
                  <button
                    key={p}
                    className={`pagination-page-btn${p === currentPage ? ' active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                )
            )}
          </div>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage >= totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}