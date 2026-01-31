import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { SpritePreview } from '../../components/SpritePreview';
import { SHOP_ITEMS_WITH_SPRITES } from '../../data/spriteAssets';
import type { ShopItemWithSprite } from '../../data/spriteAssets';
import './Inventory.css';

// Achievement data
const ACHIEVEMENTS = [
  { id: 'first_quest', name: 'First Steps', description: 'Complete your first quest', emoji: '🎯', unlocked: true },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', emoji: '🔥', unlocked: false },
  { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', emoji: '⭐', unlocked: false },
  { id: 'focus_master', name: 'Focus Master', description: 'Complete 10 focus sessions', emoji: '🧘', unlocked: false },
  { id: 'gold_100', name: 'Treasure Hunter', description: 'Earn 100 gold', emoji: '💰', unlocked: true },
  { id: 'quests_10', name: 'Quest Champion', description: 'Complete 10 quests', emoji: '🏆', unlocked: false },
];

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

// Map to convert slot to display name
const SLOT_NAMES: Record<string, string> = {
  shirt: '👕 Shirt',
  pants: '👖 Pants',
  shoes: '👢 Shoes',
  hair: '💇 Hair',
};

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { character } = state;

  // Get owned items from character state
  const ownedItems = character.ownedItems
    .map(id => SHOP_ITEMS_WITH_SPRITES.find(item => item.id === id))
    .filter((item): item is ShopItemWithSprite => item !== undefined);

  // Check if an item is currently equipped
  const isEquipped = (item: ShopItemWithSprite): boolean => {
    const equipPath = item.spritePath.replace(/\/[^/]+\.png$/, '');
    const slot = item.category as keyof typeof character.equipment;
    return character.equipment[slot] === equipPath;
  };

  // Handle equip item
  const handleEquip = (item: ShopItemWithSprite) => {
    const equipPath = item.spritePath.replace(/\/[^/]+\.png$/, '');
    if (item.category === 'shirt' || item.category === 'pants' || item.category === 'shoes' || item.category === 'hair') {
      dispatch({ 
        type: 'UPDATE_EQUIPMENT', 
        payload: { slot: item.category, path: equipPath } 
      });
    }
  };

  // Get currently equipped item details for each slot
  const getEquippedItem = (slot: string) => {
    const currentPath = character.equipment[slot as keyof typeof character.equipment];
    // Find item by matching path
    return SHOP_ITEMS_WITH_SPRITES.find(item => {
      const itemPath = item.spritePath.replace(/\/[^/]+\.png$/, '');
      return itemPath === currentPath;
    });
  };

  return (
    <div className="inventory-page">
      {/* Header */}
      <header className="inventory-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <div className="inventory-info">
          <h1>🎒 Inventory</h1>
          <div className="gold-display">
            💰 {character.gold} Gold
          </div>
        </div>
      </header>

      <main className="inventory-main">
        {/* Equipment Section */}
        <section className="inventory-section equipment-section">
          <h2>⚔️ Equipped</h2>
          <div className="equipment-grid">
            {(['shirt', 'pants', 'shoes', 'hair'] as const).map(slot => {
              const equipped = getEquippedItem(slot);
              const currentPath = character.equipment[slot];
              return (
                <div key={slot} className="equipment-slot">
                  <span className="slot-name">{SLOT_NAMES[slot]}</span>
                  <div className="slot-content">
                    {currentPath && (
                      <SpritePreview 
                        spritePath={`${currentPath}/Idle.png`} 
                        size={72}
                        direction="down"
                      />
                    )}
                    <span className="equipped-name">{equipped?.name || 'Default'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Owned Items Section */}
        <section className="inventory-section items-section">
          <h2>📦 Owned Items ({ownedItems.length})</h2>
          {ownedItems.length === 0 ? (
            <div className="empty-message">
              <p>No items owned yet!</p>
              <button className="shop-link" onClick={() => navigate('/store')}>
                🏪 Visit the Store
              </button>
            </div>
          ) : (
            <div className="items-grid">
              {ownedItems.map(item => {
                const equipped = isEquipped(item);
                return (
                  <div 
                    key={item.id} 
                    className={`item-card rarity-${item.rarity} ${equipped ? 'equipped' : ''}`}
                    style={{ '--rarity-color': RARITY_COLORS[item.rarity] } as React.CSSProperties}
                  >
                    <div className="item-icon">
                      <SpritePreview 
                        spritePath={item.spritePath} 
                        size={64}
                        direction="down"
                      />
                    </div>
                    <div className="item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-type">{item.category}</span>
                    </div>
                    {item.statBonus && (
                      <div className="item-stats">
                        {Object.entries(item.statBonus).map(([stat, value]) => (
                          <span key={stat} className="stat-bonus">+{value} {stat}</span>
                        ))}
                      </div>
                    )}
                    <button 
                      className={`equip-btn ${equipped ? 'equipped' : ''}`}
                      onClick={() => handleEquip(item)}
                      disabled={equipped}
                    >
                      {equipped ? '✓ Equipped' : 'Equip'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Achievements Section */}
        <section className="inventory-section achievements-section">
          <h2>🏅 Achievements</h2>
          <div className="achievements-grid">
            {ACHIEVEMENTS.map(achievement => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">
                  {achievement.unlocked ? achievement.emoji : '🔒'}
                </div>
                <div className="achievement-details">
                  <span className="achievement-name">{achievement.name}</span>
                  <span className="achievement-desc">{achievement.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Summary */}
        <section className="inventory-section stats-section">
          <h2>📊 Stats Summary</h2>
          <div className="stats-bars">
            {Object.entries(character.stats).map(([stat, value]) => (
              <div key={stat} className="stat-bar-row">
                <span className="stat-name">{stat}</span>
                <div className="stat-bar-container">
                  <div 
                    className="stat-bar-fill"
                    style={{ width: `${Math.min(value * 5, 100)}%` }}
                  />
                </div>
                <span className="stat-value">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Inventory;
