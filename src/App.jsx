import React, { useState, useEffect } from "react";
import Routes from "./Routes";
import { AuthProvider } from './contexts/AuthContext';
import SessionDebugger from './components/SessionDebugger';
import WelcomeAnimation from './components/WelcomeAnimation';

function App() {
  const [showAnimation, setShowAnimation] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Vérifier si c'est le premier chargement de la session
    // L'animation s'affiche à chaque ouverture du site (choix 6-B)
    const hasSeenAnimation = sessionStorage.getItem('welcomeAnimationShown');

    if (hasSeenAnimation) {
      setShowAnimation(false);
      setIsFirstLoad(false);
    }
  }, []);

  const handleAnimationComplete = () => {
    // Marquer l'animation comme vue pour cette session
    sessionStorage.setItem('welcomeAnimationShown', 'true');
    setShowAnimation(false);
  };

  return (
    <AuthProvider>
      {showAnimation && isFirstLoad && (
        <WelcomeAnimation onComplete={handleAnimationComplete} />
      )}
      <Routes />
      {/* Session Debugger - visible uniquement en développement */}
      {import.meta.env.DEV && <SessionDebugger />}
    </AuthProvider>
  );
}

export default App;