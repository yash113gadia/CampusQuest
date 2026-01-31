import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import type { GuildMember } from '../../types';
import './Guild.css';

// Guild emblems to choose from
const GUILD_EMBLEMS = ['⚔️', '🏆', '🛡️', '🔥', '⭐', '🎯', '👑', '💎', '🦁', '🐉', '🌟', '🎮'];

// Class icons for display
const CLASS_ICONS: Record<string, string> = {
  scholar: '📚',
  athlete: '💪',
  artist: '🎨',
  socialite: '💬',
  explorer: '🧭',
};

type GuildView = 'overview' | 'create' | 'join' | 'members' | 'leaderboard';

const Guild: React.FC = () => {
  const { state, dispatch } = useGame();
  const { currentGuild, character } = state;
  const availableGuilds = state.availableGuilds || [];
  
  const [view, setView] = useState<GuildView>(currentGuild ? 'overview' : 'overview');
  const [joinGuildId, setJoinGuildId] = useState('');
  const [joinError, setJoinError] = useState('');
  
  // Create guild form state
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildDescription, setNewGuildDescription] = useState('');
  const [newGuildEmblem, setNewGuildEmblem] = useState('⚔️');

  const handleCreateGuild = () => {
    if (!newGuildName.trim()) return;
    
    dispatch({
      type: 'CREATE_GUILD',
      payload: {
        name: newGuildName.trim(),
        description: newGuildDescription.trim() || 'A new guild of adventurers!',
        emblem: newGuildEmblem,
      },
    });
    
    setNewGuildName('');
    setNewGuildDescription('');
    setNewGuildEmblem('⚔️');
    setView('overview');
  };

  const handleJoinGuild = () => {
    const guildId = joinGuildId.trim().toUpperCase();
    
    if (!guildId) {
      setJoinError('Please enter a Guild ID');
      return;
    }

    const guild = availableGuilds.find(g => g.id === guildId);
    
    if (!guild) {
      setJoinError('Guild not found. Check the ID and try again.');
      return;
    }

    if ((guild.members || []).length >= guild.maxMembers) {
      setJoinError('This guild is full!');
      return;
    }

    dispatch({ type: 'JOIN_GUILD', payload: { guildId } });
    setJoinGuildId('');
    setJoinError('');
    setView('overview');
  };

  const handleLeaveGuild = () => {
    if (window.confirm('Are you sure you want to leave this guild?')) {
      dispatch({ type: 'LEAVE_GUILD' });
    }
  };

  const copyGuildId = () => {
    if (currentGuild) {
      navigator.clipboard.writeText(currentGuild.id);
      alert(`Guild ID copied: ${currentGuild.id}`);
    }
  };

  // Sort members by XP contributed for leaderboard
  const sortedMembers = currentGuild?.members
    ? [...currentGuild.members].sort((a, b) => b.xpContributed - a.xpContributed)
    : [];

  // Render member card
  const renderMemberCard = (member: GuildMember, rank?: number) => {
    const isCurrentUser = member.id === character.id;
    const isLeader = currentGuild && member.id === currentGuild.leaderId;
    
    return (
      <div key={member.id} className={`member-card ${isCurrentUser ? 'current-user' : ''}`}>
        {rank !== undefined && (
          <div className={`rank-badge rank-${rank}`}>
            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
          </div>
        )}
        <div className="member-avatar">
          <span className="class-icon">{CLASS_ICONS[member.classId] || '👤'}</span>
        </div>
        <div className="member-info">
          <div className="member-name">
            {member.name}
            {isLeader && <span className="leader-badge">👑</span>}
            {isCurrentUser && <span className="you-badge">(You)</span>}
          </div>
          <div className="member-details">
            <span className="member-level">Lv.{member.level}</span>
            <span className="member-class">{member.classId}</span>
          </div>
        </div>
        <div className="member-stats">
          <div className="stat-row">
            <span className="stat-label">XP</span>
            <span className="stat-value xp">{member.xpContributed.toLocaleString()}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Quests</span>
            <span className="stat-value">{member.questsCompleted}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="guild-page">
      {/* Navigation */}
      <nav className="guild-nav">
        <Link to="/" className="back-btn">← Back</Link>
        <h1 className="page-title">👥 Guild Hall</h1>
      </nav>

      <div className="guild-content">
        {/* If in a guild, show guild info */}
        {currentGuild ? (
          <>
            {/* Guild Header */}
            <div className="guild-header">
              <div className="guild-emblem">{currentGuild.emblem}</div>
              <div className="guild-title-section">
                <h2 className="guild-name">{currentGuild.name}</h2>
                <p className="guild-description">{currentGuild.description}</p>
              </div>
              <div className="guild-id-section">
                <span className="guild-id-label">Guild ID:</span>
                <button className="guild-id-btn" onClick={copyGuildId}>
                  {currentGuild.id} 📋
                </button>
              </div>
            </div>

            {/* Guild Stats */}
            <div className="guild-stats">
              <div className="stat-card">
                <span className="stat-icon">👥</span>
                <span className="stat-number">{(currentGuild.members || []).length}/{currentGuild.maxMembers}</span>
                <span className="stat-name">Members</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">⭐</span>
                <span className="stat-number">{currentGuild.totalXp.toLocaleString()}</span>
                <span className="stat-name">Total XP</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📜</span>
                <span className="stat-number">{currentGuild.totalQuestsCompleted}</span>
                <span className="stat-name">Quests Done</span>
              </div>
            </div>

            {/* View Tabs */}
            <div className="view-tabs">
              <button 
                className={`tab-btn ${view === 'members' || view === 'overview' ? 'active' : ''}`}
                onClick={() => setView('members')}
              >
                Members
              </button>
              <button 
                className={`tab-btn ${view === 'leaderboard' ? 'active' : ''}`}
                onClick={() => setView('leaderboard')}
              >
                Leaderboard
              </button>
            </div>

            {/* Members List */}
            {(view === 'members' || view === 'overview') && (
              <div className="members-section">
                <h3 className="section-title">Guild Members</h3>
                <div className="members-list">
                  {currentGuild.members.map(member => renderMemberCard(member))}
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {view === 'leaderboard' && (
              <div className="leaderboard-section">
                <h3 className="section-title">🏆 XP Leaderboard</h3>
                <div className="leaderboard-list">
                  {sortedMembers.map((member, index) => renderMemberCard(member, index + 1))}
                </div>
              </div>
            )}

            {/* Leave Guild Button */}
            <div className="guild-actions">
              <button className="leave-guild-btn" onClick={handleLeaveGuild}>
                Leave Guild
              </button>
            </div>
          </>
        ) : (
          <>
            {/* No Guild - Show options */}
            {view === 'overview' && (
              <div className="no-guild-section">
                <div className="no-guild-icon">🏰</div>
                <h2 className="no-guild-title">You're not in a guild yet!</h2>
                <p className="no-guild-text">
                  Join forces with other adventurers to compete on leaderboards and earn glory together!
                </p>
                <div className="guild-options">
                  <button className="option-btn create" onClick={() => setView('create')}>
                    <span className="option-icon">⚔️</span>
                    <span className="option-text">Create Guild</span>
                    <span className="option-desc">Start your own guild and invite friends</span>
                  </button>
                  <button className="option-btn join" onClick={() => setView('join')}>
                    <span className="option-icon">🚪</span>
                    <span className="option-text">Join Guild</span>
                    <span className="option-desc">Enter a Guild ID to join</span>
                  </button>
                </div>

                {/* Available Guilds Preview */}
                {availableGuilds.length > 0 && (
                  <div className="available-guilds-section">
                    <h3 className="section-title">🔍 Featured Guilds</h3>
                    <div className="guilds-preview-list">
                      {availableGuilds.slice(0, 3).map(guild => (
                        <div key={guild.id} className="guild-preview-card">
                          <span className="preview-emblem">{guild.emblem}</span>
                          <div className="preview-info">
                            <span className="preview-name">{guild.name}</span>
                            <span className="preview-stats">
                              {(guild.members || []).length}/{guild.maxMembers} members • {(guild.totalXp || 0).toLocaleString()} XP
                            </span>
                          </div>
                          <button 
                            className="quick-join-btn"
                            onClick={() => {
                              dispatch({ type: 'JOIN_GUILD', payload: { guildId: guild.id } });
                            }}
                          >
                            Join
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Create Guild Form */}
            {view === 'create' && (
              <div className="create-guild-section">
                <button className="back-link" onClick={() => setView('overview')}>
                  ← Back to options
                </button>
                <h2 className="form-title">⚔️ Create Your Guild</h2>
                
                <div className="form-group">
                  <label>Guild Emblem</label>
                  <div className="emblem-picker">
                    {GUILD_EMBLEMS.map(emblem => (
                      <button
                        key={emblem}
                        className={`emblem-option ${newGuildEmblem === emblem ? 'selected' : ''}`}
                        onClick={() => setNewGuildEmblem(emblem)}
                      >
                        {emblem}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Guild Name</label>
                  <input
                    type="text"
                    className="guild-input"
                    placeholder="Enter guild name..."
                    value={newGuildName}
                    onChange={(e) => setNewGuildName(e.target.value)}
                    maxLength={30}
                  />
                </div>

                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea
                    className="guild-textarea"
                    placeholder="What is your guild about?"
                    value={newGuildDescription}
                    onChange={(e) => setNewGuildDescription(e.target.value)}
                    maxLength={100}
                  />
                </div>

                <button 
                  className="create-btn"
                  onClick={handleCreateGuild}
                  disabled={!newGuildName.trim()}
                >
                  Create Guild
                </button>
              </div>
            )}

            {/* Join Guild Form */}
            {view === 'join' && (
              <div className="join-guild-section">
                <button className="back-link" onClick={() => setView('overview')}>
                  ← Back to options
                </button>
                <h2 className="form-title">🚪 Join a Guild</h2>
                
                <p className="join-instruction">
                  Enter the Guild ID shared by your friend to join their guild.
                </p>

                <div className="form-group">
                  <label>Guild ID</label>
                  <input
                    type="text"
                    className="guild-input guild-id-input"
                    placeholder="e.g. ABC123"
                    value={joinGuildId}
                    onChange={(e) => {
                      setJoinGuildId(e.target.value.toUpperCase());
                      setJoinError('');
                    }}
                    maxLength={6}
                  />
                  {joinError && <span className="error-message">{joinError}</span>}
                </div>

                <button 
                  className="join-btn"
                  onClick={handleJoinGuild}
                  disabled={!joinGuildId.trim()}
                >
                  Join Guild
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Guild;
