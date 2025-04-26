import React from 'react';
import { Image, Box } from '../primitives';

export interface AvatarProps {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt = '', size = 40, className = '' }) => {
  return (
    <Box className={`rounded-full overflow-hidden bg-gray-200 ${className}`} style={{ width: size, height: size }}>
      <Image src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </Box>
  );
};
