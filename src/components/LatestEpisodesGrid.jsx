import { useState, useEffect } from 'react';
import { getAnimeList, getLatestAnimeList } from '../services/api';
import { AnimeCard, CardSkeleton } from '../components/AnimeCard';

const LATEST_PAGE_SIZE = 21;

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

export function LatestEpisodesGrid({ compact = false }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [hasMore, setHasMore] = useState(true);
  const [countKnown, setCountKnown] = useState(false);

  useEffect(() => {
    setLoading(true);
    setResults([]);

    getLatestAnimeList(currentPage, LATEST_PAGE_SIZE).then(data => {
      const items = data.results || [];
      setResults(items);

      if (data.count != null) {
        // Backend gives us an exact total — show real page numbers.
        setCountKnown(true);
        setTotalCount(data.count);
        setTotalPages(Math.ceil(data.count / LATEST_PAGE_SIZE));
      } else {
        // No total from backend — fall back to Prev/Next only.
        // A full page back means there's probably more; a short/empty page means we're at the end.
        // Compare against the page_size the backend actually returned (it may cap/ignore what we asked for).
        setCountKnown(false);
        const effectivePageSize = data.page_size || LATEST_PAGE_SIZE;
        const more = !!data.next || items.length >= effectivePageSize;
        setHasMore(more);
      }
      setLoading(false);
    });
  }, [currentPage]);

  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title">Latest <span>Episodes</span></div>
        {totalCount > 0 && (
          <span style={{ color: 'var(--muted)', fontSize: '.85rem' }}>
            {totalCount} results
          </span>
        )}
      </div>

      <div className={`search-grid${compact ? ' home-latest-grid' : ''}`}>
        {loading
          ? <CardSkeleton count={LATEST_PAGE_SIZE} />
          : results.length === 0
            ? (
              <div className="search-no-results">
                <div className="empty-icon">📺</div>
                <div className="empty-text">No episodes found</div>
              </div>
            )
            : results.map(a => (
              <AnimeCard key={a.id} anime={a} className="card grid-card" />
            ))
        }
      </div>

      {!loading && countKnown && totalPages > 1 && (
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

      {!loading && !countKnown && (currentPage > 1 || hasMore) && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage <= 1}
          >
            ← Previous
          </button>

          <span className="pagination-page-btn active">{currentPage}</span>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={!hasMore}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
