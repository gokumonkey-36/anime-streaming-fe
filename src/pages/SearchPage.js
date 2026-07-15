import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAnime } from '../services/api';
import { AnimeCard, CardSkeleton } from '../components/AnimeCard';

const PAGE_SIZE = 36;

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

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const loadPage = useCallback(async (q, page) => {
    if (!q) return;
    setLoading(true);
    setResults([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const data = await searchAnime(q, page, PAGE_SIZE);
    const items = data.results || [];
    setResults(items);

    if (data.count !== undefined && data.count !== null) {
      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / PAGE_SIZE));
    } else {
      const hasNext = !!(data.paging?.next);
      setTotalPages(prev => {
        const estimated = hasNext ? page + 1 : page;
        return Math.max(prev, estimated);
      });
    }

    setLoading(false);
  }, []);

  // Reset totalPages when query changes
  useEffect(() => {
    setTotalPages(1);
    loadPage(query, currentPage);
  }, [query, currentPage]);

  const goToPage = (page) => {
    setSearchParams({ q: query, page: String(page) });
  };

  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="search-page">
      <div className="search-page-header">
        <div className="search-page-title">
          Search: <span className="search-page-query">"{query}"</span>
        </div>
        {totalCount > 0 && (
          <div className="search-page-count">{totalCount} results found</div>
        )}
      </div>

      <div className="search-grid">
        {results.length === 0 && !loading && (
          <div className="search-no-results">
            <div className="empty-icon">🔍</div>
            <div className="empty-text">No results found for "{query}"</div>
          </div>
        )}
        {loading
          ? <CardSkeleton count={PAGE_SIZE} />
          : results.map(anime => (
              <AnimeCard key={anime.id} anime={anime} className="card grid-card" />
            ))
        }
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