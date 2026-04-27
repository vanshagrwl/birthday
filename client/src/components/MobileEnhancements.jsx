import { useCallback, useEffect, useRef, useState } from 'react';

export function useTouchGestures(onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50) {
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchEndRef.current = null;
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const distanceX = touchStartRef.current.x - touchEndRef.current.x;
    const distanceY = touchStartRef.current.y - touchEndRef.current.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
    if (isUpSwipe && onSwipeUp) onSwipeUp();
    if (isDownSwipe && onSwipeDown) onSwipeDown();
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type = 'light') => {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(50);
          break;
        case 'medium':
          navigator.vibrate(100);
          break;
        case 'heavy':
          navigator.vibrate(200);
          break;
        case 'success':
          navigator.vibrate([50, 50, 50]);
          break;
        case 'error':
          navigator.vibrate([100, 50, 100]);
          break;
        default:
          navigator.vibrate(50);
      }
    }
  }, []);

  return { triggerHaptic };
}

export function useAccelerometer(onTilt) {
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let accelerometer = null;

    const initAccelerometer = async () => {
      try {
        if ('Accelerometer' in window) {
          accelerometer = new Accelerometer({ frequency: 60 });
          accelerometer.addEventListener('reading', () => {
            const newAcceleration = {
              x: accelerometer.x || 0,
              y: accelerometer.y || 0,
              z: accelerometer.z || 0
            };
            setAcceleration(newAcceleration);
            onTilt?.(newAcceleration);
          });
          accelerometer.start();
        }
      } catch (error) {
        console.warn('Accelerometer not supported:', error);
      }
    };

    initAccelerometer();

    return () => {
      if (accelerometer) {
        accelerometer.stop();
      }
    };
  }, [onTilt]);

  return acceleration;
}

export function PinchZoom({ children, onZoom, minZoom = 0.5, maxZoom = 3 }) {
  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const initialDistanceRef = useRef(null);

  const getDistance = useCallback((touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      initialDistanceRef.current = getDistance(e.touches);
    }
  }, [getDistance]);

  const handleTouchMove = useCallback((e) => {
    if (!isPinching || e.touches.length !== 2 || !initialDistanceRef.current) return;

    e.preventDefault();
    const currentDistance = getDistance(e.touches);
    const newScale = Math.min(maxZoom, Math.max(minZoom, scale * (currentDistance / initialDistanceRef.current)));

    setScale(newScale);
    onZoom?.(newScale);
  }, [isPinching, scale, minZoom, maxZoom, onZoom, getDistance]);

  const handleTouchEnd = useCallback(() => {
    setIsPinching(false);
    initialDistanceRef.current = null;
  }, []);

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        transition: isPinching ? 'none' : 'transform 0.3s ease'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

export function ProgressiveWebApp() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  }, [deferredPrompt]);

  return {
    isInstallable,
    installApp
  };
}