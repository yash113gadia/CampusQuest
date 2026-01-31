import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import type { CharacterClass } from '../../types';
import './Login.css';

// Available options
const SKIN_COLORS = [
  { id: 'Porcelain', name: 'Porcelain', hex: '#f5e6d3' },
  { id: 'Ivory', name: 'Ivory', hex: '#f0d5b8' },
  { id: 'Peach', name: 'Peach', hex: '#e8c090' },
  { id: 'Tan', name: 'Tan', hex: '#d4a574' },
  { id: 'Honey', name: 'Honey', hex: '#c68642' },
  { id: 'Tawny', name: 'Tawny', hex: '#a0522d' },
  { id: 'Coffee', name: 'Coffee', hex: '#8b4513' },
  { id: 'Bronze', name: 'Bronze', hex: '#704214' },
  { id: 'Brown', name: 'Brown', hex: '#5c3317' },
];

const HAIR_COLORS = [
  { id: 'Black', name: 'Black', hex: '#1a1a1a' },
  { id: 'Brown', name: 'Brown', hex: '#4a3728' },
  { id: 'Chestnut', name: 'Chestnut', hex: '#8b4513' },
  { id: 'Blonde', name: 'Blonde', hex: '#daa520' },
  { id: 'Platinum', name: 'Platinum', hex: '#e8e8e8' },
  { id: 'Red', name: 'Red', hex: '#b22222' },
  { id: 'Gray', name: 'Gray', hex: '#808080' },
  { id: 'White', name: 'White', hex: '#f5f5f5' },
  { id: 'Blue', name: 'Blue', hex: '#4169e1' },
  { id: 'Pink', name: 'Pink', hex: '#ff69b4' },
  { id: 'Purple', name: 'Purple', hex: '#8b008b' },
  { id: 'Green', name: 'Green', hex: '#228b22' },
];

const HAIR_STYLES = [
  { id: 'Short 01 - Buzzcut', name: 'Buzzcut' },
  { id: 'Short 02 - Parted', name: 'Parted' },
  { id: 'Short 03 - Curly', name: 'Curly Short' },
  { id: 'Short 04 - Cowlick', name: 'Cowlick' },
  { id: 'Short 05 - Natural', name: 'Natural' },
  { id: 'Medium 01 - Page', name: 'Page' },
  { id: 'Medium 02 - Curly', name: 'Curly Medium' },
  { id: 'Medium 07 - Bob, Side Part', name: 'Bob' },
];

const BODY_TYPES = [
  { id: 'Body 02 - Masculine, Thin', name: 'Masculine' },
  { id: 'Body 01 - Feminine, Thin', name: 'Feminine' },
];

const CLASSES: { id: CharacterClass; name: string; icon: string; description: string }[] = [
  { id: 'scholar', name: 'Scholar', icon: '📚', description: '+5 INT, +3 WIS' },
  { id: 'athlete', name: 'Athlete', icon: '🏃', description: '+5 STR, +3 VIT' },
  { id: 'artist', name: 'Artist', icon: '🎨', description: '+5 WIS, +3 CHA' },
  { id: 'socialite', name: 'Socialite', icon: '✨', description: '+5 CHA, +3 AGI' },
  { id: 'explorer', name: 'Explorer', icon: '🧭', description: '+5 AGI, +3 STR' },
];

type AuthMode = 'login' | 'signup' | 'character';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch, setUserId, state } = useGame();
  const { user, loading: authLoading, error: authError, signIn, signUp, signInGoogle, clearError } = useAuth();

  // Auth form state
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Character creation state
  const [name, setName] = useState('');
  const [bodyType, setBodyType] = useState(BODY_TYPES[0].id);
  const [skinColor, setSkinColor] = useState(SKIN_COLORS[2].id);
  const [hairStyle, setHairStyle] = useState(HAIR_STYLES[1].id);
  const [hairColor, setHairColor] = useState(HAIR_COLORS[1].id);
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('scholar');
  const [step, setStep] = useState(1); // 1 = name, 2 = appearance, 3 = class

  // Build preview paths
  const bodyPath = `/assets-lpc/Characters/Body/${bodyType}/${skinColor}`;
  const headPath = bodyType.includes('Masculine') 
    ? `/assets-lpc/Characters/Head/Head 02 - Masculine/${skinColor}`
    : `/assets-lpc/Characters/Head/Head 01 - Feminine/${skinColor}`;
  const hairPath = `/assets-lpc/Characters/Hair/${hairStyle}/${hairColor}`;

  // If user is logged in and has created character, redirect
  React.useEffect(() => {
    if (user && !authLoading) {
      setUserId(user.uid);
    }
  }, [user, authLoading, setUserId]);

  // Switch to character creation if logged in but no character
  React.useEffect(() => {
    if (user && !state.isLoading && !state.isCharacterCreated) {
      setAuthMode('character');
      // Pre-fill name from Google account if available
      if (user.displayName && !name) {
        setName(user.displayName.split(' ')[0]);
      }
    } else if (user && state.isCharacterCreated) {
      navigate('/dashboard');
    }
  }, [user, state.isLoading, state.isCharacterCreated, navigate, name]);

  // Handle email login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || password !== confirmPassword) return;
    
    setIsSubmitting(true);
    try {
      await signUp(email, password, name || 'Adventurer');
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInGoogle();
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle character creation
  const handleCreateCharacter = () => {
    if (!name.trim()) return;

    dispatch({
      type: 'CREATE_CHARACTER',
      payload: {
        name: name.trim(),
        skinId: skinColor,
        hairId: hairStyle,
        hairColor,
        bodyType,
        classId: selectedClass,
      },
    });

    navigate('/dashboard');
  };

  // Switch auth mode
  const switchAuthMode = (mode: AuthMode) => {
    clearError();
    setAuthMode(mode);
  };

  // Show loading while checking auth state
  if (authLoading || state.isLoading) {
    return (
      <div className="login-page">
        <div className="login-container">
          <h1 className="login-title">⚔️ Campus Quest ⚔️</h1>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your adventure...</p>
          </div>
        </div>
      </div>
    );
  }

  // Character Creation Mode (after login)
  if (authMode === 'character' || (user && !state.isCharacterCreated)) {
    return (
      <div className="login-page">
        <div className="login-container">
          <h1 className="login-title">⚔️ Campus Quest ⚔️</h1>
          <p className="login-subtitle">Create Your Hero</p>

          {/* Progress Steps */}
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Name</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Appearance</div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Class</div>
          </div>

          {/* Character Preview */}
          <div className="character-preview">
            <div className="preview-avatar">
              <div className="sprite-layers">
                <div 
                  className="sprite-layer"
                  style={{ backgroundImage: `url("${bodyPath}/Idle.png")` }}
                />
                <div 
                  className="sprite-layer"
                  style={{ backgroundImage: `url("${headPath}/Idle.png")` }}
                />
                <div 
                  className="sprite-layer"
                  style={{ backgroundImage: `url("${hairPath}/Idle.png")` }}
                />
              </div>
            </div>
            <div className="preview-name">{name || 'Your Hero'}</div>
          </div>

          {/* Step 1: Name */}
          {step === 1 && (
            <div className="form-step">
              <label className="form-label">What shall we call you, adventurer?</label>
              <input
                type="text"
                className="name-input"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                autoFocus
              />
              <button 
                className="next-btn"
                onClick={() => setStep(2)}
                disabled={!name.trim()}
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2: Appearance */}
          {step === 2 && (
            <div className="form-step">
              <div className="option-group">
                <label className="option-label">Body Type</label>
                <div className="option-row">
                  {BODY_TYPES.map(type => (
                    <button
                      key={type.id}
                      className={`option-btn ${bodyType === type.id ? 'selected' : ''}`}
                      onClick={() => setBodyType(type.id)}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label className="option-label">Skin Tone</label>
                <div className="color-palette">
                  {SKIN_COLORS.map(color => (
                    <button
                      key={color.id}
                      className={`color-swatch ${skinColor === color.id ? 'selected' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSkinColor(color.id)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label className="option-label">Hair Style</label>
                <div className="option-row scrollable">
                  {HAIR_STYLES.map(style => (
                    <button
                      key={style.id}
                      className={`option-btn ${hairStyle === style.id ? 'selected' : ''}`}
                      onClick={() => setHairStyle(style.id)}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label className="option-label">Hair Color</label>
                <div className="color-palette">
                  {HAIR_COLORS.map(color => (
                    <button
                      key={color.id}
                      className={`color-swatch ${hairColor === color.id ? 'selected' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setHairColor(color.id)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="step-buttons">
                <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
                <button className="next-btn" onClick={() => setStep(3)}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 3: Class */}
          {step === 3 && (
            <div className="form-step">
              <label className="option-label">Choose Your Path</label>
              <div className="class-grid">
                {CLASSES.map(cls => (
                  <button
                    key={cls.id}
                    className={`class-card ${selectedClass === cls.id ? 'selected' : ''}`}
                    onClick={() => setSelectedClass(cls.id)}
                  >
                    <span className="class-icon">{cls.icon}</span>
                    <span className="class-name">{cls.name}</span>
                    <span className="class-desc">{cls.description}</span>
                  </button>
                ))}
              </div>

              <div className="step-buttons">
                <button className="back-btn" onClick={() => setStep(2)}>← Back</button>
                <button className="create-btn" onClick={handleCreateCharacter}>
                  🎮 Begin Adventure!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Auth Mode (Login / Signup)
  return (
    <div className="login-page">
      <div className="login-container auth-container">
        <h1 className="login-title">⚔️ Campus Quest ⚔️</h1>
        <p className="login-subtitle">
          {authMode === 'login' ? 'Welcome Back, Adventurer!' : 'Join the Adventure!'}
        </p>

        {/* Error Message */}
        {authError && (
          <div className="auth-error">
            <span>⚠️ {authError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="adventurer@campus.quest"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isSubmitting}
            />
          </div>

          {authMode === 'signup' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
              />
              {password && confirmPassword && password !== confirmPassword && (
                <span className="field-error">Passwords don't match</span>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting || (authMode === 'signup' && password !== confirmPassword)}
          >
            {isSubmitting ? (
              <span className="btn-loading">Loading...</span>
            ) : authMode === 'login' ? (
              '🗡️ Enter the Realm'
            ) : (
              '⚔️ Create Account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Google Sign In */}
        <button 
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Switch Auth Mode */}
        <div className="auth-switch">
          {authMode === 'login' ? (
            <p>
              New to Campus Quest?{' '}
              <button onClick={() => switchAuthMode('signup')}>Create an account</button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={() => switchAuthMode('login')}>Sign in</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
