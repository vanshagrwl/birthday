import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5 }
  },

  slideUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },

  slideLeft: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },

  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  },

  portal: {
    initial: { scale: 0, rotate: 180, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    exit: { scale: 0, rotate: -180, opacity: 0 },
    transition: { duration: 0.8, ease: "easeInOut" }
  },

  dissolve: {
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(10px)" },
    transition: { duration: 0.7 }
  },

  pageCurl: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
    transition: { duration: 0.8, ease: "easeInOut" }
  }
};

export function PageTransition({ children, variant = 'fade', className = '' }) {
  return (
    <motion.div
      className={className}
      initial={pageTransitions[variant]?.initial}
      animate={pageTransitions[variant]?.animate}
      exit={pageTransitions[variant]?.exit}
      transition={pageTransitions[variant]?.transition}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredList({ children, staggerDelay = 0.1, className = '' }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function MorphingShape({ shapes, interval = 4000, className = '' }) {
  const [currentShape, setCurrentShape] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentShape(prev => (prev + 1) % shapes.length);
    }, interval);

    return () => clearInterval(timer);
  }, [shapes.length, interval]);

  return (
    <motion.div
      className={`morphing-shape ${className}`}
      animate={{
        borderRadius: shapes[currentShape].borderRadius,
        scale: shapes[currentShape].scale || 1,
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      style={{
        width: shapes[currentShape].size,
        height: shapes[currentShape].size,
        background: shapes[currentShape].color,
      }}
    />
  );
}

export function WaveAnimation({ className = '' }) {
  return (
    <div className={`wave-animation ${className}`}>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <motion.path
          d="M0,60 C300,100 600,20 900,60 C1050,80 1200,40 1200,60 L1200,120 L0,120 Z"
          fill="rgba(255, 126, 179, 0.1)"
          animate={{
            d: [
              "M0,60 C300,100 600,20 900,60 C1050,80 1200,40 1200,60 L1200,120 L0,120 Z",
              "M0,40 C300,80 600,0 900,40 C1050,60 1200,20 1200,40 L1200,120 L0,120 Z",
              "M0,60 C300,100 600,20 900,60 C1050,80 1200,40 1200,60 L1200,120 L0,120 Z"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
    </div>
  );
}