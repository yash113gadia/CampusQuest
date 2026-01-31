import React, { useEffect } from 'react';
import type { FloatingText } from '../../types';
import './FloatingText.css';

interface FloatingTextLayerProps {
  texts: FloatingText[];
  dispatch: React.Dispatch<any>;
}

const FloatingTextLayer: React.FC<FloatingTextLayerProps> = ({ texts, dispatch }) => {
  // Clean up floating texts after animation
  useEffect(() => {
    texts.forEach((text) => {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_FLOATING_TEXT', payload: { id: text.id } });
      }, 1000); // Match animation duration

      return () => clearTimeout(timer);
    });
  }, [texts, dispatch]);

  return (
    <div className="floating-text-layer">
      {texts.map((text) => (
        <div
          key={text.id}
          className={`floating-text floating-text-${text.type}`}
          style={{
            left: text.x,
            top: text.y,
          }}
        >
          {text.text}
        </div>
      ))}
    </div>
  );
};

export default FloatingTextLayer;
