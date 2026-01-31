import React, { useState } from 'react';
import type { Quest } from '../../types';
import './QuestScroll.css';

interface QuestScrollProps {
  quest: Quest;
  onComplete: (questId: string, event: React.MouseEvent) => void;
  onDelete: (questId: string) => void;
}

// Category colors and icons (matching the point system)
const CATEGORY_DATA: Record<string, { icon: string; color: string }> = {
  coding: { icon: '💻', color: '#5b6ee1' },
  academic: { icon: '📚', color: '#9b59b6' },
  body: { icon: '💪', color: '#ac3232' },
  mind: { icon: '🧠', color: '#6abe30' },
  reallife: { icon: '🎥', color: '#fbf236' },
  rhythm: { icon: '⏰', color: '#ff6b35' },
  // Legacy categories
  study: { icon: '📚', color: '#9b59b6' },
  fitness: { icon: '💪', color: '#ac3232' },
  social: { icon: '👥', color: '#5b6ee1' },
  creative: { icon: '🎨', color: '#fbf236' },
  daily: { icon: '📅', color: '#6abe30' },
  boss: { icon: '👹', color: '#ac3232' },
};

const QuestScroll: React.FC<QuestScrollProps> = ({ quest, onComplete, onDelete }) => {
  const [isSlashed, setIsSlashed] = useState(false);

  const handleComplete = (e: React.MouseEvent) => {
    if (quest.isCompleted) return;
    
    // Trigger slash animation
    setIsSlashed(true);
    
    // Play sound (if available)
    try {
      const audio = new Audio('/assets/sounds/sword_slash.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}

    // Delay the actual completion for animation
    setTimeout(() => {
      onComplete(quest.id, e);
    }, 300);
  };

  const completedSubtasks = quest.subtasks.filter(st => st.isCompleted).length;
  const totalSubtasks = quest.subtasks.length;
  const catData = CATEGORY_DATA[quest.category] || { icon: '📜', color: '#5b6ee1' };
  const categoryIcon = catData.icon;
  const categoryColor = catData.color;

  return (
    <div 
      className={`quest-scroll ${quest.isCompleted ? 'completed' : ''} ${isSlashed ? 'slashed' : ''}`}
      style={{ '--category-color': categoryColor } as React.CSSProperties}
    >
      {/* Slash Effect Overlay */}
      {isSlashed && <div className="slash-effect" />}

      {/* Scroll Header */}
      <div className="scroll-header">
        <span className="quest-category">{categoryIcon}</span>
        <h3 className="quest-title">{quest.title}</h3>
        <span 
          className="quest-points"
          style={{ color: categoryColor }}
        >
          +{quest.rewards.xp} pts
        </span>
      </div>

      {/* Subtasks */}
      {quest.subtasks.length > 0 && (
        <ul className="quest-subtasks">
          {quest.subtasks.map((subtask) => (
            <li 
              key={subtask.id}
              className={subtask.isCompleted ? 'done' : ''}
            >
              <span className="subtask-check">
                {subtask.isCompleted ? '✓' : '○'}
              </span>
              <span className="subtask-text">{subtask.text}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Progress Bar (for subtasks) */}
      {totalSubtasks > 0 && (
        <div className="subtask-progress">
          <div className="progress-bar">
            <div 
              className="progress-bar-fill"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
          <span className="progress-text">{completedSubtasks}/{totalSubtasks}</span>
        </div>
      )}

      {/* Scroll Footer - Rewards */}
      <div className="scroll-footer">
        <div className="quest-rewards">
          <span className="reward xp-reward">
            ⭐ {quest.rewards.xp} XP
          </span>
          <span className="reward gold-reward">
            🪙 {quest.rewards.gold} Gold
          </span>
        </div>

        <div className="quest-actions">
          {!quest.isCompleted && (
            <button 
              className="complete-btn"
              onClick={handleComplete}
              title="Complete Quest"
            >
              ⚔️
            </button>
          )}
          <button 
            className="delete-btn"
            onClick={() => onDelete(quest.id)}
            title="Delete Quest"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestScroll;
