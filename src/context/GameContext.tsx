import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Character, CharacterStats, CharacterClass, Quest, FloatingText, Guild, GuildMember } from '../types';
import { db } from '../firebase/config';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

// ============================================
// INITIAL STATE
// ============================================

const DEFAULT_STATS: CharacterStats = {
  STR: 5,
  INT: 5,
  CHA: 5,
  VIT: 5,
  WIS: 5,
  AGI: 5,
};

const CLASS_BONUSES: Record<CharacterClass, Partial<CharacterStats>> = {
  scholar: { INT: 5, WIS: 3 },
  athlete: { STR: 5, VIT: 3 },
  artist: { WIS: 5, CHA: 3 },
  socialite: { CHA: 5, AGI: 3 },
  explorer: { AGI: 5, STR: 3 },
};

const createInitialCharacter = (): Character => ({
  id: '',
  name: '',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  gold: 100, // Starting gold
  skinId: 'Peach',
  hairId: 'Short 02 - Parted',
  hairColor: 'Brown',
  bodyType: 'Body 02 - Masculine, Thin',
  armorId: 'armor_starter',
  weaponId: 'weapon_none',
  equipment: {
    body: '/assets-lpc/Characters/Body/Body 02 - Masculine, Thin/Peach',
    head: '/assets-lpc/Characters/Head/Head 02 - Masculine/Peach',
    shirt: '/assets-lpc/Characters/Clothing/Masculine, Thin/Torso/Shirt 04 - T-shirt/White',
    pants: '/assets-lpc/Characters/Clothing/Masculine, Thin/Legs/Pants 03 - Pants',
    shoes: '/assets-lpc/Characters/Clothing/Masculine, Thin/Feet/Shoes 01 - Shoes',
    hair: '/assets-lpc/Characters/Hair/Short 02 - Parted/Brown',
  },
  ownedItems: [], // Track purchased item IDs
  stats: { ...DEFAULT_STATS },
  classId: 'scholar',
  streak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
});

interface GameState {
  character: Character;
  quests: Quest[];
  floatingTexts: FloatingText[];
  isCharacterCreated: boolean;
  currentAction: 'idle' | 'walk' | 'attack' | 'hurt' | 'victory' | 'sit';
  // Guild state
  currentGuild: Guild | null;
  availableGuilds: Guild[];
  // Firebase state
  userId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
}

const initialState: GameState = {
  character: createInitialCharacter(),
  quests: [],
  floatingTexts: [],
  isCharacterCreated: false,
  currentAction: 'idle',
  currentGuild: null,
  availableGuilds: [],
  userId: null,
  isLoading: false,
  isSyncing: false,
};

// ============================================
// ACTION TYPES
// ============================================

type GameAction =
  | { type: 'CREATE_CHARACTER'; payload: { name: string; skinId: string; hairId: string; hairColor: string; bodyType: string; classId: CharacterClass } }
  | { type: 'ADD_XP'; payload: { amount: number; x?: number; y?: number } }
  | { type: 'ADD_GOLD'; payload: { amount: number; x?: number; y?: number } }
  | { type: 'LEVEL_UP' }
  | { type: 'UPDATE_STATS'; payload: Partial<CharacterStats> }
  | { type: 'EQUIP_ITEM'; payload: { slot: 'armorId' | 'weaponId' | 'hairId'; itemId: string } }
  | { type: 'UPDATE_EQUIPMENT'; payload: { slot: 'shirt' | 'pants' | 'shoes' | 'hair'; path: string } }
  | { type: 'BUY_ITEM'; payload: { itemId: string; price: number } }
  | { type: 'ADD_QUEST'; payload: Quest }
  | { type: 'COMPLETE_QUEST'; payload: { questId: string } }
  | { type: 'COMPLETE_SUBTASK'; payload: { questId: string; subtaskId: string } }
  | { type: 'DELETE_QUEST'; payload: { questId: string } }
  | { type: 'SET_ACTION'; payload: 'idle' | 'walk' | 'attack' | 'hurt' | 'victory' | 'sit' }
  | { type: 'ADD_FLOATING_TEXT'; payload: FloatingText }
  | { type: 'REMOVE_FLOATING_TEXT'; payload: { id: string } }
  | { type: 'UPDATE_STREAK' }
  | { type: 'TAKE_DAMAGE'; payload: { amount: number } }
  // Guild actions
  | { type: 'CREATE_GUILD'; payload: { name: string; description: string; emblem: string } }
  | { type: 'JOIN_GUILD'; payload: { guildId: string } }
  | { type: 'LEAVE_GUILD' }
  | { type: 'CONTRIBUTE_XP_TO_GUILD'; payload: { amount: number } }
  // Firebase actions
  | { type: 'SET_USER_ID'; payload: string | null }
  | { type: 'LOAD_USER_DATA'; payload: { character: Character; quests: Quest[]; currentGuildId: string | null } }
  | { type: 'LOAD_GUILDS'; payload: Guild[] }
  | { type: 'SET_CURRENT_GUILD'; payload: Guild | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'RESET_STATE' };

// ============================================
// XP CALCULATION HELPERS
// ============================================

const calculateXpToNextLevel = (level: number): number => {
  // Classic RPG formula: 100 * level^1.5
  return Math.floor(100 * Math.pow(level, 1.5));
};

const calculateQuestXp = (difficulty: string): number => {
  const xpTable: Record<string, number> = {
    trivial: 10,
    easy: 25,
    medium: 50,
    hard: 100,
    epic: 200,
    legendary: 500,
  };
  return xpTable[difficulty] || 25;
};

const calculateQuestGold = (difficulty: string): number => {
  const goldTable: Record<string, number> = {
    trivial: 5,
    easy: 10,
    medium: 25,
    hard: 50,
    epic: 100,
    legendary: 250,
  };
  return goldTable[difficulty] || 10;
};

// ============================================
// REDUCER
// ============================================

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CREATE_CHARACTER': {
      const { name, skinId, hairId, hairColor, bodyType, classId } = action.payload;
      const classBonus = CLASS_BONUSES[classId] || {};
      const newStats = { ...DEFAULT_STATS };
      
      // Apply class bonuses
      Object.entries(classBonus).forEach(([stat, bonus]) => {
        newStats[stat as keyof CharacterStats] += bonus as number;
      });

      // Determine clothing path based on body type
      const clothingType = bodyType.includes('Masculine') ? 'Masculine, Thin' : 'Feminine, Thin';
      const headType = bodyType.includes('Masculine') ? 'Head 02 - Masculine' : 'Head 01 - Feminine';

      return {
        ...state,
        character: {
          ...state.character,
          id: `char_${Date.now()}`,
          name,
          skinId,
          hairId,
          hairColor,
          bodyType,
          classId,
          stats: newStats,
          equipment: {
            body: `/assets-lpc/Characters/Body/${bodyType}/${skinId}`,
            head: `/assets-lpc/Characters/Head/${headType}/${skinId}`,
            shirt: `/assets-lpc/Characters/Clothing/${clothingType}/Torso/Shirt 04 - T-shirt/White`,
            pants: `/assets-lpc/Characters/Clothing/${clothingType}/Legs/Pants 03 - Pants`,
            shoes: `/assets-lpc/Characters/Clothing/${clothingType}/Feet/Shoes 01 - Shoes`,
            hair: `/assets-lpc/Characters/Hair/${hairId}/${hairColor}`,
          },
          weaponId: classId === 'scholar' ? 'weapon_wand' : 
                    classId === 'athlete' ? 'weapon_dumbbell' :
                    classId === 'artist' ? 'weapon_brush' :
                    classId === 'socialite' ? 'weapon_phone' : 'weapon_compass',
        },
        isCharacterCreated: true,
      };
    }

    case 'ADD_XP': {
      const { amount, x = 0, y = 0 } = action.payload;
      let newXp = state.character.xp + amount;
      let newLevel = state.character.level;
      let newXpToNext = state.character.xpToNextLevel;
      
      // Check for level up
      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = calculateXpToNextLevel(newLevel);
      }

      const floatingText: FloatingText = {
        id: `ft_${Date.now()}`,
        text: `+${amount} XP`,
        type: 'xp',
        x,
        y,
      };

      return {
        ...state,
        character: {
          ...state.character,
          xp: newXp,
          level: newLevel,
          xpToNextLevel: newXpToNext,
        },
        floatingTexts: [...state.floatingTexts, floatingText],
      };
    }

    case 'ADD_GOLD': {
      const { amount, x = 0, y = 0 } = action.payload;
      
      const floatingText: FloatingText = {
        id: `ft_${Date.now()}_gold`,
        text: `+${amount} Gold`,
        type: 'gold',
        x,
        y,
      };

      return {
        ...state,
        character: {
          ...state.character,
          gold: state.character.gold + amount,
        },
        floatingTexts: [...state.floatingTexts, floatingText],
      };
    }

    case 'LEVEL_UP': {
      const floatingText: FloatingText = {
        id: `ft_${Date.now()}_lvl`,
        text: 'LEVEL UP!',
        type: 'levelup',
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };

      return {
        ...state,
        currentAction: 'victory',
        floatingTexts: [...state.floatingTexts, floatingText],
      };
    }

    case 'UPDATE_STATS': {
      return {
        ...state,
        character: {
          ...state.character,
          stats: {
            ...state.character.stats,
            ...action.payload,
          },
        },
      };
    }

    case 'EQUIP_ITEM': {
      const { slot, itemId } = action.payload;
      return {
        ...state,
        character: {
          ...state.character,
          [slot]: itemId,
        },
      };
    }

    case 'UPDATE_EQUIPMENT': {
      const { slot, path } = action.payload;
      return {
        ...state,
        character: {
          ...state.character,
          equipment: {
            ...state.character.equipment,
            [slot]: path,
          },
        },
      };
    }

    case 'BUY_ITEM': {
      const { itemId, price } = action.payload;
      // Check if already owned
      if (state.character.ownedItems.includes(itemId)) {
        return state;
      }
      // Check if can afford
      if (state.character.gold < price) {
        return state;
      }
      return {
        ...state,
        character: {
          ...state.character,
          gold: state.character.gold - price,
          ownedItems: [...state.character.ownedItems, itemId],
        },
      };
    }

    case 'ADD_QUEST': {
      return {
        ...state,
        quests: [...state.quests, action.payload],
      };
    }

    case 'COMPLETE_QUEST': {
      const quest = state.quests.find(q => q.id === action.payload.questId);
      if (!quest || quest.isCompleted) return state;

      return {
        ...state,
        quests: state.quests.map(q =>
          q.id === action.payload.questId
            ? { ...q, isCompleted: true, completedAt: new Date().toISOString() }
            : q
        ),
        currentAction: 'attack',
      };
    }

    case 'COMPLETE_SUBTASK': {
      return {
        ...state,
        quests: state.quests.map(q =>
          q.id === action.payload.questId
            ? {
                ...q,
                subtasks: q.subtasks.map(st =>
                  st.id === action.payload.subtaskId
                    ? { ...st, isCompleted: true }
                    : st
                ),
              }
            : q
        ),
      };
    }

    case 'DELETE_QUEST': {
      return {
        ...state,
        quests: state.quests.filter(q => q.id !== action.payload.questId),
      };
    }

    case 'SET_ACTION': {
      return {
        ...state,
        currentAction: action.payload,
      };
    }

    case 'ADD_FLOATING_TEXT': {
      return {
        ...state,
        floatingTexts: [...state.floatingTexts, action.payload],
      };
    }

    case 'REMOVE_FLOATING_TEXT': {
      return {
        ...state,
        floatingTexts: state.floatingTexts.filter(ft => ft.id !== action.payload.id),
      };
    }

    case 'UPDATE_STREAK': {
      const today = new Date().toISOString().split('T')[0];
      const lastActive = state.character.lastActiveDate;
      
      // Calculate days since last active
      const daysDiff = Math.floor(
        (new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStreak = state.character.streak;
      if (daysDiff === 1) {
        newStreak += 1; // Continue streak
      } else if (daysDiff > 1) {
        newStreak = 1; // Reset streak
      }
      // If daysDiff === 0, same day, no change

      return {
        ...state,
        character: {
          ...state.character,
          streak: newStreak,
          lastActiveDate: today,
        },
      };
    }

    case 'TAKE_DAMAGE': {
      return {
        ...state,
        currentAction: 'hurt',
      };
    }

    // ============================================
    // GUILD ACTIONS
    // ============================================

    case 'CREATE_GUILD': {
      const { name, description, emblem } = action.payload;
      
      // Generate a unique guild ID (6 uppercase alphanumeric characters)
      const generateGuildId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      const newGuildId = generateGuildId();
      
      // Create member entry for current character
      const memberEntry: GuildMember = {
        id: state.character.id,
        name: state.character.name,
        level: state.character.level,
        classId: state.character.classId,
        xpContributed: 0,
        questsCompleted: state.quests.filter(q => q.isCompleted).length,
        joinedAt: new Date().toISOString(),
        skinId: state.character.skinId,
        hairId: state.character.hairId,
        hairColor: state.character.hairColor,
        bodyType: state.character.bodyType,
      };

      const newGuild: Guild = {
        id: newGuildId,
        name,
        description,
        emblem,
        leaderId: state.character.id,
        members: [memberEntry],
        totalXp: 0,
        totalQuestsCompleted: 0,
        createdAt: new Date().toISOString(),
        maxMembers: 10,
      };

      return {
        ...state,
        currentGuild: newGuild,
        availableGuilds: [...state.availableGuilds, newGuild],
      };
    }

    case 'JOIN_GUILD': {
      const { guildId } = action.payload;
      const targetGuild = state.availableGuilds.find(g => g.id === guildId);
      
      if (!targetGuild) return state;
      if (targetGuild.members.length >= targetGuild.maxMembers) return state;
      if (state.currentGuild) return state; // Already in a guild

      // Create member entry for current character
      const memberEntry: GuildMember = {
        id: state.character.id,
        name: state.character.name,
        level: state.character.level,
        classId: state.character.classId,
        xpContributed: 0,
        questsCompleted: state.quests.filter(q => q.isCompleted).length,
        joinedAt: new Date().toISOString(),
        skinId: state.character.skinId,
        hairId: state.character.hairId,
        hairColor: state.character.hairColor,
        bodyType: state.character.bodyType,
      };

      const updatedGuild: Guild = {
        ...targetGuild,
        members: [...targetGuild.members, memberEntry],
      };

      return {
        ...state,
        currentGuild: updatedGuild,
        availableGuilds: state.availableGuilds.map(g =>
          g.id === guildId ? updatedGuild : g
        ),
      };
    }

    case 'LEAVE_GUILD': {
      if (!state.currentGuild) return state;

      const guildId = state.currentGuild.id;
      const updatedGuild: Guild = {
        ...state.currentGuild,
        members: state.currentGuild.members.filter(m => m.id !== state.character.id),
      };

      // If no members left, remove the guild
      const shouldRemoveGuild = updatedGuild.members.length === 0;

      return {
        ...state,
        currentGuild: null,
        availableGuilds: shouldRemoveGuild
          ? state.availableGuilds.filter(g => g.id !== guildId)
          : state.availableGuilds.map(g => g.id === guildId ? updatedGuild : g),
      };
    }

    case 'CONTRIBUTE_XP_TO_GUILD': {
      if (!state.currentGuild) return state;

      const { amount } = action.payload;
      const updatedGuild: Guild = {
        ...state.currentGuild,
        totalXp: state.currentGuild.totalXp + amount,
        members: state.currentGuild.members.map(m =>
          m.id === state.character.id
            ? { ...m, xpContributed: m.xpContributed + amount, level: state.character.level }
            : m
        ),
      };

      return {
        ...state,
        currentGuild: updatedGuild,
        availableGuilds: state.availableGuilds.map(g =>
          g.id === state.currentGuild!.id ? updatedGuild : g
        ),
      };
    }

    // ============================================
    // FIREBASE ACTIONS
    // ============================================

    case 'SET_USER_ID': {
      return {
        ...state,
        userId: action.payload,
      };
    }

    case 'LOAD_USER_DATA': {
      const { character, quests } = action.payload;
      return {
        ...state,
        character,
        quests,
        isCharacterCreated: !!character.name,
        isLoading: false,
      };
    }

    case 'LOAD_GUILDS': {
      return {
        ...state,
        availableGuilds: action.payload,
      };
    }

    case 'SET_CURRENT_GUILD': {
      return {
        ...state,
        currentGuild: action.payload,
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case 'SET_SYNCING': {
      return {
        ...state,
        isSyncing: action.payload,
      };
    }

    case 'RESET_STATE': {
      return {
        ...initialState,
        isLoading: false,
      };
    }

    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  // Helper functions
  completeQuestWithRewards: (questId: string, cursorX?: number, cursorY?: number) => void;
  createQuest: (title: string, difficulty: string, category: string, subtasks?: string[]) => void;
  // Firebase functions
  setUserId: (userId: string | null) => void;
  saveToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // ============================================
  // FIREBASE SYNC FUNCTIONS
  // ============================================

  // Set user ID and load data
  const setUserId = useCallback(async (userId: string | null) => {
    dispatch({ type: 'SET_USER_ID', payload: userId });
    
    if (userId) {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        // Load user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          dispatch({
            type: 'LOAD_USER_DATA',
            payload: {
              character: data.character || createInitialCharacter(),
              quests: data.quests || [],
              currentGuildId: data.currentGuildId || null,
            },
          });
          
          // Load current guild if user is in one
          if (data.currentGuildId) {
            const guildDoc = await getDoc(doc(db, 'guilds', data.currentGuildId));
            if (guildDoc.exists()) {
              dispatch({ type: 'SET_CURRENT_GUILD', payload: guildDoc.data() as Guild });
            }
          }
        } else {
          // New user - create document
          dispatch({ type: 'SET_LOADING', payload: false });
        }
        
        // Load all available guilds
        const guildsSnapshot = await getDocs(collection(db, 'guilds'));
        const guilds = guildsSnapshot.docs.map(d => d.data() as Guild);
        dispatch({ type: 'LOAD_GUILDS', payload: guilds });
        
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'RESET_STATE' });
    }
  }, []);

  // Save current state to Firestore
  const saveToCloud = useCallback(async () => {
    if (!state.userId) return;
    
    dispatch({ type: 'SET_SYNCING', payload: true });
    try {
      const userRef = doc(db, 'users', state.userId);
      await setDoc(userRef, {
        character: state.character,
        quests: state.quests,
        currentGuildId: state.currentGuild?.id || null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      // Save guild updates if in a guild
      if (state.currentGuild) {
        const guildRef = doc(db, 'guilds', state.currentGuild.id);
        await setDoc(guildRef, {
          ...state.currentGuild,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving to cloud:', error);
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  }, [state.userId, state.character, state.quests, state.currentGuild]);

  // Load data from Firestore
  const loadFromCloud = useCallback(async () => {
    if (!state.userId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const userDoc = await getDoc(doc(db, 'users', state.userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        dispatch({
          type: 'LOAD_USER_DATA',
          payload: {
            character: data.character || createInitialCharacter(),
            quests: data.quests || [],
            currentGuildId: data.currentGuildId || null,
          },
        });
      }
    } catch (error) {
      console.error('Error loading from cloud:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.userId]);

  // Auto-save when state changes (debounced)
  useEffect(() => {
    if (!state.userId || !state.isCharacterCreated || state.isLoading) return;
    
    const saveTimeout = setTimeout(() => {
      saveToCloud();
    }, 2000); // Save after 2 seconds of no changes
    
    return () => clearTimeout(saveTimeout);
  }, [state.character, state.quests, state.currentGuild, state.userId, state.isCharacterCreated, state.isLoading, saveToCloud]);

  // ============================================
  // GAME HELPER FUNCTIONS
  // ============================================

  // Helper: Complete quest and grant rewards
  const completeQuestWithRewards = (questId: string, cursorX = 0, cursorY = 0) => {
    const quest = state.quests.find(q => q.id === questId);
    if (!quest || quest.isCompleted) return;

    // Complete the quest
    dispatch({ type: 'COMPLETE_QUEST', payload: { questId } });

    // Grant XP
    dispatch({ type: 'ADD_XP', payload: { amount: quest.rewards.xp, x: cursorX, y: cursorY } });

    // Contribute XP to guild if member
    if (state.currentGuild) {
      dispatch({ type: 'CONTRIBUTE_XP_TO_GUILD', payload: { amount: quest.rewards.xp } });
    }

    // Grant Gold (offset Y position)
    setTimeout(() => {
      dispatch({ type: 'ADD_GOLD', payload: { amount: quest.rewards.gold, x: cursorX, y: cursorY - 30 } });
    }, 200);

    // Apply stat bonuses if any
    if (quest.rewards.statBonus) {
      dispatch({ type: 'UPDATE_STATS', payload: quest.rewards.statBonus });
    }

    // Reset to idle after attack animation
    setTimeout(() => {
      dispatch({ type: 'SET_ACTION', payload: 'idle' });
    }, 500);
  };

  // Helper: Create a new quest
  const createQuest = (
    title: string,
    difficulty: string = 'medium',
    category: string = 'daily',
    subtaskTexts: string[] = []
  ) => {
    const quest: Quest = {
      id: `quest_${Date.now()}`,
      title,
      description: '',
      subtasks: subtaskTexts.map((text, i) => ({
        id: `subtask_${Date.now()}_${i}`,
        text,
        isCompleted: false,
      })),
      difficulty: difficulty as any,
      category: category as any,
      rewards: {
        xp: calculateQuestXp(difficulty),
        gold: calculateQuestGold(difficulty),
      },
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_QUEST', payload: quest });
  };

  return (
    <GameContext.Provider value={{ 
      state, 
      dispatch, 
      completeQuestWithRewards, 
      createQuest,
      setUserId,
      saveToCloud,
      loadFromCloud,
    }}>
      {children}
    </GameContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
