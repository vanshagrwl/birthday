import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FRIENDSHIP_MOMENTS = [
  {
    year: "2020",
    title: "How We Met",
    description: "That random conversation that started it all",
    emoji: "👋",
    color: "#ff7eb3"
  },
  {
    year: "2021",
    title: "First Adventure",
    description: "That trip that made us inseparable",
    emoji: "🏔️",
    color: "#ff5c8a"
  },
  {
    year: "2022",
    title: "Late Night Talks",
    description: "Countless hours of sharing dreams and fears",
    emoji: "🌙",
    color: "#e93d7a"
  },
  {
    year: "2023",
    title: "Through Thick and Thin",
    description: "Supporting each other through life's challenges",
    emoji: "🤝",
    color: "#d81b60"
  },
  {
    year: "2024",
    title: "Today",
    description: "The best friendship story continues...",
    emoji: "✨",
    color: "#ff7eb3"
  }
];

export function FriendshipTimeline({ className = '' }) {
  const [activeMoment, setActiveMoment] = useState(0);

  return (
    <div className={`friendship-timeline ${className}`}>
      <h2 className="friendship-timeline__title">Our Friendship Journey</h2>

      <div className="friendship-timeline__container">
        {FRIENDSHIP_MOMENTS.map((moment, index) => (
          <motion.div
            key={index}
            className={`timeline-moment ${activeMoment === index ? 'active' : ''}`}
            onClick={() => setActiveMoment(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ '--accent-color': moment.color }}
          >
            <div className="timeline-moment__year">{moment.year}</div>
            <div className="timeline-moment__emoji">{moment.emoji}</div>
            <div className="timeline-moment__content">
              <h3 className="timeline-moment__title">{moment.title}</h3>
              <p className="timeline-moment__description">{moment.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="timeline-progress">
        <div
          className="timeline-progress__fill"
          style={{
            width: `${((activeMoment + 1) / FRIENDSHIP_MOMENTS.length) * 100}%`,
            background: `linear-gradient(90deg, ${FRIENDSHIP_MOMENTS[activeMoment]?.color}, #ff7eb3)`
          }}
        />
      </div>
    </div>
  );
}

const VIRTUAL_GIFTS = [
  {
    id: 'friendship-bracelet',
    name: 'Friendship Bracelet',
    emoji: '📿',
    description: 'A symbol of our unbreakable bond',
    color: '#ff7eb3',
    animation: 'pulse'
  },
  {
    id: 'memory-book',
    name: 'Memory Book',
    emoji: '📖',
    description: 'Filled with all our precious moments',
    color: '#ff5c8a',
    animation: 'float'
  },
  {
    id: 'adventure-ticket',
    name: 'Adventure Ticket',
    emoji: '🎫',
    description: 'For our next great adventure together',
    color: '#e93d7a',
    animation: 'bounce'
  },
  {
    id: 'heart-keychain',
    name: 'Heart Keychain',
    emoji: '💝',
    description: 'You hold the key to my heart',
    color: '#d81b60',
    animation: 'swing'
  },
  {
    id: 'star-wand',
    name: 'Magic Star Wand',
    emoji: '⭐',
    description: 'For making wishes and dreams come true',
    color: '#9c27b0',
    animation: 'sparkle'
  },
  {
    id: 'time-capsule',
    name: 'Time Capsule',
    emoji: '⏳',
    description: 'Our friendship, preserved for eternity',
    color: '#3f51b5',
    animation: 'glow'
  }
];

export function VirtualGiftBox({ onGiftSelected }) {
  const [selectedGift, setSelectedGift] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleGiftClick = (gift) => {
    setSelectedGift(gift);
    setIsOpen(true);
    setTimeout(() => {
      onGiftSelected?.(gift);
      setIsOpen(false);
      setSelectedGift(null);
    }, 3000);
  };

  return (
    <div className="virtual-gift-box">
      <h2 className="virtual-gift-box__title">Choose Your Virtual Gift</h2>

      <div className="gift-grid">
        {VIRTUAL_GIFTS.map((gift) => (
          <motion.button
            key={gift.id}
            className={`gift-item ${gift.animation}`}
            onClick={() => handleGiftClick(gift)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{ '--gift-color': gift.color }}
          >
            <div className="gift-item__emoji">{gift.emoji}</div>
            <div className="gift-item__content">
              <h3 className="gift-item__name">{gift.name}</h3>
              <p className="gift-item__description">{gift.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {selectedGift && (
        <motion.div
          className="gift-reveal"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <div className="gift-reveal__content">
            <div className="gift-reveal__emoji">{selectedGift.emoji}</div>
            <h3 className="gift-reveal__title">You received:</h3>
            <h2 className="gift-reveal__name">{selectedGift.name}</h2>
            <p className="gift-reveal__message">{selectedGift.description}</p>
            <div className="gift-reveal__sparkles">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="sparkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function FriendshipPromises({ onPromiseMade }) {
  const [promises, setPromises] = useState([
    { id: 1, text: "Always be there for each other", made: false },
    { id: 2, text: "Share both joys and sorrows", made: false },
    { id: 3, text: "Create more beautiful memories together", made: false },
    { id: 4, text: "Support each other's dreams", made: false },
    { id: 5, text: "Keep our friendship strong forever", made: false }
  ]);

  const togglePromise = (id) => {
    setPromises(prev =>
      prev.map(promise =>
        promise.id === id
          ? { ...promise, made: !promise.made }
          : promise
      )
    );
  };

  useEffect(() => {
    const allMade = promises.every(p => p.made);
    if (allMade) {
      onPromiseMade?.();
    }
  }, [promises, onPromiseMade]);

  return (
    <div className="friendship-promises">
      <h2 className="friendship-promises__title">Our Friendship Promises</h2>

      <div className="promises-list">
        {promises.map((promise) => (
          <motion.div
            key={promise.id}
            className={`promise-item ${promise.made ? 'made' : ''}`}
            onClick={() => togglePromise(promise.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="promise-item__checkbox">
              {promise.made ? '💕' : '🤍'}
            </div>
            <div className="promise-item__text">{promise.text}</div>
          </motion.div>
        ))}
      </div>

      <div className="promises-progress">
        <div className="promises-progress__text">
          {promises.filter(p => p.made).length} of {promises.length} promises made
        </div>
        <div className="promises-progress__bar">
          <div
            className="promises-progress__fill"
            style={{
              width: `${(promises.filter(p => p.made).length / promises.length) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}