import React from 'react';
import type { CharacterStats } from '../../types';
import './StatsHexagon.css';

interface StatsHexagonProps {
  stats: CharacterStats;
  size?: number;
  maxStat?: number;
}

const StatsHexagon: React.FC<StatsHexagonProps> = ({ 
  stats, 
  size = 200,
  maxStat = 20 
}) => {
  const center = size / 2;
  const radius = size * 0.4;
  
  // Convert stats to normalized values (0-1)
  const normalizedStats = {
    STR: Math.min(stats.STR / maxStat, 1),
    INT: Math.min(stats.INT / maxStat, 1),
    CHA: Math.min(stats.CHA / maxStat, 1),
    VIT: Math.min(stats.VIT / maxStat, 1),
    WIS: Math.min(stats.WIS / maxStat, 1),
    AGI: Math.min(stats.AGI / maxStat, 1),
  };

  // Calculate hexagon points (6 vertices)
  const statOrder: (keyof CharacterStats)[] = ['STR', 'INT', 'WIS', 'CHA', 'VIT', 'AGI'];
  
  const getPoint = (index: number, value: number = 1) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    const r = radius * value;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate outer hexagon points (background)
  const outerPoints = statOrder.map((_, i) => getPoint(i, 1));
  const outerPath = outerPoints.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // Generate stat hexagon points (filled based on stats)
  const statPoints = statOrder.map((stat, i) => getPoint(i, normalizedStats[stat]));
  const statPath = statPoints.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // Generate grid lines
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg 
      className="stats-hexagon" 
      width={size} 
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      <defs>
        {/* Gradient for stat fill */}
        <linearGradient id="statGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-mana-blue)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--color-xp-green)" stopOpacity="0.6" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {gridLevels.map((level, levelIndex) => {
        const points = statOrder.map((_, i) => getPoint(i, level));
        const path = points.map((p, i) => 
          `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ') + ' Z';
        return (
          <path
            key={levelIndex}
            d={path}
            className="hexagon-grid"
            strokeOpacity={0.2 + levelIndex * 0.1}
          />
        );
      })}

      {/* Axis lines */}
      {statOrder.map((_, i) => {
        const outerPoint = getPoint(i, 1);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={outerPoint.x}
            y2={outerPoint.y}
            className="hexagon-axis"
          />
        );
      })}

      {/* Outer hexagon border */}
      <path
        d={outerPath}
        className="hexagon-border"
      />

      {/* Stat fill */}
      <path
        d={statPath}
        className="hexagon-stats"
        fill="url(#statGradient)"
        filter="url(#glow)"
      />

      {/* Stat points (vertices) */}
      {statPoints.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={4}
          className="hexagon-point"
        />
      ))}

      {/* Stat labels */}
      {statOrder.map((stat, i) => {
        const labelPoint = getPoint(i, 1.2);
        return (
          <text
            key={stat}
            x={labelPoint.x}
            y={labelPoint.y}
            className="hexagon-label"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {stat}
          </text>
        );
      })}
    </svg>
  );
};

export default StatsHexagon;
