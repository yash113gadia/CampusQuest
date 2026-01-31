import React, { useState, useMemo } from 'react';
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
  
  // Stats panel state
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Get today's date string
  const today = new Date().toISOString().split('T')[0];

  // Calculate daily statistics
  const dailyStats = useMemo(() => {
    const todayQuests = quests.filter(q => 
      q.isCompleted && q.completedAt?.startsWith(today)
    );
    
    const totalXP = todayQuests.reduce((sum, q) => sum + q.rewards.xp, 0);
    const totalGold = todayQuests.reduce((sum, q) => sum + q.rewards.gold, 0);
    
    // Category breakdown
    const categoryBreakdown: Record<string, { count: number; xp: number }> = {};
    todayQuests.forEach(q => {
      const cat = q.category || 'daily';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { count: 0, xp: 0 };
      }
      categoryBreakdown[cat].count++;
      categoryBreakdown[cat].xp += q.rewards.xp;
    });
    
    // Get top category
    const topCategory = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1].xp - a[1].xp)[0];
    
    // Weekly stats (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyQuests = quests.filter(q => 
      q.isCompleted && q.completedAt && new Date(q.completedAt) >= weekAgo
    );
    const weeklyXP = weeklyQuests.reduce((sum, q) => sum + q.rewards.xp, 0);
    const avgDailyXP = Math.round(weeklyXP / 7);
    
    // Completion rate
    const allTodayQuests = quests.filter(q => 
      q.createdAt.startsWith(today) || (q.isCompleted && q.completedAt?.startsWith(today))
    );
    const completionRate = allTodayQuests.length > 0 
      ? Math.round((todayQuests.length / allTodayQuests.length) * 100) 
      : 0;
    
    // Best streak (consecutive days with quests completed)
    const completedDates = [...new Set(
      quests
        .filter(q => q.isCompleted && q.completedAt)
        .map(q => q.completedAt!.split('T')[0])
    )].sort().reverse();
    
    let streak = 0;
    const checkDate = new Date();
    for (const date of completedDates) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (date === dateStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Weekly chart data (last 7 days)
    const weeklyChartData: { day: string; xp: number; quests: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayQuests = quests.filter(q => 
        q.isCompleted && q.completedAt?.startsWith(dateStr)
      );
      const dayXP = dayQuests.reduce((sum, q) => sum + q.rewards.xp, 0);
      
      weeklyChartData.push({
        day: dayName,
        xp: dayXP,
        quests: dayQuests.length,
      });
    }
    
    // Calculate max XP for chart scaling
    const maxDayXP = Math.max(...weeklyChartData.map(d => d.xp), 1);
    
    // Category chart data (for pie chart)
    const totalCategoryXP = Object.values(categoryBreakdown).reduce((sum, c) => sum + c.xp, 0) || 1;
    const categoryChartData = Object.entries(categoryBreakdown).map(([cat, data]) => ({
      category: cat,
      xp: data.xp,
      count: data.count,
      percentage: Math.round((data.xp / totalCategoryXP) * 100),
      color: CATEGORIES[cat as QuestCategory]?.color || '#666',
      icon: CATEGORIES[cat as QuestCategory]?.icon || '📋',
      label: CATEGORIES[cat as QuestCategory]?.label || cat,
    }));
    
    return {
      todayCompleted: todayQuests.length,
      totalXP,
      totalGold,
      categoryBreakdown,
      topCategory,
      weeklyXP,
      avgDailyXP,
      completionRate,
      streak,
      weeklyChartData,
      maxDayXP,
      categoryChartData,
    };
  }, [quests, today]);

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
          <button 
            className={`add-quest-button stats-btn ${isStatsOpen ? 'active' : ''}`}
            onClick={() => setIsStatsOpen(!isStatsOpen)}
          >
            📊 Stats
          </button>
        </div>
      </header>

      {/* Daily Stats Panel */}
      {isStatsOpen && (
        <div className="stats-panel">
          <div className="stats-header">
            <h2>📊 Daily Overview</h2>
            <span className="stats-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          
          {/* Main Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card primary">
              <span className="stat-icon">⚔️</span>
              <div className="stat-info">
                <span className="stat-value">{dailyStats.todayCompleted}</span>
                <span className="stat-label">Quests Done</span>
              </div>
            </div>
            
            <div className="stat-card xp">
              <span className="stat-icon">✨</span>
              <div className="stat-info">
                <span className="stat-value">{dailyStats.totalXP}</span>
                <span className="stat-label">XP Earned</span>
              </div>
            </div>
            
            <div className="stat-card gold">
              <span className="stat-icon">💰</span>
              <div className="stat-info">
                <span className="stat-value">{dailyStats.totalGold}</span>
                <span className="stat-label">Gold Earned</span>
              </div>
            </div>
            
            <div className="stat-card streak">
              <span className="stat-icon">🔥</span>
              <div className="stat-info">
                <span className="stat-value">{dailyStats.streak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
            </div>
          </div>

          {/* Progress & Category Section */}
          <div className="stats-details">
            {/* Completion Rate */}
            <div className="stats-section">
              <h3>📈 Today's Progress</h3>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(dailyStats.completionRate, 100)}%` }}
                />
                <span className="progress-text">{dailyStats.completionRate}% Complete</span>
              </div>
              <div className="progress-info">
                <span>Avg Daily: {dailyStats.avgDailyXP} XP</span>
                <span>Weekly: {dailyStats.weeklyXP} XP</span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="stats-section">
              <h3>🏷️ Category Breakdown</h3>
              <div className="category-breakdown">
                {Object.entries(dailyStats.categoryBreakdown).length > 0 ? (
                  Object.entries(dailyStats.categoryBreakdown).map(([cat, data]) => {
                    const categoryInfo = CATEGORIES[cat as QuestCategory] || { icon: '📋', label: cat, color: '#666' };
                    return (
                      <div key={cat} className="category-stat" style={{ '--cat-color': categoryInfo.color } as React.CSSProperties}>
                        <span className="cat-icon">{categoryInfo.icon}</span>
                        <span className="cat-name">{categoryInfo.label}</span>
                        <span className="cat-count">{data.count} quests</span>
                        <span className="cat-xp">+{data.xp} XP</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-categories">No quests completed yet today!</div>
                )}
              </div>
            </div>

            {/* Top Focus */}
            {dailyStats.topCategory && (
              <div className="stats-section highlight">
                <h3>🎯 Today's Focus</h3>
                <div className="top-category">
                  <span className="top-icon">
                    {CATEGORIES[dailyStats.topCategory[0] as QuestCategory]?.icon || '📋'}
                  </span>
                  <span className="top-label">
                    {CATEGORIES[dailyStats.topCategory[0] as QuestCategory]?.label || dailyStats.topCategory[0]}
                  </span>
                  <span className="top-value">
                    {dailyStats.topCategory[1].xp} XP from {dailyStats.topCategory[1].count} quests
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            {/* Weekly Activity Bar Chart */}
            <div className="chart-container">
              <h3>📊 Weekly Activity</h3>
              <div className="bar-chart">
                {dailyStats.weeklyChartData.map((day, index) => (
                  <div key={index} className="bar-column">
                    <div className="bar-value">{day.xp > 0 ? day.xp : ''}</div>
                    <div 
                      className="bar" 
                      style={{ 
                        height: `${(day.xp / dailyStats.maxDayXP) * 100}%`,
                        background: index === 6 ? 'var(--color-gold)' : 'var(--color-primary)'
                      }}
                    >
                      {day.quests > 0 && <span className="bar-quests">{day.quests}</span>}
                    </div>
                    <div className={`bar-label ${index === 6 ? 'today' : ''}`}>{day.day}</div>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <span>📋 Number inside bar = quests completed</span>
              </div>
            </div>

            {/* Category Distribution Chart */}
            <div className="chart-container">
              <h3>🎨 Category Distribution</h3>
              {dailyStats.categoryChartData.length > 0 ? (
                <>
                  <div className="donut-chart-container">
                    <div 
                      className="donut-chart"
                      style={{
                        background: dailyStats.categoryChartData.length === 1
                          ? dailyStats.categoryChartData[0].color
                          : `conic-gradient(${dailyStats.categoryChartData.map((cat, i) => {
                              const startPercent = dailyStats.categoryChartData.slice(0, i).reduce((sum, c) => sum + c.percentage, 0);
                              const endPercent = startPercent + cat.percentage;
                              return `${cat.color} ${startPercent}% ${endPercent}%`;
                            }).join(', ')})`
                      }}
                    >
                      <div className="donut-hole">
                        <span className="donut-total">{dailyStats.totalXP}</span>
                        <span className="donut-label">Total XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="chart-legend-items">
                    {dailyStats.categoryChartData.map((cat) => (
                      <div key={cat.category} className="legend-item">
                        <span className="legend-color" style={{ background: cat.color }}></span>
                        <span className="legend-icon">{cat.icon}</span>
                        <span className="legend-name">{cat.label}</span>
                        <span className="legend-percent">{cat.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-chart">
                  <span className="empty-icon">📊</span>
                  <p>Complete quests to see your category distribution!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
