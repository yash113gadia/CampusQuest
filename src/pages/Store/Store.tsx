import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { SpritePreview } from '../../components/SpritePreview';
import SHOP_ITEMS_WITH_SPRITES from '../../data/spriteAssets';
import type { ShopItemWithSprite } from '../../data/spriteAssets';
import './Store.css';

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const CATEGORIES = [
  { id: 'all', name: 'All', emoji: '🛒' },
  { id: 'shirt', name: 'Shirts', emoji: '👕' },
  { id: 'pants', name: 'Pants', emoji: '👖' },
  { id: 'shoes', name: 'Shoes', emoji: '👢' },
  { id: 'hair', name: 'Hair', emoji: '💇' },
  { id: 'accessory', name: 'Gear', emoji: '🎭' },
  { id: 'weapon', name: 'Weapons', emoji: '⚔️' },
];

const Store: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { character } = state;
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchaseMessage, setPurchaseMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Use character's owned items from state
  const ownedItems = new Set(character.ownedItems);

  // Filter items by category
  const filteredItems = selectedCategory === 'all' 
    ? SHOP_ITEMS_WITH_SPRITES 
    : SHOP_ITEMS_WITH_SPRITES.filter(item => item.category === selectedCategory);

  // Handle purchase
  const handlePurchase = (item: ShopItemWithSprite) => {
    if (ownedItems.has(item.id)) {
      // Already owned - equip it instead
      handleEquip(item);
      return;
    }

    if (character.gold < item.price) {
      setPurchaseMessage({ text: 'Not enough gold!', type: 'error' });
      setTimeout(() => setPurchaseMessage(null), 2000);
      return;
    }

    // Buy the item
    dispatch({ type: 'BUY_ITEM', payload: { itemId: item.id, price: item.price } });
    
    // Equip it immediately
    handleEquip(item);
    
    // Show success message
    setPurchaseMessage({ text: `Purchased & equipped ${item.name}!`, type: 'success' });
    dispatch({ 
      type: 'ADD_FLOATING_TEXT', 
      payload: { 
        id: `purchase-${Date.now()}`,
        text: `-${item.price} Gold`, 
        type: 'gold',
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      } 
    });
    setTimeout(() => setPurchaseMessage(null), 2000);
  };

  // Handle equipping an owned item
  const handleEquip = (item: ShopItemWithSprite) => {
    // Extract folder path from sprite path (remove /Idle.png)
    const equipPath = item.spritePath.replace(/\/[^/]+\.png$/, '');
    
    if (item.category === 'shirt' || item.category === 'pants' || item.category === 'shoes' || item.category === 'hair') {
      dispatch({ 
        type: 'UPDATE_EQUIPMENT', 
        payload: { slot: item.category, path: equipPath } 
      });
      
      if (ownedItems.has(item.id)) {
        setPurchaseMessage({ text: `Equipped ${item.name}!`, type: 'success' });
        setTimeout(() => setPurchaseMessage(null), 2000);
      }
    }
  };

  return (
    <div className="store-page">
      {/* Header */}
      <header className="store-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <div className="store-info">
          <h1>🏪 General Store</h1>
          <div className="gold-display">
            💰 {character.gold} Gold
          </div>
        </div>
      </header>

      {/* Purchase Message */}
      {purchaseMessage && (
        <div className={`purchase-message ${purchaseMessage.type}`}>
          {purchaseMessage.text}
        </div>
      )}

      <main className="store-main">
        {/* Category Tabs */}
        <nav className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-name">{cat.name}</span>
            </button>
          ))}
        </nav>

        {/* Shop Grid */}
        <div className="shop-grid">
          {filteredItems.map(item => {
            const isOwned = ownedItems.has(item.id);
            const canAfford = character.gold >= item.price;
            
            return (
              <div 
                key={item.id}
                className={`shop-item rarity-${item.rarity} ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'unaffordable' : ''}`}
                style={{ '--rarity-color': RARITY_COLORS[item.rarity] } as React.CSSProperties}
              >
                <div className="item-preview">
                  <SpritePreview 
                    spritePath={item.spritePath} 
                    size={128}
                    direction="down"
                    className="shop-sprite"
                  />
                  {isOwned && <span className="owned-badge">✓ Owned</span>}
                </div>
                
                <div className="item-info">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-desc">{item.description}</p>
                  {item.statBonus && (
                    <div className="stat-bonuses">
                      {Object.entries(item.statBonus).map(([stat, value]) => (
                        <span key={stat} className="stat-bonus">+{value} {stat}</span>
                      ))}
                    </div>
                  )}
                  <span className={`item-rarity ${item.rarity}`}>{item.rarity}</span>
                </div>
                
                <div className="item-footer">
                  <span className="item-price">
                    {isOwned ? '✓' : '💰'} {isOwned ? 'Owned' : `${item.price}`}
                  </span>
                  <button 
                    className={`buy-btn ${isOwned ? 'equip' : ''}`}
                    onClick={() => handlePurchase(item)}
                  >
                    {isOwned ? 'Equip' : 'Buy'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Store;
