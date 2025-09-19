import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  placeholder?: string;
  onLoad?: () => void;
  priority?: boolean;
}

export const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 80,
  placeholder,
  onLoad,
  priority = false
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Optimize image URL for performance
  const optimizedSrc = src.includes('unsplash.com') 
    ? `${src}&w=${width || 800}&q=${quality}&fm=webp&fit=crop`
    : src;

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted animate-shimmer bg-[length:200%_100%]"
          style={{ 
            aspectRatio: width && height ? `${width}/${height}` : 'auto'
          }}
        />
      )}
      
      {/* Actual Image */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
};

export default LazyImage;