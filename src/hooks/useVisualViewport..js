// src/hooks/useVisualViewport.js
import { useState, useEffect } from 'react';

export default function useVisualViewport() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    offsetTop: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewport({
          width: window.visualViewport.width,
          height: window.visualViewport.height,
          offsetTop: window.visualViewport.offsetTop,
        });
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      handleResize(); // Initial call
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, []);

  return viewport;
}