// Preset profile pictures users can choose from (at registration and in Edit Profile).
//
// To add more avatars later: drop a new image in /public/avatars/ and add one
// line below — nothing else in the app needs to change.
export const AVATAR_OPTIONS = [
  { id: 'avatar1', src: '/avatars/avatar1.svg' },
  { id: 'avatar2', src: '/avatars/avatar2.svg' },
  { id: 'avatar3', src: '/avatars/avatar3.svg' },
  { id: 'avatar4', src: '/avatars/avatar4.svg' },
  { id: 'avatar5', src: '/avatars/avatar5.svg' },
  // { id: 'avatar6', src: '/avatars/avatar6.svg' },
];

export const DEFAULT_AVATAR_ID = AVATAR_OPTIONS[0].id;

export function getAvatarSrc(avatarId) {
  const found = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return found ? found.src : AVATAR_OPTIONS[0].src;
}
