import React from "react";
import Routes from "./Routes";
import { AuthProvider } from './contexts/AuthContext';
import SessionDebugger from './components/SessionDebugger';

function App() {
  return (
    <AuthProvider>
      <Routes />
      {/* Session Debugger - visible uniquement en développement */}
      {import.meta.env.DEV && <SessionDebugger />}
    </AuthProvider>
  );
}

export default App;