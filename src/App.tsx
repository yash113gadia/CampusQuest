import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { QuestBoard } from './pages/QuestBoard';
import { Dungeon } from './pages/Dungeon';
import { Inventory } from './pages/Inventory';
import { Store } from './pages/Store';
import Login from './pages/Login';
import Guild from './pages/Guild';
import FloatingTextLayer from './components/FloatingText/FloatingTextLayer';
import './styles/global.css';

// Simple wrapper for route content
const RouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Protected route - redirects to login if not logged in
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { state } = useGame();
  
  // Still loading auth/game state
  if (authLoading || state.isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-slate)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(244, 196, 48, 0.2)',
            borderTopColor: 'var(--color-gold)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '0.75rem',
            color: 'var(--color-parchment)',
          }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }
  
  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Logged in but no character created
  if (!state.isCharacterCreated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Main App content (needs to be inside GameProvider to use useGame)
const AppContent: React.FC = () => {
  const { state, dispatch } = useGame();

  return (
    <>
      {/* Global Floating Text Layer */}
      <FloatingTextLayer texts={state.floatingTexts} dispatch={dispatch} />
      
      <Routes>
        {/* Login/Character Creation */}
        <Route path="/login" element={
          state.isCharacterCreated ? <Navigate to="/" replace /> : <Login />
        } />
        
        {/* Main Dashboard (Landing) */}
        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        
        {/* Quest Board */}
        <Route path="/quests" element={
          <ProtectedRoute><QuestBoard /></ProtectedRoute>
        } />
        
        {/* Dungeon (Progress/Streak) */}
        <Route path="/dungeon" element={
          <ProtectedRoute><Dungeon /></ProtectedRoute>
        } />
        
        {/* Inventory */}
        <Route path="/inventory" element={
          <ProtectedRoute><Inventory /></ProtectedRoute>
        } />
        
        {/* Store */}
        <Route path="/store" element={
          <ProtectedRoute><Store /></ProtectedRoute>
        } />
        
        {/* Guild */}
        <Route path="/guild" element={
          <ProtectedRoute><Guild /></ProtectedRoute>
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

// Placeholder component for unbuilt pages
const PlaceholderPage: React.FC<{ title: string; message: string }> = ({ title, message }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-slate)',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '2rem',
        color: 'var(--color-gold)',
        marginBottom: '1rem',
      }}>
        {title}
      </h1>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '1.25rem',
        color: 'var(--color-parchment)',
        marginBottom: '2rem',
      }}>
        {message}
      </p>
      <button
        onClick={() => window.history.back()}
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '0.875rem',
          padding: '0.75rem 1.5rem',
          background: 'var(--color-wood)',
          border: '4px solid var(--color-wood-light)',
          color: 'var(--color-parchment)',
          cursor: 'pointer',
        }}
      >
        ← Go Back
      </button>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <AppContent />
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App
