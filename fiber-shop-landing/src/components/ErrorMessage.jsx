import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/ErrorMessage.module.css';

export default function ErrorMessage({
  type = 'error',
  title = 'Error',
  message = 'Something went wrong',
  onRetry = null,
  onDismiss = null,
  emoji = '❌',
}) {
  const iconMap = {
    error: '❌',
    network: '🌐',
    timeout: '⏳',
    empty: '😕',
    warning: '⚠️',
  };

  const displayEmoji = emoji || iconMap[type] || '❌';

  return (
    <motion.div
      className={`${styles.errorMessage} ${styles[type]}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.errorContent}>
        <span className={styles.errorEmoji}>{displayEmoji}</span>
        <div className={styles.errorText}>
          <h3 className={styles.errorTitle}>{title}</h3>
          <p className={styles.errorDescription}>{message}</p>
        </div>
      </div>

      {(onRetry || onDismiss) && (
        <div className={styles.errorActions}>
          {onRetry && (
            <motion.button
              className={styles.btnRetry}
              onClick={onRetry}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Try Again
            </motion.button>
          )}
          {onDismiss && (
            <motion.button
              className={styles.btnDismiss}
              onClick={onDismiss}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✕ Dismiss
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}
