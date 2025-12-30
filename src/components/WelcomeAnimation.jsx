import React, { useEffect, useRef } from 'react';
import './WelcomeAnimation.css';

const WelcomeAnimation = ({ onComplete }) => {
  const audioRef = useRef(null);

  // Durée totale de l'animation: 5 secondes
  const ANIMATION_DURATION = 5000;

  useEffect(() => {
    // Tenter de jouer le son (peut être bloqué par le navigateur)
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignorer si le navigateur bloque l'autoplay
      });
    }

    // Timer pour terminer automatiquement l'animation
    const timer = setTimeout(() => {
      onComplete();
    }, ANIMATION_DURATION);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [onComplete]);

  // Les 6 rôles de la plateforme
  const roles = [
    { icon: '👨‍💼', name: 'Directeur', color: '#3b82f6', delay: '0.5s' },
    { icon: '👨‍🏫', name: 'Enseignant', color: '#10b981', delay: '0.8s' },
    { icon: '💼', name: 'Secrétaire', color: '#f59e0b', delay: '1.1s' },
    { icon: '👨‍👩‍👧', name: 'Parent', color: '#ec4899', delay: '1.4s' },
    { icon: '🎓', name: 'Élève', color: '#8b5cf6', delay: '1.7s' },
    { icon: '🏢', name: 'Autres', color: '#6366f1', delay: '2s' }
  ];

  return (
    <div className="welcome-animation-container">
      {/* Particules en arrière-plan */}
      <div className="particles-background">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Contenu principal */}
      <div className="welcome-content">
        {/* Logo et titre */}
        <div className="logo-container">
          <div className="logo-circle">
            <span className="logo-icon">🎓</span>
          </div>
          <h1 className="logo-text">EduTrack CM</h1>
          <p className="logo-tagline">Gestion Scolaire Intelligente</p>
        </div>

        {/* Cartes des rôles */}
        <div className="roles-container">
          {roles.map((role, index) => (
            <div
              key={index}
              className="role-card"
              style={{
                '--role-color': role.color,
                animationDelay: role.delay
              }}
            >
              <span className="role-icon">{role.icon}</span>
              <span className="role-name">{role.name}</span>
            </div>
          ))}
        </div>

        {/* Message de bienvenue */}
        <p className="welcome-message">
          Bienvenue sur votre plateforme de gestion éducative
        </p>
      </div>

      {/* Barre de progression */}
      <div className="progress-bar-container">
        <div className="progress-bar"></div>
      </div>

      {/* Son d'ambiance subtil (muet par défaut, peut être activé) */}
      <audio ref={audioRef} muted>
        <source src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=" type="audio/wav" />
      </audio>
    </div>
  );
};

export default WelcomeAnimation;
