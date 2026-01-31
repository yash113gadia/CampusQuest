// ============================================
// QUEST TEMPLATES - Pre-defined daily quests
// Based on the Deep Work & Self Improvement System
// ============================================

export interface QuestTemplate {
  id: string;
  title: string;
  category: QuestCategory;
  subcategory?: string;
  points: number;
  icon: string;
  description?: string;
}

export type QuestCategory = 
  | 'coding'
  | 'academic'
  | 'body'
  | 'mind'
  | 'reallife'
  | 'rhythm';

// Category metadata
export const CATEGORIES: Record<QuestCategory, { label: string; icon: string; color: string }> = {
  coding: { label: 'Coding', icon: '💻', color: '#5b6ee1' },
  academic: { label: 'Academic', icon: '📚', color: '#9b59b6' },
  body: { label: 'Body', icon: '💪', color: '#ac3232' },
  mind: { label: 'Mind', icon: '🧠', color: '#6abe30' },
  reallife: { label: 'Real Life', icon: '🎥', color: '#fbf236' },
  rhythm: { label: 'Rhythm', icon: '⏰', color: '#ff6b35' },
};

// ============================================
// DEEP WORK QUESTS
// ============================================

export const CODING_QUESTS: QuestTemplate[] = [
  // Learning
  {
    id: 'coding_learn',
    title: 'Consumed with intent (notes/mental model formed)',
    category: 'coding',
    subcategory: 'Learning',
    points: 5,
    icon: '📖',
    description: 'Max 5 points per day for learning',
  },
  // Doing
  {
    id: 'coding_10min',
    title: 'Coded for 10 minutes',
    category: 'coding',
    subcategory: 'Doing',
    points: 3,
    icon: '⌨️',
  },
  {
    id: 'coding_30min',
    title: 'Coded for 30 minutes',
    category: 'coding',
    subcategory: 'Doing',
    points: 8,
    icon: '💻',
  },
  {
    id: 'coding_1hr',
    title: 'Coded for 1 hour or more',
    category: 'coding',
    subcategory: 'Doing',
    points: 18,
    icon: '🔥',
  },
];

export const ACADEMIC_QUESTS: QuestTemplate[] = [
  {
    id: 'academic_graze',
    title: 'Grazed material (mental map formed)',
    category: 'academic',
    points: 5,
    icon: '👀',
  },
  {
    id: 'academic_read',
    title: 'Read material (not all subjects)',
    category: 'academic',
    points: 10,
    icon: '📖',
  },
  {
    id: 'academic_active',
    title: 'Actively interacted (questions/recall/notes)',
    category: 'academic',
    points: 15,
    icon: '✍️',
  },
  {
    id: 'academic_deep_most',
    title: 'Deep work — MOST planned tasks done',
    category: 'academic',
    points: 15,
    icon: '📋',
  },
  {
    id: 'academic_deep_all',
    title: 'Deep work — EVERYTHING planned done',
    category: 'academic',
    points: 20,
    icon: '🏆',
  },
];

// ============================================
// SELF IMPROVEMENT - BODY
// ============================================

export const BODY_QUESTS: QuestTemplate[] = [
  {
    id: 'body_stretch',
    title: '🦵 Stretching',
    category: 'body',
    points: 2.5,
    icon: '🦵',
  },
  {
    id: 'body_eyes',
    title: '👁️ Eye exercise',
    category: 'body',
    points: 2.5,
    icon: '👁️',
  },
  {
    id: 'body_workout',
    title: '🏋️ Workout',
    category: 'body',
    points: 10,
    icon: '🏋️',
  },
  // Cardio subcategory
  {
    id: 'body_stairs',
    title: 'Took stairs',
    category: 'body',
    subcategory: 'Cardio',
    points: 2,
    icon: '🚶',
  },
  {
    id: 'body_walk_light',
    title: 'Had a light walk',
    category: 'body',
    subcategory: 'Cardio',
    points: 5,
    icon: '🚶‍♂️',
  },
  {
    id: 'body_cardio_proper',
    title: 'Had proper cardio (jog/run or long walk)',
    category: 'body',
    subcategory: 'Cardio',
    points: 10,
    icon: '🏃',
  },
];

// ============================================
// SELF IMPROVEMENT - MIND
// ============================================

export const MIND_QUESTS: QuestTemplate[] = [
  {
    id: 'mind_meditate',
    title: '🧘 Meditate (allow mindfulness calm)',
    category: 'mind',
    points: 10,
    icon: '🧘',
  },
  {
    id: 'mind_journal',
    title: '📔 Journal',
    category: 'mind',
    points: 5,
    icon: '📔',
  },
  // Reading subcategory
  {
    id: 'mind_read_page',
    title: 'Read just one page',
    category: 'mind',
    subcategory: 'Reading',
    points: 5,
    icon: '📄',
  },
  {
    id: 'mind_read_10min',
    title: 'Read for 10 minutes',
    category: 'mind',
    subcategory: 'Reading',
    points: 10,
    icon: '📚',
  },
  {
    id: 'mind_read_chapter',
    title: 'Read an entire chapter',
    category: 'mind',
    subcategory: 'Reading',
    points: 15,
    icon: '📖',
  },
];

// ============================================
// REAL LIFE
// ============================================

export const REALLIFE_QUESTS: QuestTemplate[] = [
  {
    id: 'reallife_talking_head',
    title: '🎥 Recorded a talking head video',
    category: 'reallife',
    points: 10,
    icon: '🎥',
  },
  {
    id: 'reallife_content',
    title: '🎬 Recorded content (practice or content)',
    category: 'reallife',
    points: 10,
    icon: '🎬',
  },
];

// ============================================
// RHYTHM
// ============================================

export const RHYTHM_QUESTS: QuestTemplate[] = [
  {
    id: 'rhythm_wake',
    title: '⏰ Woke up within 30 min of intended time',
    category: 'rhythm',
    points: 5,
    icon: '🌅',
  },
  {
    id: 'rhythm_sleep',
    title: '🌙 Slept on time (shutdown ritual)',
    category: 'rhythm',
    points: 5,
    icon: '🌙',
  },
];

// ============================================
// ALL TEMPLATES COMBINED
// ============================================

export const ALL_QUEST_TEMPLATES: QuestTemplate[] = [
  ...CODING_QUESTS,
  ...ACADEMIC_QUESTS,
  ...BODY_QUESTS,
  ...MIND_QUESTS,
  ...REALLIFE_QUESTS,
  ...RHYTHM_QUESTS,
];

// Get templates by category
export const getTemplatesByCategory = (category: QuestCategory): QuestTemplate[] => {
  return ALL_QUEST_TEMPLATES.filter(t => t.category === category);
};

// Calculate daily max points
export const DAILY_MAX_POINTS = ALL_QUEST_TEMPLATES.reduce((sum, t) => sum + t.points, 0);

// Point thresholds for daily rating
export const DAILY_RATINGS = {
  legendary: 80,  // 80+ points = Legendary day
  epic: 60,       // 60-79 = Epic day
  great: 40,      // 40-59 = Great day
  good: 25,       // 25-39 = Good day
  okay: 10,       // 10-24 = Okay day
  rest: 0,        // 0-9 = Rest day
};

export const getDayRating = (points: number): { rating: string; color: string; icon: string } => {
  if (points >= DAILY_RATINGS.legendary) return { rating: 'Legendary', color: '#fbf236', icon: '👑' };
  if (points >= DAILY_RATINGS.epic) return { rating: 'Epic', color: '#9b59b6', icon: '⚔️' };
  if (points >= DAILY_RATINGS.great) return { rating: 'Great', color: '#5b6ee1', icon: '🌟' };
  if (points >= DAILY_RATINGS.good) return { rating: 'Good', color: '#6abe30', icon: '✨' };
  if (points >= DAILY_RATINGS.okay) return { rating: 'Okay', color: '#9badb7', icon: '👍' };
  return { rating: 'Rest Day', color: '#636363', icon: '😴' };
};
