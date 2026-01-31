import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import './Dungeon.css';

// Timer presets in minutes
const TIMER_PRESETS = [
  { label: '15m', minutes: 15, xpReward: 30, goldReward: 15 },
  { label: '25m', minutes: 25, xpReward: 50, goldReward: 25 },
  { label: '45m', minutes: 45, xpReward: 100, goldReward: 50 },
  { label: '60m', minutes: 60, xpReward: 150, goldReward: 75 },
];

type TimerState = 'idle' | 'running' | 'paused' | 'completed';

// Colors for the parallax layers
const COLORS = {
  sky: '#1a1a2e',
  mountains: '#2d3a4a',
  trees: '#1e3320',
  ground: '#3a2a1a',
  path: '#4a3a2a',
};

// LPC Sprite Configuration
const LPC_SPRITE_CONFIG = {
  frameWidth: 64,
  frameHeight: 64,
  columns: 13,
  walkRow: 3, // Right-facing walk (row 11 in full sheet, but walk sheets are different)
  idleRow: 2, // Front-facing idle
  walkFrames: 8,
};

// Helper to get sprite paths with animation suffix
const getIdlePath = (basePath: string): string => `${basePath}/Idle.png`;
const getWalkPath = (basePath: string): string => `${basePath}/Walk.png`;

const Dungeon: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { character, isCharacterCreated } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const offsetRef = useRef(0);

  // Sprite images refs
  const idleSpritesRef = useRef<HTMLImageElement[]>([]);
  const walkSpritesRef = useRef<HTMLImageElement[]>([]);
  const spritesLoadedRef = useRef(false);
  const frameRef = useRef(0);

  // Timer state
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [selectedPreset, setSelectedPreset] = useState(TIMER_PRESETS[1]); // Default 25min
  const [timeRemaining, setTimeRemaining] = useState(selectedPreset.minutes * 60); // in seconds
  const [distance, setDistance] = useState(0); // Track distance for display
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get character sprite layers from equipment (order matters for layering)
  const characterBaseLayers = [
    character.equipment.shoes,
    character.equipment.body,
    character.equipment.pants,
    character.equipment.shirt,
    character.equipment.head,
    character.equipment.hair,
  ].filter(Boolean); // Filter out any empty paths

  const characterIdleLayers = characterBaseLayers.map(getIdlePath);
  const characterWalkLayers = characterBaseLayers.map(getWalkPath);

  // Load LPC sprites when character equipment changes
  useEffect(() => {
    const loadSprites = async () => {
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => {
            // If walk sprite fails, fall back to idle
            console.warn(`Failed to load sprite: ${src}`);
            resolve(img); // Still resolve to not break the chain
          };
          img.src = src;
        });
      };

      try {
        spritesLoadedRef.current = false;
        idleSpritesRef.current = await Promise.all(characterIdleLayers.map(loadImage));
        walkSpritesRef.current = await Promise.all(characterWalkLayers.map(loadImage));
        spritesLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to load sprites:', error);
      }
    };

    if (characterIdleLayers.length > 0) {
      loadSprites();
    }
  }, [character.equipment.body, character.equipment.head, character.equipment.hair, character.equipment.shirt, character.equipment.pants, character.equipment.shoes]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer controls
  const startTimer = useCallback(() => {
    setTimerState('running');
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState('paused');
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState('running');
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState('idle');
    setTimeRemaining(selectedPreset.minutes * 60);
  }, [selectedPreset]);

  const selectPreset = useCallback((preset: typeof TIMER_PRESETS[0]) => {
    if (timerState === 'idle') {
      setSelectedPreset(preset);
      setTimeRemaining(preset.minutes * 60);
    }
  }, [timerState]);

  // Timer tick effect
  useEffect(() => {
    if (timerState === 'running') {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer completed!
            setTimerState('completed');
            // Award XP and Gold
            dispatch({ type: 'ADD_XP', payload: { amount: selectedPreset.xpReward } });
            dispatch({ type: 'ADD_GOLD', payload: { amount: selectedPreset.goldReward } });
            dispatch({ 
              type: 'ADD_FLOATING_TEXT', 
              payload: { 
                id: `xp-${Date.now()}`,
                text: `+${selectedPreset.xpReward} XP`, 
                type: 'xp',
                x: window.innerWidth / 2,
                y: window.innerHeight / 2 - 50
              } 
            });
            setTimeout(() => {
              dispatch({ 
                type: 'ADD_FLOATING_TEXT', 
                payload: { 
                  id: `gold-${Date.now()}`,
                  text: `+${selectedPreset.goldReward} Gold`, 
                  type: 'gold',
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2
                } 
              });
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState, selectedPreset, dispatch]);

  // Redirect if no character
  useEffect(() => {
    if (!isCharacterCreated) {
      navigate('/');
    }
  }, [isCharacterCreated, navigate]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Speed based on timer state AND streak
    const isActive = timerState === 'running';
    const baseSpeed = isActive ? Math.min(2 + character.streak * 0.3, 6) : 0;

    // Animation frame
    const animate = () => {
      const { width, height } = canvas;
      
      // Clear canvas
      ctx.fillStyle = COLORS.sky;
      ctx.fillRect(0, 0, width, height);

      // Draw stars (static)
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const x = (i * 73) % width;
        const y = (i * 37) % (height * 0.3);
        const size = (i % 3) + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Layer 1: Distant Mountains (slowest)
      drawMountains(ctx, width, height, offsetRef.current * 0.1, COLORS.mountains, 0.4);

      // Layer 2: Closer Mountains
      drawMountains(ctx, width, height, offsetRef.current * 0.3, '#1e2833', 0.55);

      // Layer 3: Trees (medium speed)
      drawTrees(ctx, width, height, offsetRef.current * 0.5, COLORS.trees, 0.7);

      // Layer 4: Ground (fastest)
      drawGround(ctx, width, height, offsetRef.current, COLORS.ground);

      // Draw path
      drawPath(ctx, width, height, offsetRef.current);

      // Draw character (centered)
      drawCharacter(ctx, width, height, baseSpeed > 0);

      // Draw streak fire trail if timer running with good streak
      if (timerState === 'running' && character.streak > 2) {
        drawFireTrail(ctx, width, height, offsetRef.current);
      }

      // Update offset
      offsetRef.current += baseSpeed;
      
      // Update distance state every 60 frames (~1 second at 60fps)
      // 1km per 15 minutes at base speed: divisor = 108
      if (Math.floor(offsetRef.current) % 60 === 0) {
        setDistance(Math.floor(offsetRef.current / 108));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [character.streak, isCharacterCreated, timerState]);

  // Drawing helper functions
  const drawMountains = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number,
    color: string,
    yPos: number
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, height);

    const mountainWidth = 200;
    const startX = -(offset % mountainWidth);

    for (let x = startX; x < width + mountainWidth; x += mountainWidth / 2) {
      const peakHeight = height * yPos - Math.sin(x * 0.01) * 50;
      ctx.lineTo(x, peakHeight);
      ctx.lineTo(x + mountainWidth / 4, peakHeight + 30);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  };

  const drawTrees = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number,
    color: string,
    yPos: number
  ) => {
    ctx.fillStyle = color;
    const treeSpacing = 80;
    const startX = -(offset % treeSpacing);

    for (let x = startX; x < width + treeSpacing; x += treeSpacing) {
      const treeHeight = 60 + Math.sin(x * 0.1) * 20;
      const baseY = height * yPos;

      // Tree trunk
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(x - 5, baseY, 10, 30);

      // Tree foliage (triangle)
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, baseY - treeHeight);
      ctx.lineTo(x - 25, baseY);
      ctx.lineTo(x + 25, baseY);
      ctx.closePath();
      ctx.fill();
    }
  };

  const drawGround = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number,
    color: string
  ) => {
    const groundY = height * 0.75;
    
    // Main ground
    ctx.fillStyle = color;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Ground texture (small stones)
    ctx.fillStyle = '#2a1a0a';
    const stoneSpacing = 30;
    const startX = -(offset % stoneSpacing);

    for (let x = startX; x < width + stoneSpacing; x += stoneSpacing) {
      const stoneY = groundY + 10 + Math.sin(x * 0.2) * 5;
      const stoneSize = 3 + Math.sin(x * 0.3) * 2;
      ctx.beginPath();
      ctx.arc(x, stoneY, stoneSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawPath = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number
  ) => {
    const pathY = height * 0.82;
    
    // Path
    ctx.fillStyle = COLORS.path;
    ctx.fillRect(0, pathY - 10, width, 40);

    // Path markings (dashed lines)
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(-(offset % 40), pathY + 10);
    ctx.lineTo(width, pathY + 10);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawCharacter = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isRunning: boolean
  ) => {
    const x = width / 2;
    const baseY = height * 0.75;
    const spriteSize = LPC_SPRITE_CONFIG.frameWidth;
    const scale = 2; // Make character bigger
    const scaledSize = spriteSize * scale;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, baseY + scaledSize / 2 - 10, scaledSize / 3, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // If sprites are loaded, use LPC sprites
    if (spritesLoadedRef.current) {
      const sprites = isRunning ? walkSpritesRef.current : idleSpritesRef.current;
      const row = isRunning ? 3 : 2; // Row 3 = right facing walk, Row 2 = front facing idle
      const frames = isRunning ? LPC_SPRITE_CONFIG.walkFrames : 1;
      
      // Update frame for animation
      if (isRunning) {
        frameRef.current = Math.floor(Date.now() / 100) % frames;
      } else {
        frameRef.current = 0;
      }

      const frame = frameRef.current;
      const sx = frame * spriteSize;
      const sy = row * spriteSize;

      // Draw each layer
      sprites.forEach((sprite) => {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          sprite,
          sx, sy, spriteSize, spriteSize,
          x - scaledSize / 2, baseY - scaledSize + 20, scaledSize, scaledSize
        );
      });
    } else {
      // Fallback to simple pixel character
      const size = 40;
      const bobOffset = isRunning ? Math.sin(Date.now() * 0.01) * 5 : 0;
      const y = baseY + bobOffset;

      // Body
      ctx.fillStyle = '#e8c090';
      ctx.fillRect(x - size / 4, y - size / 2, size / 2, size / 2);

      // Head
      ctx.fillStyle = '#f5d0a9';
      ctx.fillRect(x - size / 3, y - size, size / 1.5, size / 2);

      // Eyes
      ctx.fillStyle = '#333';
      ctx.fillRect(x - size / 6, y - size + 10, 4, 4);
      ctx.fillRect(x + size / 12, y - size + 10, 4, 4);

      // Hair
      ctx.fillStyle = '#6d4e2a';
      ctx.fillRect(x - size / 3, y - size - 5, size / 1.5, 10);

      // Legs animation
      if (isRunning) {
        const legOffset = Math.sin(Date.now() * 0.02) * 5;
        ctx.fillStyle = '#4a3519';
        ctx.fillRect(x - size / 4, y, 8, 15 + legOffset);
        ctx.fillRect(x + size / 8 - 4, y, 8, 15 - legOffset);
      } else {
        ctx.fillStyle = '#4a3519';
        ctx.fillRect(x - size / 3, y - 5, size / 1.5, 10);
      }
    }
  };

  const drawFireTrail = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    offset: number
  ) => {
    const x = width / 2 - 30;
    const y = height * 0.8;

    // Fire particles
    for (let i = 0; i < 5; i++) {
      const particleX = x - i * 15 - (offset % 20);
      const particleY = y - Math.sin(Date.now() * 0.01 + i) * 10;
      const size = 8 - i;

      ctx.fillStyle = i < 2 ? '#fbf236' : i < 4 ? '#ff6b35' : '#ac3232';
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  if (!isCharacterCreated) {
    return null;
  }

  return (
    <div className="dungeon-page">
      {/* Header */}
      <header className="dungeon-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <div className="dungeon-info">
          <h1>🏰 The Dungeon</h1>
          <div className="streak-info">
            🔥 Streak: {character.streak} days
          </div>
        </div>
      </header>

      {/* Canvas */}
      <div className="dungeon-canvas-container">
        <canvas ref={canvasRef} className="dungeon-canvas" />
        
        {/* Timer Overlay */}
        <div className="timer-overlay">
          {/* Timer Display */}
          <div className={`timer-display ${timerState}`}>
            <div className="timer-time">{formatTime(timeRemaining)}</div>
            <div className="timer-label">
              {timerState === 'idle' && 'Ready to focus?'}
              {timerState === 'running' && 'Stay focused...'}
              {timerState === 'paused' && 'Paused'}
              {timerState === 'completed' && '🎉 Complete!'}
            </div>
          </div>

          {/* Preset Buttons (only when idle) */}
          {timerState === 'idle' && (
            <div className="timer-presets">
              {TIMER_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  className={`preset-btn ${selectedPreset.label === preset.label ? 'active' : ''}`}
                  onClick={() => selectPreset(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Reward Preview (when idle) */}
          {timerState === 'idle' && (
            <div className="reward-preview">
              <span className="reward-item">⭐ {selectedPreset.xpReward} XP</span>
              <span className="reward-item">💰 {selectedPreset.goldReward} Gold</span>
            </div>
          )}

          {/* Control Buttons */}
          <div className="timer-controls">
            {timerState === 'idle' && (
              <button className="timer-btn start" onClick={startTimer}>
                ▶ Start Focus
              </button>
            )}
            {timerState === 'running' && (
              <button className="timer-btn pause" onClick={pauseTimer}>
                ⏸ Pause
              </button>
            )}
            {timerState === 'paused' && (
              <>
                <button className="timer-btn resume" onClick={resumeTimer}>
                  ▶ Resume
                </button>
                <button className="timer-btn reset" onClick={resetTimer}>
                  ✕ Cancel
                </button>
              </>
            )}
            {timerState === 'completed' && (
              <button className="timer-btn reset" onClick={resetTimer}>
                🔄 New Session
              </button>
            )}
          </div>
        </div>

        {/* Status Overlay (top right) */}
        <div className="dungeon-overlay">
          {timerState !== 'running' ? (
            <div className="status-message resting">
              <span>💤</span>
              <p>Resting at camp</p>
              <small>Start a focus session!</small>
            </div>
          ) : (
            <div className="status-message running">
              <span>⚡</span>
              <p>Speed: {Math.min(2 + character.streak * 0.3, 6).toFixed(1)}x</p>
              <small>Keep focusing!</small>
            </div>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <footer className="dungeon-footer">
        <div className="dungeon-stat">
          <span className="stat-label">Distance</span>
          <span className="stat-value">
            {distance >= 1000 
              ? `${(distance / 1000).toFixed(1)} km` 
              : `${distance} m`}
          </span>
        </div>
        <div className="dungeon-stat">
          <span className="stat-label">Quests Done</span>
          <span className="stat-value">{state.quests.filter(q => q.isCompleted).length}</span>
        </div>
        <div className="dungeon-stat">
          <span className="stat-label">Level</span>
          <span className="stat-value">{character.level}</span>
        </div>
      </footer>
    </div>
  );
};

export default Dungeon;
