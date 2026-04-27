import { useEffect, useRef, useState, lazy, Suspense } from 'react';

// Lazy load components
export const LazyPhasePasscode = lazy(() => import('../components/PhasePasscode.jsx'));
export const LazyPhaseQuestion = lazy(() => import('../components/PhaseQuestion.jsx'));
export const LazyPhaseCake = lazy(() => import('../components/PhaseCake.jsx'));
export const LazyPhaseCelebration = lazy(() => import('../components/PhaseCelebration.jsx'));
export const LazyPhaseWishCard = lazy(() => import('../components/PhaseWishCard.jsx'));
export const LazyPhaseQuiz = lazy(() => import('../components/PhaseQuiz.jsx'));
export const LazyPhaseLetter = lazy(() => import('../components/PhaseLetter.jsx'));
export const LazyPhaseFinal = lazy(() => import('../components/PhaseFinal.jsx'));

export function LazyWrapper({ children, fallback = null }) {
  return (
    <Suspense fallback={fallback || <div className="loading-spinner">Loading...</div>}>
      {children}
    </Suspense>
  );
}

export function useIntersectionObserver(callback, options = {}) {
  const targetRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
          callback?.(entry);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [callback, options]);

  return { targetRef, isIntersecting };
}

export function OptimizedImage({ src, alt, className = '', ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
    img.src = src;
  }, [src]);

  return (
    <div className={`optimized-image ${className}`}>
      {!isLoaded && !hasError && (
        <div className="image-placeholder">
          <div className="loading-spinner" />
        </div>
      )}
      {hasError ? (
        <div className="image-error">Failed to load image</div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`optimized-image__img ${isLoaded ? 'loaded' : ''}`}
          {...props}
        />
      )}
    </div>
  );
}

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle(callback, delay) {
  const lastRan = useRef(Date.now());

  return (...args) => {
    if (Date.now() - lastRan.current >= delay) {
      callback(...args);
      lastRan.current = Date.now();
    }
  };
}

export function useMemoizedCallback(callback, deps) {
  const memoizedCallback = useRef(callback);

  useEffect(() => {
    memoizedCallback.current = callback;
  }, deps);

  return useCallback((...args) => {
    return memoizedCallback.current(...args);
  }, []);
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0
  });

  useEffect(() => {
    // FPS monitoring
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round((frameCount * 1000) / (currentTime - lastTime))
        }));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    // Memory monitoring (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        setMetrics(prev => ({
          ...prev,
          memory: Math.round(performance.memory.usedJSHeapSize / 1048576) // MB
        }));
      }
    };

    // Load time
    if ('timing' in performance) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(loadTime)
      }));
    }

    measureFPS();
    const memoryInterval = setInterval(measureMemory, 5000);

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
}

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <div className="offline-indicator__content">
        <span className="offline-indicator__icon">📶</span>
        <span className="offline-indicator__text">You're offline</span>
      </div>
    </div>
  );
}