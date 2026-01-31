// ============================================
// FIREBASE DATABASE SERVICE
// ============================================
// Handles all Firestore database operations for Campus Quest

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';
import type { Character, Quest, Guild, GuildMember } from '../types';

// ============================================
// USER / CHARACTER OPERATIONS
// ============================================

/**
 * Save or update user character data
 */
export const saveCharacter = async (userId: string, character: Character): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      character,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving character:', error);
    throw error;
  }
};

/**
 * Get user character data
 */
export const getCharacter = async (userId: string): Promise<Character | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data().character as Character;
    }
    return null;
  } catch (error) {
    console.error('Error getting character:', error);
    throw error;
  }
};

/**
 * Subscribe to character updates (real-time)
 */
export const subscribeToCharacter = (
  userId: string, 
  callback: (character: Character | null) => void
): (() => void) => {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().character as Character);
    } else {
      callback(null);
    }
  });
};

// ============================================
// QUEST OPERATIONS
// ============================================

/**
 * Save user quests
 */
export const saveQuests = async (userId: string, quests: Quest[]): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      quests,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving quests:', error);
    throw error;
  }
};

/**
 * Get user quests
 */
export const getQuests = async (userId: string): Promise<Quest[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().quests) {
      return userSnap.data().quests as Quest[];
    }
    return [];
  } catch (error) {
    console.error('Error getting quests:', error);
    throw error;
  }
};

// ============================================
// GUILD OPERATIONS
// ============================================

/**
 * Create a new guild
 */
export const createGuild = async (guild: Guild): Promise<void> => {
  try {
    const guildRef = doc(db, 'guilds', guild.id);
    await setDoc(guildRef, {
      ...guild,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating guild:', error);
    throw error;
  }
};

/**
 * Get a guild by ID
 */
export const getGuild = async (guildId: string): Promise<Guild | null> => {
  try {
    const guildRef = doc(db, 'guilds', guildId);
    const guildSnap = await getDoc(guildRef);
    
    if (guildSnap.exists()) {
      return guildSnap.data() as Guild;
    }
    return null;
  } catch (error) {
    console.error('Error getting guild:', error);
    throw error;
  }
};

/**
 * Get all guilds (for browsing)
 */
export const getAllGuilds = async (): Promise<Guild[]> => {
  try {
    const guildsRef = collection(db, 'guilds');
    const guildsSnap = await getDocs(guildsRef);
    
    return guildsSnap.docs.map(doc => doc.data() as Guild);
  } catch (error) {
    console.error('Error getting all guilds:', error);
    throw error;
  }
};

/**
 * Join a guild
 */
export const joinGuild = async (guildId: string, member: GuildMember): Promise<void> => {
  try {
    const guildRef = doc(db, 'guilds', guildId);
    await updateDoc(guildRef, {
      members: arrayUnion(member),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error joining guild:', error);
    throw error;
  }
};

/**
 * Leave a guild
 */
export const leaveGuild = async (guildId: string, memberId: string): Promise<void> => {
  try {
    // First get the guild to find the member object
    const guild = await getGuild(guildId);
    if (!guild) throw new Error('Guild not found');
    
    const memberToRemove = guild.members.find(m => m.id === memberId);
    if (!memberToRemove) throw new Error('Member not found in guild');
    
    const guildRef = doc(db, 'guilds', guildId);
    await updateDoc(guildRef, {
      members: arrayRemove(memberToRemove),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error leaving guild:', error);
    throw error;
  }
};

/**
 * Update guild stats (XP contribution, etc.)
 */
export const updateGuildStats = async (
  guildId: string, 
  updates: Partial<Guild>
): Promise<void> => {
  try {
    const guildRef = doc(db, 'guilds', guildId);
    await updateDoc(guildRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating guild stats:', error);
    throw error;
  }
};

/**
 * Subscribe to guild updates (real-time)
 */
export const subscribeToGuild = (
  guildId: string, 
  callback: (guild: Guild | null) => void
): (() => void) => {
  const guildRef = doc(db, 'guilds', guildId);
  
  return onSnapshot(guildRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as Guild);
    } else {
      callback(null);
    }
  });
};

/**
 * Update user's current guild reference
 */
export const updateUserGuild = async (userId: string, guildId: string | null): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      currentGuildId: guildId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user guild:', error);
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a unique guild ID
 */
export const generateGuildId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Check if a guild ID is available
 */
export const isGuildIdAvailable = async (guildId: string): Promise<boolean> => {
  const guild = await getGuild(guildId);
  return guild === null;
};
