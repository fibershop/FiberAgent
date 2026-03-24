import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/SuggestionCard.module.css';

export default function SuggestionCard({
  title,
  image,
  description,
  searchQuery,
  onSelect,
}) {
  return (
    <motion.button
      className={styles.suggestionCard}
      onClick={() => onSelect?.(searchQuery)}
      whileHover={{ scale: 1.05, shadow: '0 8px 20px rgba(100, 255, 218, 0.3)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.cardImage}>{image}</div>
      <div className={styles.cardContent}>
        <h4 className={styles.cardTitle}>{title}</h4>
        <p className={styles.cardDescription}>{description}</p>
      </div>
      <div className={styles.cardArrow}>→</div>
    </motion.button>
  );
}
