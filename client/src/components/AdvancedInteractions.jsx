import { useCallback, useEffect, useRef, useState } from 'react';

export function TiltCard({ children, className = '', maxTilt = 15, perspective = 1000 }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    setTilt({
      x: y * maxTilt,
      y: -x * maxTilt
    });
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(${perspective}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.5s ease' : 'none'
      }}
    >
      {children}
    </div>
  );
}

export function MagneticElement({ children, strength = 0.3, className = '' }) {
  const elementRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < 100) { // Magnetic range
      setPosition({
        x: deltaX * strength,
        y: deltaY * strength
      });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  }, [strength]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!isHovered) return;

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered, handleMouseMove]);

  return (
    <div
      ref={elementRef}
      className={`magnetic-element ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isHovered ? 'none' : 'transform 0.3s ease'
      }}
    >
      {children}
    </div>
  );
}

export function DraggableHearts({ count = 8, onDragStart, onDragEnd }) {
  const [draggedHeart, setDraggedHeart] = useState(null);
  const [heartPositions, setHeartPositions] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      rotation: Math.random() * 360
    }))
  );

  const handleDragStart = useCallback((heartId, e) => {
    setDraggedHeart(heartId);
    onDragStart?.(heartId);
    e.dataTransfer.effectAllowed = 'move';
  }, [onDragStart]);

  const handleDragEnd = useCallback((heartId) => {
    setDraggedHeart(null);
    onDragEnd?.(heartId);
  }, [onDragEnd]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (draggedHeart === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHeartPositions(prev =>
      prev.map(heart =>
        heart.id === draggedHeart
          ? { ...heart, x, y }
          : heart
      )
    );
  }, [draggedHeart]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="draggable-hearts-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {heartPositions.map((heart) => (
        <div
          key={heart.id}
          className={`draggable-heart ${draggedHeart === heart.id ? 'dragging' : ''}`}
          draggable
          onDragStart={(e) => handleDragStart(heart.id, e)}
          onDragEnd={() => handleDragEnd(heart.id)}
          style={{
            left: heart.x,
            top: heart.y,
            transform: `rotate(${heart.rotation}deg)`,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  );
}