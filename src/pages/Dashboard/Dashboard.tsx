import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AvatarStage } from '../../components/AvatarStage';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import StatsHexagon from '../../components/StatsHexagon/StatsHexagon';
import FloatingTextLayer from '../../components/FloatingText/FloatingTextLayer';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { signOut } = useAuth();
  const { character, currentAction, floatingTexts, isCharacterCreated, quests } = state;

  // Redirect to barracks if no character created
  useEffect(() => {
    if (!isCharacterCreated) {
      navigate('/');
    }
  }, [isCharacterCreated, navigate]);

  // Update streak on load
  useEffect(() => {
    dispatch({ type: 'UPDATE_STREAK' });
  }, [dispatch]);

  // Calculate XP percentage
  const xpPercentage = (character.xp / character.xpToNextLevel) * 100;

  // Calculate quest stats
  const activeQuests = quests.filter(q => !q.isCompleted);
  const completedToday = quests.filter(q => {
    if (!q.completedAt) return false;
    const completed = new Date(q.completedAt);
    const today = new Date();
    return completed.toDateString() === today.toDateString();
  }).length;
  const totalCompleted = quests.filter(q => q.isCompleted).length;

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Hotbar navigation items
  const hotbarItems = [
    { id: 'quests', icon: '📜', label: 'Quests', path: '/quests' },
    { id: 'dungeon', icon: '🏰', label: 'Dungeon', path: '/dungeon' },
    { id: 'inventory', icon: '🎒', label: 'Inventory', path: '/inventory' },
    { id: 'store', icon: '🏪', label: 'Store', path: '/store' },
    { id: 'guild', icon: '👥', label: 'Guild', path: '/guild' },
  ];

  if (!isCharacterCreated) {
    return null;
  }

  return (
    <div className="dashboard-page">
      {/* Floating Text Layer */}
      <FloatingTextLayer texts={floatingTexts} dispatch={dispatch} />

      {/* Top Bar - Player Info */}
      <header className="dashboard-header">
        <div className="player-info">
          <div className="player-greeting">{getGreeting()},</div>
          <div className="player-name">{character.name}</div>
          <div className="player-class">{character.classId}</div>
        </div>
        
        <div className="resource-bars">
          {/* XP Bar */}
          <div className="resource-bar xp-bar">
            <div className="resource-label">
              <span>LVL {character.level}</span>
              <span>{character.xp} / {character.xpToNextLevel} XP</span>
            </div>
            <div className="progress-bar progress-bar-xp">
              <div 
                className="progress-bar-fill"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="currency-display">
            <div className="currency gold">
              <span className="currency-icon">🪙</span>
              <span className="currency-amount">{character.gold}</span>
            </div>
            <div className="streak-display">
              <span className="streak-icon">🔥</span>
              <span className="streak-amount">{character.streak}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            🚪
          </button>
        </div>
      </header>

      {/* Main Content - Organized 3-Column Layout */}
      <main className="dashboard-main">
        {/* Left Panel - Stats */}
        <div className="left-panel">
          <div className="panel-title">📊 Stats</div>
          <div className="quick-stats">
            <div className="stat-pill">
              <span className="stat-icon">💪</span>
              <span className="stat-value">{character.stats.STR}</span>
              <span className="stat-label">STR</span>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">🧠</span>
              <span className="stat-value">{character.stats.INT}</span>
              <span className="stat-label">INT</span>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">✨</span>
              <span className="stat-value">{character.stats.CHA}</span>
              <span className="stat-label">CHA</span>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">❤️</span>
              <span className="stat-value">{character.stats.VIT}</span>
              <span className="stat-label">VIT</span>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">📖</span>
              <span className="stat-value">{character.stats.WIS}</span>
              <span className="stat-label">WIS</span>
            </div>
            <div className="stat-pill">
              <span className="stat-icon">⚡</span>
              <span className="stat-value">{character.stats.AGI}</span>
              <span className="stat-label">AGI</span>
            </div>
          </div>
        </div>

        {/* Center - Avatar Stage */}
        <div className="center-panel">
          <div className="stage-container">
            <div className="avatar-wrapper">
              <AvatarStage
                equipment={character.equipment}
                action={currentAction}
                size={200}
              />
            </div>
            {/* Stats Hexagon Overlay */}
            <div className="stats-overlay">
              <StatsHexagon stats={character.stats} size={280} />
            </div>
          </div>
          <div className="character-name-plate">
            <span className="name">{character.name || 'Adventurer'}</span>
            <span className="class">{character.classId}</span>
          </div>
        </div>

        {/* Right Panel - Quick Actions & Quests */}
        <div className="right-panel">
          <div className="panel-title">⚔️ Quick Actions</div>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/quests')}>
              <span>📜</span>
              <span>View Quests</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/dungeon')}>
              <span>🏰</span>
              <span>Enter Dungeon</span>
            </button>
          </div>

          {/* Active Quests Preview */}
          <div className="active-quests-section">
            <div className="section-header">
              <span>📋 Active Quests</span>
              <span className="quest-count">{activeQuests.length}</span>
            </div>
            {activeQuests.length > 0 ? (
              <div className="quest-preview-list">
                {activeQuests.slice(0, 3).map(quest => (
                  <div key={quest.id} className="quest-preview-item">
                    <span className="quest-icon">
                      {quest.difficulty === 'easy' ? '🟢' : quest.difficulty === 'medium' ? '🟡' : '🔴'}
                    </span>
                    <span className="quest-title">{quest.title}</span>
                  </div>
                ))}
                {activeQuests.length > 3 && (
                  <button className="view-more-btn" onClick={() => navigate('/quests')}>
                    +{activeQuests.length - 3} more
                  </button>
                )}
              </div>
            ) : (
              <div className="no-quests">
                <span>No active quests</span>
                <button className="add-quest-btn" onClick={() => navigate('/quests')}>
                  + Add Quest
                </button>
              </div>
            )}
          </div>

          {/* Daily Progress */}
          <div className="daily-summary">
            <div className="summary-title">📊 Today's Progress</div>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-value">{completedToday}</span>
                <span className="summary-label">Completed</span>
              </div>
              <div className="summary-item">
                <span className="summary-value">{totalCompleted}</span>
                <span className="summary-label">All Time</span>
              </div>
              <div className="summary-item">
                <span className="summary-value streak">🔥 {character.streak}</span>
                <span className="summary-label">Day Streak</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hotbar Navigation */}
      <nav className="hotbar">
        {hotbarItems.map((item) => (
          <button
            key={item.id}
            className="hotbar-slot"
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="hotbar-icon">{item.icon}</span>
            <span className="hotbar-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Dashboard;
