import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { searchAnime } from '../services/api';
import { ProfileModal } from './ProfileModal';
import { getAvatarSrc } from '../constants/avatars';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [dropdownItems, setDropdownItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const searchTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.avatar-wrap')) setShowAvatarMenu(false);
      if (!e.target.closest('.search-wrap')) setShowDropdown(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSearchInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(searchTimer.current);
    if (!q.trim()) { setShowDropdown(false); setDropdownItems([]); return; }
    searchTimer.current = setTimeout(async () => {
      const data = await searchAnime(q.trim(), 1, 5);
      const items = data.results || [];
      setDropdownItems(items);
      setShowDropdown(true);
    }, 350);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleDropdownClick = (id) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/anime/${id}`);
  };

  const handleLogout = async () => {
    await logout();
    toast('Logged out successfully', 'success');
    navigate('/');
  };

  const initials = currentUser
    ? (currentUser.username || currentUser.email || '?')[0].toUpperCase()
    : '?';

  return (
    <>
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <Link to="/" className="nav-logo">AniFlix</Link>

      <div className="nav-links">
        {/* <Link to="/" className={`nav-link${location.pathname === '/' ? ' active' : ''}`}>Home</Link> */}
        {/* <Link to="/" className="nav-link">Popular</Link>
        <Link to="/" className="nav-link">Genres</Link> */}
        {currentUser && (
          <Link to="/mylist" className={`nav-link${location.pathname === '/mylist' ? ' active' : ''}`}>My List</Link>
        )}
      </div>

      <div className="search-wrap">
        <span className="search-icon">⌕</span>
        <input
          className="search-input"
          placeholder="Search anime..."
          autoComplete="off"
          value={query}
          onChange={handleSearchInput}
          onKeyDown={handleSearchKeyDown}
        />
        {showDropdown && (
          <div className="search-dropdown">
            {dropdownItems.length === 0
              ? <div style={{ padding: '.75rem 1rem', color: 'var(--muted)', fontSize: '.85rem' }}>No results found</div>
              : dropdownItems.map(a => (
                <div key={a.id} className="search-item" onClick={() => handleDropdownClick(a.id)}>
                  <img
                    src={a.image || ''}
                    alt={a.name}
                    onError={e => { e.target.style.background = '#333'; }}
                  />
                  <div className="search-item-info">
                    <div className="search-item-title">{a.name || 'Unknown'}</div>
                    <div className="search-item-meta">{a.type || ''} · ★ {a.rating || '?'}</div>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      <div className="nav-right">
        {!currentUser ? (
          <>
            <button className="btn-login" onClick={() => navigate('/auth?mode=login')}>Login</button>
            <button className="btn-register" onClick={() => navigate('/auth?mode=register')}>Register</button>
          </>
        ) : (
          <div className="avatar-wrap" onClick={() => setShowAvatarMenu(s => !s)}>
            <div className="avatar">
              {currentUser.avatar
                ? <img src={getAvatarSrc(currentUser.avatar)} alt="Profile" />
                : initials}
            </div>
            {showAvatarMenu && (
              <div className="avatar-menu">
                <button
                  className="avatar-menu-item"
                  onClick={() => { setShowAvatarMenu(false); setShowProfileModal(true); }}
                >
                  👤 My Profile
                </button>
                <button className="avatar-menu-item" onClick={() => navigate('/mylist')}>♡ My List</button>
                <button className="avatar-menu-item danger" onClick={handleLogout}>⇥ Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
    <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
}
