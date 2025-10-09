import { useState, useEffect } from 'react';

export function useMobilePortrait() {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Condition is true if the screen is taller than it is wide (portrait)
      // AND the screen width is less than a typical tablet (e.g., 1024px).
      const isPortrait = window.innerHeight > window.innerWidth;
      const isMobile = window.innerWidth < 1024; 
      setIsMobilePortrait(isPortrait && isMobile);
    };

    // Check on initial load and whenever the window is resized
    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    
    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  return isMobilePortrait;
}