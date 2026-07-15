import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID } from '../constants/avatars';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'login';
  const [mode, setMode] = useState(initialMode);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassword2, setRegPassword2] = useState('');
  const [regAvatar, setRegAvatar] = useState(DEFAULT_AVATAR_ID);
  const [regError, setRegError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { setLoginError('Please fill all fields'); return; }
    const data = await loginUser(loginEmail, loginPassword);
    if (data.error || !data.token) {
      setLoginError(data.error || 'Login failed');
      return;
    }
    login(data.user, data.token);
    toast(`Welcome back, ${data.user.username || data.user.email}! 👋`, 'success');
    navigate('/');
  };

  const handleRegister = async () => {
    if (!regUsername || !regEmail || !regPassword) { setRegError('Please fill all fields'); return; }
    if (regPassword !== regPassword2) { setRegError('Passwords do not match'); return; }
    const data = await registerUser(regUsername, regEmail, regPassword, regPassword2, regAvatar);
    if (data.error || !data.token) {
      const errMsg = data.error || (data.email ? data.email[0] : 'Registration failed');
      setRegError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
      return;
    }
    // Fall back to the chosen avatar client-side in case the backend doesn't
    // echo it back yet (see the note on updateProfile in services/api.js).
    login({ ...data.user, avatar: data.user.avatar || regAvatar }, data.token);
    toast(`Welcome to AniFlix, ${data.user.username}! 🎉`, 'success');
    navigate('/');
  };

  const switchMode = (m) => {
    setMode(m);
    setLoginError('');
    setRegError('');
  };

  return (
    <div className="auth-page" style={{ paddingTop: 0 }}>
      <div className="auth-left">
        <img
          src="https://cdn.myanimelist.net/images/anime/1015/138006l.jpg"
          alt="anime"
          onError={e => { e.target.src = 'https://via.placeholder.com/800x1000/0b0b0f/dd2476?text=AniFlix'; }}
        />
        <div className="auth-left-grad" />
        <div className="auth-left-content">
          <div className="auth-tagline">Your anime world<br /><span>starts here.</span></div>
          <div style={{ color: 'var(--muted)', fontSize: '.9rem', marginTop: '.5rem' }}>Thousands of anime. Zero limits.</div>
        </div>
      </div>

      <div className="auth-right">
        <Link to="/" className="auth-logo">AniFlix</Link>

        {mode === 'login' ? (
          <div>
            <div className="auth-title">Welcome back</div>
            <div className="auth-sub">Login to access your watch history and list</div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input" type="email" placeholder="you@example.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input" type="password" placeholder="••••••••"
                value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              {loginError && <div className="form-error">{loginError}</div>}
            </div>
            <button className="btn-submit" onClick={handleLogin}>Login</button>
            <div className="auth-switch">
              Don't have an account? <span onClick={() => switchMode('register')}>Register</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="auth-title">Create account</div>
            <div className="auth-sub">Join AniFlix and track your anime journey</div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input" type="text" placeholder="coolotaku"
                value={regUsername} onChange={e => setRegUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input" type="email" placeholder="you@example.com"
                value={regEmail} onChange={e => setRegEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input" type="password" placeholder="••••••••"
                value={regPassword} onChange={e => setRegPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input" type="password" placeholder="••••••••"
                value={regPassword2} onChange={e => setRegPassword2(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Choose your avatar</label>
              <div className="avatar-picker-grid">
                {AVATAR_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`avatar-picker-item${regAvatar === opt.id ? ' selected' : ''}`}
                    onClick={() => setRegAvatar(opt.id)}
                  >
                    <img src={opt.src} alt={opt.id} />
                  </button>
                ))}
              </div>
              {regError && <div className="form-error">{regError}</div>}
            </div>
            <button className="btn-submit" onClick={handleRegister}>Create Account</button>
            <div className="auth-switch">
              Already have an account? <span onClick={() => switchMode('login')}>Login</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
