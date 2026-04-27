import { useEffect, useState, useRef } from 'react';

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete
}) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (delay > 0) {
      const delayTimeout = setTimeout(() => {
        startTyping();
      }, delay);
      return () => clearTimeout(delayTimeout);
    } else {
      startTyping();
    }

    function startTyping() {
      if (currentIndex < text.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(prev => prev + text[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, speed);
      } else {
        onComplete?.();
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, delay, currentIndex, onComplete]);

  return (
    <span className={`typewriter-text ${className}`}>
      {displayText}
      <span className="typewriter-cursor">|</span>
    </span>
  );
}

export function GradientText({ children, className = '', gradient = 'pink-gold' }) {
  const gradientClasses = {
    'pink-gold': 'gradient-pink-gold',
    'rose-purple': 'gradient-rose-purple',
    'lavender-pink': 'gradient-lavender-pink',
    'sunset': 'gradient-sunset'
  };

  return (
    <span className={`gradient-text ${gradientClasses[gradient]} ${className}`}>
      {children}
    </span>
  );
}

export function MorphingText({ texts, interval = 3000, className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % texts.length);
        setIsAnimating(false);
      }, 300);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <span className={`morphing-text ${isAnimating ? 'morphing' : ''} ${className}`}>
      {texts[currentIndex]}
    </span>
  );
}

export function FloatingLetters({ text, className = '' }) {
  return (
    <div className={`floating-letters ${className}`}>
      {text.split('').map((letter, index) => (
        <span
          key={index}
          className="floating-letter"
          style={{
            ['--delay']: `${index * 0.1}s`,
            ['--float-distance']: `${Math.sin(index) * 10}px`
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </div>
  );
}

export function LiquidText({ children, className = '' }) {
  return (
    <span className={`liquid-text ${className}`}>
      {children}
    </span>
  );
}