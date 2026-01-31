import React, { useEffect, useState } from 'react';
import './AvatarStage.css';

interface Equipment {
  body: string;
  head: string;
  shirt: string;
  pants: string;
  shoes: string;
  hair: string;
}

interface AvatarStageProps {
  equipment?: Equipment;
  action?: 'idle' | 'walk' | 'attack' | 'hurt' | 'victory' | 'sit';
  size?: number;
}

// LPC sprite sheet config
const SPRITE_CONFIG = {
  frameWidth: 64,
  frameHeight: 64,
  animations: {
    idle: { row: 2, frames: 1, spriteSheet: 'Idle.png' },
    walk: { row: 2, frames: 8, spriteSheet: 'Walk.png' },
    attack: { row: 2, frames: 6, spriteSheet: 'Combat 1h - Slash.png' },
    hurt: { row: 2, frames: 1, spriteSheet: 'Idle.png' },
    victory: { row: 2, frames: 1, spriteSheet: 'Idle.png' },
    sit: { row: 2, frames: 1, spriteSheet: 'Sitting.png' },
  },
};

// Default asset paths for full character
const DEFAULT_PATHS = {
  body: '/assets-lpc/Characters/Body/Body 02 - Masculine, Thin/Peach',
  head: '/assets-lpc/Characters/Head/Head 02 - Masculine/Peach',
  hair: '/assets-lpc/Characters/Hair/Short 02 - Parted/Brown',
  shirt: '/assets-lpc/Characters/Clothing/Masculine, Thin/Torso/Shirt 04 - T-shirt/White',
  pants: '/assets-lpc/Characters/Clothing/Masculine, Thin/Legs/Pants 03 - Pants',
  shoes: '/assets-lpc/Characters/Clothing/Masculine, Thin/Feet/Shoes 01 - Shoes',
};

const AvatarStage: React.FC<AvatarStageProps> = ({
  equipment,
  action = 'idle',
  size = 128,
}) => {
  const [frame, setFrame] = useState(0);
  const animConfig = SPRITE_CONFIG.animations[action];

  // Use equipped paths or defaults
  const bodyPath = equipment?.body || DEFAULT_PATHS.body;
  const headPath = equipment?.head || DEFAULT_PATHS.head;
  const shirtPath = equipment?.shirt || DEFAULT_PATHS.shirt;
  const pantsPath = equipment?.pants || DEFAULT_PATHS.pants;
  const shoesPath = equipment?.shoes || DEFAULT_PATHS.shoes;
  const hairPath = equipment?.hair || DEFAULT_PATHS.hair;
  
  // Animation loop
  useEffect(() => {
    if (animConfig.frames <= 1) {
      setFrame(0);
      return;
    }
    
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % animConfig.frames);
    }, 150);
    
    return () => clearInterval(interval);
  }, [action, animConfig.frames]);

  const scale = size / SPRITE_CONFIG.frameWidth;
  const spriteSheet = animConfig.spriteSheet;

  // Build layer URLs (order matters - bottom to top)
  const layers = [
    `${shoesPath}/${spriteSheet}`,   // Shoes (bottom)
    `${bodyPath}/${spriteSheet}`,    // Body
    `${pantsPath}/${spriteSheet}`,   // Pants
    `${shirtPath}/${spriteSheet}`,   // Shirt
    `${headPath}/${spriteSheet}`,    // Head
    `${hairPath}/${spriteSheet}`,    // Hair (top)
  ];

  const spriteStyle = {
    width: SPRITE_CONFIG.frameWidth,
    height: SPRITE_CONFIG.frameHeight,
    backgroundPosition: `-${frame * SPRITE_CONFIG.frameWidth}px -${animConfig.row * SPRITE_CONFIG.frameHeight}px`,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated' as const,
    position: 'absolute' as const,
    top: 0,
    left: 0,
  };

  return (
    <div 
      className="avatar-stage"
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Layered character sprite using LPC assets */}
      <div
        style={{
          position: 'relative',
          width: SPRITE_CONFIG.frameWidth,
          height: SPRITE_CONFIG.frameHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center',
        }}
      >
        {layers.map((layerUrl, index) => (
          <div 
            key={index}
            className={`avatar-sprite avatar-${action}`}
            style={{
              ...spriteStyle,
              backgroundImage: `url("${layerUrl}")`,
              zIndex: index,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AvatarStage;
