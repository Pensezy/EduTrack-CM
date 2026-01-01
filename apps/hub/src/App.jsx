/**
 * Hub App - Point d'entrée public
 * Landing page, inscription, connexion, onboarding
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/Landing/LandingPage';
import SignupPage from './pages/Signup/SignupPage';
import LoginPage from './pages/Login/LoginPage';
import OnboardingPage from './pages/Onboarding/OnboardingPage';
import AuthConfirm from './pages/AuthConfirm/AuthConfirm';
import EmailVerificationPage from './pages/EmailVerification/EmailVerificationPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/email-verification" element={<EmailVerificationPage />} />
        <Route path="/auth/confirm" element={<AuthConfirm />} />

        {/* Routes protégées */}
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
