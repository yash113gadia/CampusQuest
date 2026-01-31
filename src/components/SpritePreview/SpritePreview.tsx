import React from 'react';
import './SpritePreview.css';

interface SpritePreviewProps {
  spritePath: string;
  size?: number;
  frame?: number;
  direction?: 'down' | 'left' | 'right' | 'up';
  className?: string;
}

// LPC Idle sprite sheets are 192x256 (3 columns x 4 rows, 64x64 frames)
// Rows: 0=up, 1=left, 2=down, 3=right
const FRAME_SIZE = 64;
const IDLE_SHEET_WIDTH = 192;
const IDLE_SHEET_HEIGHT = 256;
const IDLE_COLUMNS = 3;

const DIRECTION_ROWS: Record<string, number> = {
  up: 0,
  left: 1,
  down: 2,
  right: 3,
};

const SpritePreview: React.FC<SpritePreviewProps> = ({
  spritePath,
  size = 64,
  frame = 0,
  direction = 'down',
  className = '',
}) => {
  const row = DIRECTION_ROWS[direction];
  const col = frame % IDLE_COLUMNS;
  const xOffset = col * FRAME_SIZE;
  const yOffset = row * FRAME_SIZE;

  // Scale the background size proportionally
  const scale = size / FRAME_SIZE;
  const bgWidth = IDLE_SHEET_WIDTH * scale;
  const bgHeight = IDLE_SHEET_HEIGHT * scale;

  return (
    <div 
      className={`sprite-preview ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url("${spritePath}")`,
        backgroundPosition: `-${xOffset * scale}px -${yOffset * scale}px`,
        backgroundSize: `${bgWidth}px ${bgHeight}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
      }}
    />
  );
};

export default SpritePreview;
