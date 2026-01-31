// ============================================
// LPC SPRITE ASSET PATHS
// Central mapping for all sprite assets
// ============================================

const BASE_PATH = '/assets-lpc/Characters';

// Body types
export const BODY_TYPES = {
  masculine: 'Body/Masculine/Body 02 - Masculine, Thin',
  feminine: 'Body/Feminine/Body 02 - Feminine, Thin',
};

// Hair styles with paths
export const HAIR_STYLES = {
  buzzcut: {
    name: 'Buzzcut',
    path: `${BASE_PATH}/Hair/Short 01 - Buzzcut`,
    colors: ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White'],
  },
  parted: {
    name: 'Parted',
    path: `${BASE_PATH}/Hair/Short 02 - Parted`,
    colors: ['Black', 'Brown', 'Blonde', 'Red', 'Gray'],
  },
  curly_short: {
    name: 'Curly (Short)',
    path: `${BASE_PATH}/Hair/Short 03 - Curly`,
    colors: ['Black', 'Brown', 'Blonde', 'Red'],
  },
  cowlick: {
    name: 'Cowlick',
    path: `${BASE_PATH}/Hair/Short 04 - Cowlick`,
    colors: ['Black', 'Brown', 'Blonde', 'Red', 'Gray'],
  },
  natural: {
    name: 'Natural',
    path: `${BASE_PATH}/Hair/Short 05 - Natural`,
    colors: ['Black', 'Brown', 'Blonde', 'Red'],
  },
  page: {
    name: 'Page',
    path: `${BASE_PATH}/Hair/Medium 01 - Page`,
    colors: ['Black', 'Brown', 'Blonde', 'Red', 'Gray'],
  },
  curly_medium: {
    name: 'Curly (Medium)',
    path: `${BASE_PATH}/Hair/Medium 02 - Curly`,
    colors: ['Black', 'Brown', 'Blonde', 'Red'],
  },
  bob: {
    name: 'Bob',
    path: `${BASE_PATH}/Hair/Medium 07 - Bob, Side Part`,
    colors: ['Black', 'Brown', 'Blonde', 'Red', 'Gray'],
  },
};

// Shirt styles
export const SHIRTS = {
  longsleeve: {
    name: 'Longsleeve Shirt',
    path: `${BASE_PATH}/Clothing/Masculine, Thin/Torso/Shirt 01 - Longsleeve Shirt`,
    colors: ['White', 'Black', 'Blue', 'Red', 'Green', 'Purple', 'Brown', 'Gray'],
    idleSprite: 'Idle.png',
    walkSprite: 'Walk.png',
    runSprite: 'Run.png',
  },
  vneck: {
    name: 'V-neck Shirt',
    path: `${BASE_PATH}/Clothing/Masculine, Thin/Torso/Shirt 02 - V-neck Longsleeve Shirt`,
    colors: ['White', 'Black', 'Blue', 'Red', 'Green', 'Brown'],
    idleSprite: 'Idle.png',
    walkSprite: 'Walk.png',
  },
  tshirt: {
    name: 'T-Shirt',
    path: `${BASE_PATH}/Clothing/Masculine, Thin/Torso/Shirt 04 - T-shirt`,
    colors: ['White', 'Black', 'Blue', 'Red', 'Green', 'Yellow', 'Purple'],
    idleSprite: 'Idle.png',
    walkSprite: 'Walk.png',
  },
  polo: {
    name: 'Polo Shirt',
    path: `${BASE_PATH}/Clothing/Masculine, Thin/Torso/Shirt 09 - Polo`,
    colors: ['White', 'Black', 'Blue', 'Red', 'Green'],
    idleSprite: 'Idle.png',
    walkSprite: 'Walk.png',
  },
};

// Pants styles
export const PANTS = {
  hose: {
    name: 'Hose',
    path: `${BASE_PATH}/Clothing/Masculine, Thin/Legs/Pants 01 - Hose`,
    colors: ['White', 'Black', 'Blue', 'Brown', 'Gray', 'Green'],
    idleSprite: 'Idle.png',
    walkSprite: 'Walk.png',
  },
  leggings: {
    name: 'Leggings',
    path: `${BASE_PATH}/Clothing/Masculine, Thin/Legs/Pants 02 - Leggings`,
    colors: ['Black', 'Blue', 'Brown', 'Gray'],
    idleSprite: 'Idle.png',
    walkSprite: 'Walk.png',
  },
  pants: {
    name: 'Pants',
    path: `${BASE_PATH}/Clothing/Masculine, Thin/Legs/Pants 03 - Pants`,
    colors: ['Black', 'Blue', 'Brown', 'Gray', 'Denim'],
    idleSprite: 'Idle.png',
    walkSprite: 'Walk.png',
  },
  shorts: {
    name: 'Shorts',
    path: `${BASE_PATH}/Clothing/Masculine, Thin/Legs/Shorts 01 - Shorts`,
    colors: ['Black', 'Blue', 'Brown', 'Gray', 'Red'],
    idleSprite: 'Idle.png',
    walkSprite: 'Walk.png',
  },
};

// Shoes styles
export const SHOES = {
  shoes: {
    name: 'Shoes',
    path: `${BASE_PATH}/Clothing/Masculine, Thin/Feet/Shoes 01 - Shoes`,
    colors: ['Black', 'Brown', 'Gray', 'White'],
    idleSprite: 'Idle.png',
    walkSprite: 'Walk.png',
  },
  boots: {
    name: 'Boots',
    path: `${BASE_PATH}/Clothing/Masculine, Thin/Feet/Shoes 02 - Boots`,
    colors: ['Black', 'Brown', 'Gray'],
    idleSprite: 'Idle.png',
    walkSprite: 'Walk.png',
  },
};

// Head accessories
export const HEAD_ACCESSORIES = {
  glasses: {
    name: 'Glasses',
    path: `${BASE_PATH}/Head Accessories/Eyewear 01 - Glasses`,
    colors: ['Black', 'Brown', 'Gold', 'Silver'],
  },
  halfmoon: {
    name: 'Halfmoon Glasses',
    path: `${BASE_PATH}/Head Accessories/Eyewear 02 - Halfmoon Glasses`,
    colors: ['Gold', 'Silver'],
  },
  eyepatch: {
    name: 'Eyepatch',
    path: `${BASE_PATH}/Head Accessories/Eyewear 03 - Eyepatch`,
    colors: ['Black', 'Brown'],
  },
  bascinet_open: {
    name: 'Bascinet Helm (Open)',
    path: `${BASE_PATH}/Head Accessories/Helm 01 - Bascinet, Open`,
    colors: ['Steel', 'Bronze', 'Gold'],
  },
  norman: {
    name: 'Norman Helm',
    path: `${BASE_PATH}/Head Accessories/Helm 03 - Norman`,
    colors: ['Steel', 'Bronze'],
  },
  chainmail_hood: {
    name: 'Chainmail Hood',
    path: `${BASE_PATH}/Head Accessories/Helm 04 - Chainmail Hood`,
    colors: ['Steel'],
  },
};

// Weapons
export const WEAPONS = {
  sword: {
    name: 'Arming Sword',
    path: `${BASE_PATH}/Props/Sword 01 - Arming Sword`,
    colors: ['Steel', 'Bronze', 'Gold', 'Iron'],
    combatSprite: 'Combat 1h - Slash.png',
    idleSprite: 'Combat 1h - Idle.png',
  },
};

// Shields
export const SHIELDS = {
  heater: {
    name: 'Heater Shield',
    path: `${BASE_PATH}/Props/Shield 01 - Heater Shield`,
    variants: ['Wood', 'Paint', 'Trim'],
  },
};

// Helper to get sprite path
export const getSpritePath = (
  category: 'shirt' | 'pants' | 'shoes' | 'hair' | 'accessory' | 'weapon',
  itemId: string,
  color: string = 'White',
  animation: 'idle' | 'walk' | 'run' = 'idle'
): string => {
  const animationFile = animation === 'idle' ? 'Idle.png' : animation === 'walk' ? 'Walk.png' : 'Run.png';
  
  switch (category) {
    case 'shirt':
      const shirt = SHIRTS[itemId as keyof typeof SHIRTS];
      return shirt ? `${shirt.path}/${color}/${animationFile}` : '';
    case 'pants':
      const pants = PANTS[itemId as keyof typeof PANTS];
      return pants ? `${pants.path}/${color}/${animationFile}` : '';
    case 'shoes':
      const shoes = SHOES[itemId as keyof typeof SHOES];
      return shoes ? `${shoes.path}/${color}/${animationFile}` : '';
    default:
      return '';
  }
};

// Shop items with sprite references
export interface ShopItemWithSprite {
  id: string;
  name: string;
  category: 'hair' | 'shirt' | 'pants' | 'shoes' | 'accessory' | 'weapon';
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  spritePath: string;
  spriteColor?: string;
  statBonus?: Record<string, number>;
}

export const SHOP_ITEMS_WITH_SPRITES: ShopItemWithSprite[] = [
  // Shirts
  {
    id: 'shirt_white_tee',
    name: 'White T-Shirt',
    category: 'shirt',
    price: 30,
    rarity: 'common',
    description: 'Simple and clean',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Torso/Shirt 04 - T-shirt/White/Idle.png`,
    spriteColor: 'White',
  },
  {
    id: 'shirt_blue_polo',
    name: 'Blue Polo',
    category: 'shirt',
    price: 50,
    rarity: 'uncommon',
    description: 'Smart casual style',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Torso/Shirt 09 - Polo/Blue/Idle.png`,
    spriteColor: 'Blue',
    statBonus: { CHA: 1 },
  },
  {
    id: 'shirt_red_longsleeve',
    name: 'Red Longsleeve',
    category: 'shirt',
    price: 60,
    rarity: 'uncommon',
    description: 'Bold and warm',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Torso/Shirt 01 - Longsleeve Shirt/Red/Idle.png`,
    spriteColor: 'Red',
    statBonus: { STR: 1 },
  },
  {
    id: 'shirt_purple_vneck',
    name: 'Purple V-Neck',
    category: 'shirt',
    price: 80,
    rarity: 'rare',
    description: 'Mystical vibes, +2 WIS',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Torso/Shirt 02 - V-neck Longsleeve Shirt/Purple/Idle.png`,
    spriteColor: 'Purple',
    statBonus: { WIS: 2 },
  },
  {
    id: 'shirt_black_buttoned',
    name: 'Black Formal Shirt',
    category: 'shirt',
    price: 120,
    rarity: 'rare',
    description: 'Elegant and professional, +2 CHA',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Torso/Shirt 07 - Buttoned Longsleeve Shirt/Black/Idle.png`,
    spriteColor: 'Black',
    statBonus: { CHA: 2 },
  },
  {
    id: 'shirt_gold_scoop',
    name: 'Golden Tunic',
    category: 'shirt',
    price: 250,
    rarity: 'epic',
    description: 'Fit for royalty, +3 CHA +2 WIS',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Torso/Shirt 03 - Scoop Longsleeve Shirt/Honey/Idle.png`,
    spriteColor: 'Honey',
    statBonus: { CHA: 3, WIS: 2 },
  },

  // Pants
  {
    id: 'pants_brown_hose',
    name: 'Brown Hose',
    category: 'pants',
    price: 25,
    rarity: 'common',
    description: 'Classic medieval style',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Legs/Pants 01 - Hose/Brown/Idle.png`,
    spriteColor: 'Brown',
  },
  {
    id: 'pants_blue_jeans',
    name: 'Blue Jeans',
    category: 'pants',
    price: 40,
    rarity: 'common',
    description: 'Durable denim',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Legs/Pants 03 - Pants/Denim/Idle.png`,
    spriteColor: 'Denim',
  },
  {
    id: 'pants_black_leggings',
    name: 'Black Leggings',
    category: 'pants',
    price: 60,
    rarity: 'uncommon',
    description: 'Flexible and fast, +1 AGI',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Legs/Pants 02 - Leggings/Black/Idle.png`,
    spriteColor: 'Black',
    statBonus: { AGI: 1 },
  },
  {
    id: 'pants_gray_cuffed',
    name: 'Gray Cuffed Pants',
    category: 'pants',
    price: 80,
    rarity: 'uncommon',
    description: 'Stylish and modern',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Legs/Pants 04 - Cuffed Pants/Gray/Idle.png`,
    spriteColor: 'Gray',
    statBonus: { CHA: 1 },
  },
  {
    id: 'pants_green_overalls',
    name: 'Green Overalls',
    category: 'pants',
    price: 100,
    rarity: 'rare',
    description: 'Ready for adventure, +2 VIT',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Legs/Pants 05 - Overalls/Green/Idle.png`,
    spriteColor: 'Green',
    statBonus: { VIT: 2 },
  },
  {
    id: 'pants_red_shorts',
    name: 'Red Shorts',
    category: 'pants',
    price: 35,
    rarity: 'common',
    description: 'Cool and casual',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Legs/Shorts 01 - Shorts/Red/Idle.png`,
    spriteColor: 'Red',
  },

  // Shoes
  {
    id: 'shoes_brown_shoes',
    name: 'Brown Shoes',
    category: 'shoes',
    price: 20,
    rarity: 'common',
    description: 'Basic footwear',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Feet/Shoes 01 - Shoes/Brown/Idle.png`,
    spriteColor: 'Brown',
  },
  {
    id: 'shoes_black_boots',
    name: 'Black Boots',
    category: 'shoes',
    price: 50,
    rarity: 'uncommon',
    description: 'Sturdy and reliable, +1 VIT',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Feet/Shoes 02 - Boots/Black/Idle.png`,
    spriteColor: 'Black',
    statBonus: { VIT: 1 },
  },
  {
    id: 'shoes_white_sneakers',
    name: 'White Sneakers',
    category: 'shoes',
    price: 75,
    rarity: 'rare',
    description: 'Fast and fresh, +2 AGI',
    spritePath: `${BASE_PATH}/Clothing/Masculine, Thin/Feet/Shoes 01 - Shoes/White/Idle.png`,
    spriteColor: 'White',
    statBonus: { AGI: 2 },
  },

  // Hair
  {
    id: 'hair_buzzcut_black',
    name: 'Buzzcut (Black)',
    category: 'hair',
    price: 30,
    rarity: 'common',
    description: 'Clean and simple',
    spritePath: `${BASE_PATH}/Hair/Short 01 - Buzzcut/Black/Idle.png`,
    spriteColor: 'Black',
  },
  {
    id: 'hair_parted_brown',
    name: 'Parted Hair (Brown)',
    category: 'hair',
    price: 40,
    rarity: 'common',
    description: 'Classic gentleman style',
    spritePath: `${BASE_PATH}/Hair/Short 02 - Parted/Brown/Idle.png`,
    spriteColor: 'Brown',
  },
  {
    id: 'hair_curly_blonde',
    name: 'Curly Hair (Blonde)',
    category: 'hair',
    price: 60,
    rarity: 'uncommon',
    description: 'Bouncy and fun, +1 CHA',
    spritePath: `${BASE_PATH}/Hair/Short 03 - Curly/Blonde/Idle.png`,
    spriteColor: 'Blonde',
    statBonus: { CHA: 1 },
  },
  {
    id: 'hair_page_red',
    name: 'Page Cut (Red)',
    category: 'hair',
    price: 80,
    rarity: 'rare',
    description: 'Noble style, +1 CHA +1 WIS',
    spritePath: `${BASE_PATH}/Hair/Medium 01 - Page/Red/Idle.png`,
    spriteColor: 'Red',
    statBonus: { CHA: 1, WIS: 1 },
  },
  {
    id: 'hair_bob_gray',
    name: 'Bob Cut (Gray)',
    category: 'hair',
    price: 100,
    rarity: 'rare',
    description: 'Wise and distinguished, +2 WIS',
    spritePath: `${BASE_PATH}/Hair/Medium 07 - Bob, Side Part/Gray/Idle.png`,
    spriteColor: 'Gray',
    statBonus: { WIS: 2 },
  },

  // Accessories
  {
    id: 'acc_glasses_black',
    name: 'Reading Glasses',
    category: 'accessory',
    price: 50,
    rarity: 'common',
    description: 'For the studious, +1 INT',
    spritePath: `${BASE_PATH}/Head Accessories/Eyewear 01 - Glasses/Black/Idle.png`,
    spriteColor: 'Black',
    statBonus: { INT: 1 },
  },
  {
    id: 'acc_glasses_gold',
    name: 'Gold Spectacles',
    category: 'accessory',
    price: 120,
    rarity: 'rare',
    description: 'Scholarly elegance, +2 INT +1 CHA',
    spritePath: `${BASE_PATH}/Head Accessories/Eyewear 02 - Halfmoon Glasses/Gold/Idle.png`,
    spriteColor: 'Gold',
    statBonus: { INT: 2, CHA: 1 },
  },
  {
    id: 'acc_eyepatch',
    name: 'Eyepatch',
    category: 'accessory',
    price: 80,
    rarity: 'uncommon',
    description: 'Mysterious pirate look, +1 STR +1 CHA',
    spritePath: `${BASE_PATH}/Head Accessories/Eyewear 03 - Eyepatch/Black/Idle.png`,
    spriteColor: 'Black',
    statBonus: { STR: 1, CHA: 1 },
  },
  {
    id: 'acc_helm_bascinet',
    name: 'Steel Bascinet',
    category: 'accessory',
    price: 200,
    rarity: 'epic',
    description: 'Knight\'s protection, +3 VIT +2 STR',
    spritePath: `${BASE_PATH}/Head Accessories/Helm 01 - Bascinet, Open/Steel/Idle.png`,
    spriteColor: 'Steel',
    statBonus: { VIT: 3, STR: 2 },
  },
  {
    id: 'acc_helm_chainmail',
    name: 'Chainmail Hood',
    category: 'accessory',
    price: 150,
    rarity: 'rare',
    description: 'Warrior\'s armor, +2 VIT +1 STR',
    spritePath: `${BASE_PATH}/Head Accessories/Helm 04 - Chainmail Hood/Steel/Idle.png`,
    spriteColor: 'Steel',
    statBonus: { VIT: 2, STR: 1 },
  },

  // Weapons
  {
    id: 'weapon_sword_steel',
    name: 'Steel Sword',
    category: 'weapon',
    price: 150,
    rarity: 'rare',
    description: 'A trusty blade, +3 STR',
    spritePath: `${BASE_PATH}/Props/Sword 01 - Arming Sword/Steel/Combat 1h - Idle.png`,
    spriteColor: 'Steel',
    statBonus: { STR: 3 },
  },
  {
    id: 'weapon_sword_gold',
    name: 'Golden Sword',
    category: 'weapon',
    price: 400,
    rarity: 'legendary',
    description: 'Legendary blade, +5 STR +2 CHA',
    spritePath: `${BASE_PATH}/Props/Sword 01 - Arming Sword/Gold/Combat 1h - Idle.png`,
    spriteColor: 'Gold',
    statBonus: { STR: 5, CHA: 2 },
  },
];

export default SHOP_ITEMS_WITH_SPRITES;
