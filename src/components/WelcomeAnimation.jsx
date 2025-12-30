import React, { useState, useEffect, useRef } from 'react';
import './WelcomeAnimation.css';

const WelcomeAnimation = ({ onComplete }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const pauseTimeRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  const ANIMATION_DURATION = 8000; // 8 secondes
  const SHOW_SKIP_DELAY = 2000; // Montrer "Passer" après 2s

  useEffect(() => {
    // Afficher le bouton "Passer" après 2 secondes
    const skipTimer = setTimeout(() => {
      setShowSkipButton(true);
    }, SHOW_SKIP_DELAY);

    // Jouer le son de bienvenue si non muté
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log('Audio autoplay bloqué:', err);
      });
    }

    // Terminer automatiquement après la durée
    const autoCompleteTimer = setTimeout(() => {
      if (!isPaused) {
        onComplete();
      }
    }, ANIMATION_DURATION);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(autoCompleteTimer);
    };
  }, []);

  const handlePause = () => {
    setIsPaused(!isPaused);
    const animationElements = document.querySelectorAll('.animate');
    animationElements.forEach(el => {
      if (!isPaused) {
        el.style.animationPlayState = 'paused';
        pauseTimeRef.current = Date.now();
      } else {
        el.style.animationPlayState = 'running';
        // Ajuster le temps pour tenir compte de la pause
        const pauseDuration = Date.now() - pauseTimeRef.current;
        startTimeRef.current += pauseDuration;
      }
    });

    // Pause/Play audio
    if (audioRef.current) {
      if (!isPaused) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log('Erreur lecture audio:', err));
      }
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      if (!isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log('Erreur lecture audio:', err));
      }
    }
  };

  // Rôles à afficher
  const roles = [
    { icon: '👨‍💼', name: 'Directeur', color: '#3b82f6' },
    { icon: '👨‍🏫', name: 'Enseignant', color: '#10b981' },
    { icon: '💼', name: 'Secrétaire', color: '#f59e0b' },
    { icon: '👨‍👩‍👧', name: 'Parent', color: '#ec4899' },
    { icon: '🎓', name: 'Élève', color: '#8b5cf6' },
    { icon: '🏢', name: 'Autres', color: '#6366f1' }
  ];

  return (
    <div className="welcome-animation-container">
      {/* Audio subtil (son de bienvenue doux) */}
      <audio ref={audioRef} muted={isMuted}>
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGO1fPTgjMGHm7A7+OZSA0PVqzn8LJnHARGmN/yuW0eCiqE0fLaizsIEF+46+iZUhELTqXh8bVpHQU7k9jyx3wqBSZ5y/DajzkHEGS96OSXTR8NUKjk8K1jHAU9ldry0H8qBCN1yPDdlUEKElyw5+ynVxQKRp7f8sFuIQc5j9XyzH8pBSh6yvDejzoIF2W+6+OWTBgMT6fk8LFmHQVBldny0n0qBSNzzPDdkTsIEF+z6OSpVxYLS6Lh8L5uHwc4jtXyzH4qBSl5yvDejzsJGGS+6+OXTBcNTqbk8LFkGwU9ldny0nwqBSNzzPDdkDoIEGKy5+mrWBcKS6Hg8L1vHgc3jtTy0H4qBSh5y/DejzoJGGO+6+OXTRgNT6bk8LJkGwQ8ldryz30qBSNzzPDdkzsJEGKx5+mrWBcKTKHg8L5vHgY3jtTy0H4pBCh5y/DejjoKGGO+6uOXThgOUKbj8LNkGgU9lNry0X4pBSR0y/HekzsJD2Ox5+mrWBgJTKHg8L5wHgY2jtTy0X4pBSh6y/HejjoKF2O+6uOXThgOUKbj8LNkGgU9lNry0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHgY2jtTy0n4pBSh6y/HejjoKF2O+6uOYThgOUKbj8LNjGgU9lNny0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHgY2jtTy0n4pBSh6y/HejjoKF2O+6uOYThgOUKbj8LNjGgU9lNny0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHgY2jtTy0n4pBSh6y/HejjoKF2O+6uOYThgOUKbj8LNjGgU9lNny0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHgY2jtTy0n4pBSh6y/HejjoKF2O+6uOYThgOUKbj8LNjGgU9lNny0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHgY2jtTy0n4pBSh6y/HejjoKF2O+6uOYThgOUKbj8LNjGgU9lNny0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHgY2jtTy0n4pBSh6y/HejjoKF2O+6uOYThgOUKbj8LNjGgU9lNny0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHgY2jtTy0n4pBSh6y/HejjoKF2O+6uOYThgOUKbj8LNjGgU9lNny0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHgY2jtTy0n4pBSh6y/HejjoKF2O+6uOYThgOUKbj8LNjGgU9lNny0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHgY2jtTy0n4pBSh6y/HejjoKF2O+6uOYThgOUKbj8LNjGgU9lNny0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHgY2jtTy0n4pBSh6y/HejjoKF2O+6uOYThgOUKbj8LNjGgU9lNny0n4pBSR0y/HfkzsJD2Ox5+mrWRcJTKDg8L5wHg==" type="audio/wav" />
      </audio>

      {/* Particules flottantes en arrière-plan */}
      <div className="particles-background">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle animate"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="welcome-content">
        {/* Logo EduTrack CM */}
        <div className="logo-container animate">
          <div className="logo-circle">
            <span className="logo-icon">🎓</span>
          </div>
          <h1 className="logo-text">EduTrack CM</h1>
          <p className="logo-tagline animate">Gestion Scolaire Intelligente</p>
        </div>

        {/* Les 6 rôles */}
        <div className="roles-container animate">
          {roles.map((role, index) => (
            <div
              key={index}
              className="role-card animate"
              style={{
                animationDelay: `${2 + index * 0.2}s`,
                '--role-color': role.color
              }}
            >
              <span className="role-icon">{role.icon}</span>
              <span className="role-name">{role.name}</span>
            </div>
          ))}
        </div>

        {/* Message de bienvenue */}
        <p className="welcome-message animate">
          Bienvenue sur la plateforme de gestion éducative du Cameroun
        </p>
      </div>

      {/* Contrôles */}
      <div className="animation-controls">
        {/* Bouton Son */}
        <button
          onClick={toggleMute}
          className="control-button sound-button"
          title={isMuted ? 'Activer le son' : 'Désactiver le son'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* Bouton Pause/Play */}
        <button
          onClick={handlePause}
          className="control-button pause-button"
          title={isPaused ? 'Reprendre' : 'Pause'}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>

        {/* Bouton Passer (apparaît après 2s) */}
        {showSkipButton && (
          <button
            onClick={handleSkip}
            className="control-button skip-button animate-skip"
          >
            Passer ⏭️
          </button>
        )}
      </div>

      {/* Barre de progression */}
      <div className="progress-bar-container">
        <div className={`progress-bar ${isPaused ? 'paused' : ''} animate`} />
      </div>
    </div>
  );
};

export default WelcomeAnimation;
