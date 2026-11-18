import React from 'react';

interface PlayerAvatarProps {
  username?: string;
  className: string;
}

/** Local initials avoid sending offline profile names to an avatar service. */
export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ username, className }) => {
  const initial = username?.trim().charAt(0).toLocaleUpperCase() || '?';
  return (
    <span aria-label={`${username || 'Guest player'} avatar`} className={`inline-flex items-center justify-center ${className}`}>
      {initial}
    </span>
  );
};
