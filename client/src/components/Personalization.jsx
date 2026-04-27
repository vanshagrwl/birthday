import { useState, useEffect } from 'react';

const THEME_VARIANTS = {
  classic: {
    name: 'Classic Pink',
    colors: {
      primary: '#ff7eb3',
      secondary: '#ff5c8a',
      accent: '#e93d7a',
      background: 'radial-gradient(1200px 800px at 20% 10%, #ffd6ea 0%, transparent 55%), radial-gradient(900px 700px at 90% 20%, #ffc2f1 0%, transparent 50%), linear-gradient(165deg, #3b0a2a 0%, #6b1248 35%, #ff6aa8 100%)'
    }
  },
  'rose-gold': {
    name: 'Rose Gold',
    colors: {
      primary: '#e91e63',
      secondary: '#f8bbd9',
      accent: '#ffb3ba',
      background: 'radial-gradient(1200px 800px at 20% 10%, #ffe6e6 0%, transparent 55%), radial-gradient(900px 700px at 90% 20%, #fff5f5 0%, transparent 50%), linear-gradient(165deg, #2d1b1b 0%, #5d2a2a 35%, #e91e63 100%)'
    }
  },
  lavender: {
    name: 'Lavender Dream',
    colors: {
      primary: '#9c27b0',
      secondary: '#ba68c8',
      accent: '#e1bee7',
      background: 'radial-gradient(1200px 800px at 20% 10%, #f3e5f5 0%, transparent 55%), radial-gradient(900px 700px at 90% 20%, #ede7f6 0%, transparent 50%), linear-gradient(165deg, #1a1a2e 0%, #3a2a5e 35%, #9c27b0 100%)'
    }
  },
  sunset: {
    name: 'Sunset Bliss',
    colors: {
      primary: '#ff9800',
      secondary: '#ffb74d',
      accent: '#ffe082',
      background: 'radial-gradient(1200px 800px at 20% 10%, #fff3e0 0%, transparent 55%), radial-gradient(900px 700px at 90% 20%, #fce4ec 0%, transparent 50%), linear-gradient(165deg, #1a237e 0%, #3949ab 35%, #ff9800 100%)'
    }
  }
};

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState('classic');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('birthday-theme');
    if (savedTheme && THEME_VARIANTS[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const changeTheme = (themeName) => {
    if (THEME_VARIANTS[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('birthday-theme', themeName);

      // Update CSS custom properties
      const root = document.documentElement;
      const theme = THEME_VARIANTS[themeName];
      root.style.setProperty('--pink-1', theme.colors.primary);
      root.style.setProperty('--pink-2', theme.colors.secondary);
      root.style.setProperty('--pink-3', theme.colors.accent);
    }
  };

  return {
    currentTheme,
    theme: THEME_VARIANTS[currentTheme],
    themes: THEME_VARIANTS,
    changeTheme
  };
}

export function ThemeSelector({ className = '' }) {
  const { currentTheme, themes, changeTheme } = useTheme();

  return (
    <div className={`theme-selector ${className}`}>
      <h3 className="theme-selector__title">Choose Your Theme</h3>
      <div className="theme-selector__grid">
        {Object.entries(themes).map(([key, theme]) => (
          <button
            key={key}
            className={`theme-option ${currentTheme === key ? 'active' : ''}`}
            onClick={() => changeTheme(key)}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
            }}
          >
            <span className="theme-option__name">{theme.name}</span>
            <div className="theme-option__preview">
              <div
                className="theme-option__color"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div
                className="theme-option__color"
                style={{ backgroundColor: theme.colors.secondary }}
              />
              <div
                className="theme-option__color"
                style={{ backgroundColor: theme.colors.accent }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CustomMessage({ onSave, placeholder = "Write your personal message..." }) {
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedMessage = localStorage.getItem('birthday-message');
    if (savedMessage) {
      setMessage(savedMessage);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('birthday-message', message);
    onSave?.(message);
    setIsEditing(false);
  };

  return (
    <div className="custom-message">
      {isEditing ? (
        <div className="custom-message__editor">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="custom-message__textarea"
            maxLength={500}
          />
          <div className="custom-message__actions">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="custom-message__display">
          <p className="custom-message__text">
            {message || "Click to add a personal message"}
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="custom-message__edit-btn"
          >
            ✏️ Edit
          </button>
        </div>
      )}
    </div>
  );
}

export function NameCustomizer({ onNameChange, defaultName = "Best Friend" }) {
  const [name, setName] = useState(defaultName);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('friend-name');
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('friend-name', name);
    onNameChange?.(name);
    setIsEditing(false);
  };

  return (
    <div className="name-customizer">
      {isEditing ? (
        <div className="name-customizer__editor">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
            className="name-customizer__input"
            maxLength={50}
          />
          <div className="name-customizer__actions">
            <button onClick={handleSave} className="btn-primary">Save</button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="name-customizer__display">
          <span className="name-customizer__text">Dear {name},</span>
          <button
            onClick={() => setIsEditing(true)}
            className="name-customizer__edit-btn"
          >
            ✏️
          </button>
        </div>
      )}
    </div>
  );
}

export function FriendshipMeter({ value = 75, onChange }) {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (newValue) => {
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="friendship-meter">
      <h3 className="friendship-meter__title">Our Friendship Level</h3>
      <div className="friendship-meter__container">
        <div
          className="friendship-meter__fill"
          style={{ width: `${currentValue}%` }}
        />
        <div className="friendship-meter__heart">💕</div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={currentValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="friendship-meter__slider"
      />
      <div className="friendship-meter__labels">
        <span>Just Friends</span>
        <span>Best Friends Forever! 💖</span>
      </div>
    </div>
  );
}