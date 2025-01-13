'use client';

import { useEffect } from 'react';

export default function ClientInteractionTracker() {
  useEffect(() => {
    const handleInteraction = () => {
      // Mark that the user has interacted with the site
      localStorage.setItem('userHasInteracted', 'true');

      // Remove listeners after interaction is detected
      document.removeEventListener('mousemove', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    // Add listeners for user interaction
    document.addEventListener('mousemove', handleInteraction);
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      // Cleanup listeners on unmount
      document.removeEventListener('mousemove', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return null;
}
