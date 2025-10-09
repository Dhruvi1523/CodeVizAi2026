import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobilePortrait } from '../hooks/useMobilePortrait';
import OrientationLock from '../components/OrientationLock'; // The overlay component

export default function LandscapeLayout({ children }) {
  const isMobilePortrait = useMobilePortrait();

  return (
    <>
      <AnimatePresence>
        {isMobilePortrait && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <OrientationLock />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* This renders the actual page content */}
      {children}
    </>
  );
}