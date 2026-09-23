import React, { useState } from 'react'

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

/** Native lazy image with a paper-toned shimmer placeholder + fade-in. */
export default function LazyImage({ src, alt, className = '', ...rest }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  return (
    <span className={`relative block overflow-hidden bg-sand ${className}`}>
      {!loaded && (
        <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-sand via-cream to-sand" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={(e) => {
          setLoaded(true)
          ;(e.target as HTMLImageElement).classList.add('is-loaded')
        }}
        className={`lazy-fade h-full w-full object-cover ${loaded ? 'is-loaded' : ''}`}
        {...rest}
      />
    </span>
  )
}
