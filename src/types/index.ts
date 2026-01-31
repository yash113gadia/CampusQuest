// ============================================
// CAMPUS QUEST - TYPE DEFINITIONS
// ============================================

// Character Creation Types
export interface CharacterDraft {
  baseId: string;    // "body_01"
  hairId: string;    // "hair_messy_brown"
  classId: string;   // "scholar"
  name: string;
}

// Full Character State
export interface Character {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  
  // Appearance
  skinId: string;
  hairId: string;
  hairColor: string;
  bodyType: string;
  armorId: string;
  weaponId: string;
  
  // Equipment sprite paths
  equipment: {
    body: string;
    head: string;
    shirt: string;
    pants: string;
    shoes: string;
    hair: string;
  };
  
  // Owned items (purchased from store)
  ownedItems: string[];
  
  // Stats
  stats: CharacterStats;
  
  // Class
  classId: CharacterClass;
  
  // Streak tracking
  streak: number;
  lastActiveDate: string;
}

export interface CharacterStats {
  STR: number;  // Strength - Physical tasks
  INT: number;  // Intelligence - Study tasks
  CHA: number;  // Charisma - Social tasks
  VIT: number;  // Vitality - Health tasks
  WIS: number;  // Wisdom - Creative tasks
  AGI: number;  // Agility - Quick tasks
}

export type CharacterClass = 'scholar' | 'athlete' | 'artist' | 'socialite' | 'explorer';

// Avatar Animation States
export type AvatarAction = 'idle' | 'walk' | 'attack' | 'hurt' | 'victory' | 'sit';

// Quest/Task Types
export interface Quest {
  id: string;
  title: string;
  description: string;
  subtasks: Subtask[];
  difficulty: QuestDifficulty;
  category: QuestCategory;
  rewards: QuestRewards;
  deadline?: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Subtask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export type QuestDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';

export type QuestCategory = 'study' | 'fitness' | 'social' | 'creative' | 'daily' | 'boss';

export interface QuestRewards {
  xp: number;
  gold: number;
  statBonus?: Partial<CharacterStats>;
  itemId?: string;
}

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'hair' | 'accessory' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  spriteId: string;
  statBonus?: Partial<CharacterStats>;
  isEquipped: boolean;
}

// Boss Types
export interface Boss {
  id: string;
  name: string;
  spriteId: string;
  maxHp: number;
  currentHp: number;
  rewards: QuestRewards;
}

// Floating Text for animations
export interface FloatingText {
  id: string;
  text: string;
  type: 'xp' | 'gold' | 'damage' | 'levelup' | 'streak';
  x: number;
  y: number;
}

// ============================================
// GUILD TYPES
// ============================================

export interface GuildMember {
  id: string;
  name: string;
  level: number;
  classId: CharacterClass;
  xpContributed: number;
  questsCompleted: number;
  joinedAt: string;
  skinId: string;
  hairId: string;
  hairColor: string;
  bodyType: string;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  emblem: string; // Emoji or icon identifier
  leaderId: string;
  members: GuildMember[];
  totalXp: number;
  totalQuestsCompleted: number;
  createdAt: string;
  maxMembers: number;
}
