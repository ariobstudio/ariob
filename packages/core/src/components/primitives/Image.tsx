import React from 'react';

/**
 * Image: primitive for rendering images, wraps `image`.
 */
export interface ImageProps extends React.ComponentProps<'image'> {
  src: string;
  alt?: string;
  className?: string;
  [key: string]: any;
}

export const Image: React.FC<ImageProps> = ({ src, alt = '', className = '', style, ...rest }) => {
  return <image src={src} alt={alt} className={className} style={style} {...rest} />;
};
