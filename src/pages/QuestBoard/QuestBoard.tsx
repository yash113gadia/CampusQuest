import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import QuestScroll from '../../components/QuestScroll/QuestScroll';
import { 
  ALL_QUEST_TEMPLATES, 
  CATEGORIES, 
  getDayRating,
  type QuestCategory,
  type QuestTemplate 
} from '../../data/questTemplates';
import './QuestBoard.css';

const QuestBoard: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { quests } = state;

  // Template picker state
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory | 'all'>('all');
  
  // Custom quest form state
  const [isCustomFormOpen, setIsCustomFormOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customPoints, setCustomPoints] = useState(5);
  const [customCategory, setCustomCategory] = useState<QuestCategory>('coding');

  // Calculate today's points
  const todayPoints = quests
    .filter(q => q.isCompleted && q.completedAt?.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((sum, q) => sum + q.rewards.xp, 0);
  
  const dayRating = getDayRating(todayPoints);

  // Filter quests
  const activeQuests = quests.filter(q => !q.isCompleted);
  const completedQuests = quests.filter(q => q.isCompleted);

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? ALL_QUEST_TEMPLATES 
    : ALL_QUEST_TEMPLATES.filter(t => t.category === selectedCategory);

  // Add quest from template
  const handleAddFromTemplate = (template: QuestTemplate) => {
    const quest = {
      id: `quest_${Date.now()}_${template.id}`,
      title: template.title,
      description: template.description || '',
      subtasks: [],
      difficulty: template.points >= 15 ? 'hard' : template.points >= 8 ? 'medium' : 'easy',
      category: template.category,
      rewards: {
        xp: template.points,
        gold: Math.floor(template.points / 2),
      },
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_QUEST', payload: quest as any });
  };

  // Add custom quest
  const handleAddCustomQuest = () => {
    if (!customTitle.trim()) return;
    
    const quest = {
      id: `quest_${Date.now()}_custom`,
      title: customTitle,
      description: '',
      subtasks: [],
      difficulty: customPoints >= 15 ? 'hard' : customPoints >= 8 ? 'medium' : 'easy',
      category: customCategory,
      rewards: {
        xp: customPoints,
        gold: Math.floor(customPoints / 2),
      },
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_QUEST', payload: quest as any });
    
    setCustomTitle('');
    setCustomPoints(5);
    setIsCustomFormOpen(false);
  };

  const handleCompleteQuest = (questId: string, event: React.MouseEvent) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) return;

    // Complete the quest
    dispatch({ type: 'COMPLETE_QUEST', payload: { questId } });
    dispatch({ type: 'ADD_XP', payload: { amount: quest.rewards.xp, x: event.clientX, y: event.clientY } });
    
    setTimeout(() => {
      dispatch({ type: 'ADD_GOLD', payload: { amount: quest.rewards.gold, x: event.clientX, y: event.clientY - 30 } });
    }, 200);

    setTimeout(() => {
      dispatch({ type: 'SET_ACTION', payload: 'idle' });
    }, 500);
  };

  const handleDeleteQuest = (questId: string) => {
    dispatch({ type: 'DELETE_QUEST', payload: { questId } });
  };
  return (
    <div className="quest-board-page">
      {/* Header */}
      <header className="quest-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <div className="header-center">
          <h1>📜 Quest Board</h1>
          <div className="daily-score" style={{ color: dayRating.color }}>
            {dayRating.icon} {todayPoints} pts - {dayRating.rating}
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="add-quest-button template-btn"
            onClick={() => setIsTemplatePickerOpen(true)}
          >
            📋 Templates
          </button>
          <button 
            className="add-quest-button"
            onClick={() => setIsCustomFormOpen(true)}
          >
            + Custom
          </button>
        </div>
      </header>

      {/* Template Picker Modal */}
      {isTemplatePickerOpen && (
        <div className="quest-form-overlay" onClick={() => setIsTemplatePickerOpen(false)}>
          <div className="template-picker" onClick={(e) => e.stopPropagation()}>
            <h2>📋 Quick Add from Templates</h2>
            
            {/* Category Filter */}
            <div className="category-filter">
              <button 
                className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              {(Object.entries(CATEGORIES) as [QuestCategory, typeof CATEGORIES[QuestCategory]][]).map(([key, cat]) => (
                <button
                  key={key}
                  className={`filter-btn ${selectedCategory === key ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(key)}
                  style={{ '--cat-color': cat.color } as React.CSSProperties}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Template List */}
            <div className="template-list">
              {filteredTemplates.map((template) => {
                const cat = CATEGORIES[template.category];
                return (
                  <button
                    key={template.id}
                    className="template-item"
                    onClick={() => handleAddFromTemplate(template)}
                    style={{ '--cat-color': cat.color } as React.CSSProperties}
                  >
                    <span className="template-icon">{template.icon}</span>
                    <div className="template-info">
                      <span className="template-title">{template.title}</span>
                      {template.subcategory && (
                        <span className="template-subcategory">{template.subcategory}</span>
                      )}
                    </div>
                    <span className="template-points">+{template.points} pts</span>
                  </button>
                );
              })}
            </div>

            <button className="btn cancel-btn" onClick={() => setIsTemplatePickerOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Custom Quest Form Modal */}
      {isCustomFormOpen && (
        <div className="quest-form-overlay" onClick={() => setIsCustomFormOpen(false)}>
          <div className="quest-form" onClick={(e) => e.stopPropagation()}>
            <h2>⚔️ Custom Quest</h2>
            
            <div className="form-group">
              <label>Quest Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="form-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Points: {customPoints}</label>
              <input
                type="range"
                min="1"
                max="25"
                value={customPoints}
                onChange={(e) => setCustomPoints(Number(e.target.value))}
                className="points-slider"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <div className="category-options">
                {(Object.entries(CATEGORIES) as [QuestCategory, typeof CATEGORIES[QuestCategory]][]).map(([key, cat]) => (
                  <button
                    key={key}
                    className={`category-option ${customCategory === key ? 'selected' : ''}`}
                    onClick={() => setCustomCategory(key)}
                    style={{ '--cat-color': cat.color } as React.CSSProperties}
                  >
                    <span className="cat-icon">{cat.icon}</span>
                    <span className="cat-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button className="btn cancel-btn" onClick={() => setIsCustomFormOpen(false)}>
                Cancel
              </button>
              <button 
                className="btn create-btn" 
                onClick={handleAddCustomQuest}
                disabled={!customTitle.trim()}
              >
                Create Quest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Lists */}
      <main className="quest-content">
        {/* Active Quests */}
        <section className="quest-section">
          <h2 className="section-title">
            <span>⚔️ Active Quests</span>
            <span className="quest-count">{activeQuests.length}</span>
          </h2>
          
          {activeQuests.length === 0 ? (
            <div className="empty-state">
              <p>No active quests!</p>
              <p>Add from templates or create a custom quest.</p>
            </div>
          ) : (
            <div className="quest-grid">
              {activeQuests.map((quest) => (
                <QuestScroll
                  key={quest.id}
                  quest={quest}
                  onComplete={handleCompleteQuest}
                  onDelete={handleDeleteQuest}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed Quests */}
        {completedQuests.length > 0 && (
          <section className="quest-section completed-section">
            <h2 className="section-title">
              <span>✅ Completed Today</span>
              <span className="quest-count">{completedQuests.length}</span>
            </h2>
            <div className="quest-grid">
              {completedQuests.slice(0, 6).map((quest) => (
                <QuestScroll
                  key={quest.id}
                  quest={quest}
                  onComplete={handleCompleteQuest}
                  onDelete={handleDeleteQuest}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default QuestBoard;
