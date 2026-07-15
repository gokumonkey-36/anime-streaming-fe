import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile } from '../services/api';
import { AVATAR_OPTIONS, getAvatarSrc, DEFAULT_AVATAR_ID } from '../constants/avatars';

export function ProfileModal({ isOpen, onClose }) {
  const { currentUser, updateUser } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarId, setAvatarId] = useState(DEFAULT_AVATAR_ID);
  const [saving, setSaving] = useState(false);

  // Reset local fields from the current user every time the modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setAvatarId(currentUser.avatar || DEFAULT_AVATAR_ID);
      setEditing(false);
      setPickingAvatar(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCancel = () => {
    setUsername(currentUser.username || '');
    setEmail(currentUser.email || '');
    setAvatarId(currentUser.avatar || DEFAULT_AVATAR_ID);
    setEditing(false);
    setPickingAvatar(false);
  };

  const handleSave = async () => {
    if (!username.trim() || !email.trim()) {
      toast('Username and email cannot be empty', 'error');
      return;
    }
    setSaving(true);
    const data = await updateProfile({ username: username.trim(), email: email.trim(), avatar: avatarId });
    setSaving(false);
    if (data && data.error) {
      toast(typeof data.error === 'string' ? data.error : 'Could not update profile', 'error');
      return;
    }
    updateUser({ username: username.trim(), email: email.trim(), avatar: avatarId });
    toast('Profile updated', 'success');
    setEditing(false);
    setPickingAvatar(false);
  };

  return (
    <div className="profile-modal-backdrop" onClick={handleBackdropClick}>
      <div className="profile-modal-card">
        <button className="profile-modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="profile-modal-avatar-wrap">
          <img className="profile-modal-avatar" src={getAvatarSrc(avatarId)} alt="Profile" />
          {editing && (
            <button
              className="profile-modal-avatar-edit-badge"
              onClick={() => setPickingAvatar(v => !v)}
              title="Change profile picture"
            >
              ✎
            </button>
          )}
        </div>

        {editing && pickingAvatar && (
          <div className="avatar-picker-grid">
            {AVATAR_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`avatar-picker-item${avatarId === opt.id ? ' selected' : ''}`}
                onClick={() => setAvatarId(opt.id)}
                type="button"
              >
                <img src={opt.src} alt={opt.id} />
              </button>
            ))}
          </div>
        )}

        <div className="profile-field">
          <span className="profile-field-label">Username</span>
          {editing ? (
            <input
              className="form-input profile-field-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          ) : (
            <span className="profile-field-value">{currentUser.username || '—'}</span>
          )}
        </div>

        <div className="profile-field">
          <span className="profile-field-label">Email</span>
          {editing ? (
            <input
              className="form-input profile-field-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          ) : (
            <span className="profile-field-value">{currentUser.email || '—'}</span>
          )}
        </div>

        <div className="profile-modal-actions">
          {editing ? (
            <>
              <button className="btn-profile-secondary" onClick={handleCancel} disabled={saving}>Cancel</button>
              <button className="btn-profile-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button className="btn-profile-primary" onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>
      </div>
    </div>
  );
}
