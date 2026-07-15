import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimeCard, CardSkeleton } from './AnimeCard';

export function AnimeRow({ title, fetchPage, pageSize = 10, categoryKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const rowRef = useRef(null);
  const loadingRef = useRef(false);
  const pageRef = useRef(1);
  const navigate = useNavigate();

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    const currentPage = pageRef.current;
    const data = await fetchPage(currentPage, pageSize);
    const results = data.results || [];
    if (!results.length || !data.next) setHasMore(false);
    setItems(prev => currentPage === 1 ? results : [...prev, ...results]);
    pageRef.current = currentPage + 1;
    loadingRef.current = false;
    setLoading(false);
  }, [fetchPage, pageSize, hasMore]);

  useEffect(() => {
    loadNextPage();
  }, []);

  const scrollLeft = () => {
    if (rowRef.current) rowRef.current.scrollBy({ left: -600, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (rowRef.current) rowRef.current.scrollBy({ left: 600, behavior: 'smooth' });
    checkAndLoadMore();
  };

  const checkAndLoadMore = () => {
    const row = rowRef.current;
    if (!row) return;
    const nearEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 400;
    if (nearEnd && hasMore && !loadingRef.current) {
      loadNextPage();
    }
  };

  const handleShowMore = () => {
    if (categoryKey) navigate(`/list/${categoryKey}`);
  };

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title" dangerouslySetInnerHTML={{ __html: title }} />
        {/* {categoryKey && (
          <button className="show-more-btn" onClick={handleShowMore}>
            Show More <span className="show-more-arrow">›</span>
          </button>
        )} */}
      </div>
      <div className="row-wrap">
        <button className="row-btn left" onClick={scrollLeft}>‹</button>
        <div className="row" ref={rowRef} onScroll={checkAndLoadMore}>
          {items.length === 0 && loading
            ? <CardSkeleton count={8} />
            : items.map(anime => <AnimeCard key={anime.id} anime={anime} />)
          }
          {items.length > 0 && loading && <CardSkeleton count={4} />}
        </div>
        <button className="row-btn right" onClick={scrollRight}>›</button>
      </div>
    </div>
  );
}
