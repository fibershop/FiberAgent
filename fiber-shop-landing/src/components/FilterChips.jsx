import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/FilterChips.module.css';

export default function FilterChips({
  availableFilters = {
    priceRanges: [],
    categories: [],
    ratings: [],
    availability: [],
    cashbackRates: [],
  },
  onFiltersChange,
  selectedFilters = {},
  trending = [],
}) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [selectedChips, setSelectedChips] = useState(selectedFilters);

  const handleChipClick = (category, value) => {
    setSelectedChips(prev => {
      const updated = { ...prev };
      if (!updated[category]) {
        updated[category] = [];
      }

      const index = updated[category].indexOf(value);
      if (index > -1) {
        updated[category].splice(index, 1);
      } else {
        updated[category].push(value);
      }

      if (updated[category].length === 0) {
        delete updated[category];
      }

      onFiltersChange?.(updated);
      return updated;
    });
  };

  const handleClearAll = () => {
    setSelectedChips({});
    onFiltersChange?.({});
  };

  const isChipSelected = (category, value) => {
    return selectedChips[category]?.includes(value) || false;
  };

  const renderFilterGroup = (title, category, items, icon) => {
    if (!items || items.length === 0) return null;

    const isExpanded = expandedCategory === category;
    const selectedCount = selectedChips[category]?.length || 0;

    return (
      <div key={category} className={styles.filterGroup}>
        <motion.button
          className={`${styles.groupHeader} ${isExpanded ? styles.expanded : ''}`}
          onClick={() => setExpandedCategory(isExpanded ? null : category)}
          whileHover={{ paddingLeft: 12 }}
        >
          <span className={styles.groupIcon}>{icon}</span>
          <span className={styles.groupTitle}>{title}</span>
          {selectedCount > 0 && (
            <span className={styles.selectedBadge}>{selectedCount}</span>
          )}
          <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className={styles.filterOptions}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {items.map((item) => {
                const value = item.value || item;
                const label = item.label || item;
                const count = item.count || 0;

                return (
                  <motion.button
                    key={value}
                    className={`${styles.filterChip} ${
                      isChipSelected(category, value) ? styles.selected : ''
                    }`}
                    onClick={() => handleChipClick(category, value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={styles.chipLabel}>{label}</span>
                    {count > 0 && <span className={styles.chipCount}>{count}</span>}
                    {isChipSelected(category, value) && (
                      <span className={styles.checkmark}>✓</span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const hasActiveFilters = Object.keys(selectedChips).length > 0;

  return (
    <div className={styles.filterChipsContainer}>
      {/* Filter Summary */}
      <div className={styles.filterSummary}>
        <h3 className={styles.summaryTitle}>Refine Your Search</h3>
        {hasActiveFilters && (
          <motion.button
            className={styles.clearButton}
            onClick={handleClearAll}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✕ Clear All
          </motion.button>
        )}
      </div>

      {/* Trending Products (if provided) */}
      {trending && trending.length > 0 && (
        <div className={styles.trendingSection}>
          <div className={styles.trendingHeader}>
            <span className={styles.trendingIcon}>🔥</span>
            <span className={styles.trendingTitle}>Trending Now</span>
          </div>
          <div className={styles.trendingChips}>
            {trending.map((item, idx) => (
              <motion.button
                key={idx}
                className={styles.trendingChip}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onFiltersChange?.({ trending: item })}
              >
                {item}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Groups */}
      <div className={styles.filterGroups}>
        {renderFilterGroup(
          'Price Range',
          'priceRanges',
          availableFilters.priceRanges,
          '💲'
        )}

        {renderFilterGroup(
          'Category',
          'categories',
          availableFilters.categories,
          '🏷️'
        )}

        {renderFilterGroup(
          'Rating',
          'ratings',
          availableFilters.ratings,
          '⭐'
        )}

        {renderFilterGroup(
          'Availability',
          'availability',
          availableFilters.availability,
          '📦'
        )}

        {renderFilterGroup(
          'Cashback Rate',
          'cashbackRates',
          availableFilters.cashbackRates,
          '💰'
        )}
      </div>

      {/* Applied Filters Display */}
      {hasActiveFilters && (
        <div className={styles.appliedFilters}>
          <p className={styles.appliedLabel}>Active Filters:</p>
          <div className={styles.appliedChips}>
            {Object.entries(selectedChips).map(([category, values]) =>
              values.map((value) => (
                <motion.div
                  key={`${category}-${value}`}
                  className={styles.appliedChip}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <span>{value}</span>
                  <button
                    className={styles.removeChip}
                    onClick={() => handleChipClick(category, value)}
                  >
                    ✕
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
