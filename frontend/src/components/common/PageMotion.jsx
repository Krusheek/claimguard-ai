/**
 * src/components/common/PageMotion.jsx
 * Enterprise Route Transition Wrapper
 * Milestone 7: Motion Architecture & Transitions
 * Interface Contract: PROJECT.md line 46-48
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enterprise Route Transition Variants
 * initial: { opacity: 0, y: 8 }
 * animate: { opacity: 1, y: 0 }
 * exit: { opacity: 0, y: -6 }
 * transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
 */
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1], // Apple/Fintech ease curve
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.18,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * PageMotion: Clean, reusable Framer Motion wrapper for page routes.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Route component content
 * @param {string} [props.className] - Optional container className
 */
export default function PageMotion({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full min-w-0 ${className}`}
    >
      {children}
    </motion.div>
  );
}
