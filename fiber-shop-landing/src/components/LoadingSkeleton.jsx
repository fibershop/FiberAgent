import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/LoadingSkeleton.module.css';

export default function LoadingSkeleton({ count = 3, type = 'product' }) {
  if (type === 'product') {
    return (
      <div className={styles.skeletonGrid}>
        {Array.from({ length: count }).map((_, idx) => (
          <motion.div
            key={idx}
            className={styles.skeletonCard}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonPrice} />
            <div className={styles.skeletonCashback} />
            <div className={styles.skeletonButton} />
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'filter') {
    return (
      <div className={styles.skeletonFilters}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <motion.div
            key={idx}
            className={styles.skeletonFilterChip}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
          />
        ))}
      </div>
    );
  }

  return null;
}
