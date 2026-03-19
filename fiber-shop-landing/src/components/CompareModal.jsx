import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/CompareModal.module.css';

export default function CompareModal({
  isOpen,
  onClose,
  products = [],
  productTitle = '',
}) {
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortBy, setSortBy] = useState('effectivePrice');

  // Sort products based on selected criteria
  useEffect(() => {
    if (!products || products.length === 0) {
      setSortedProducts([]);
      return;
    }

    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'cashback':
          return (b.cashback_amount || 0) - (a.cashback_amount || 0);
        case 'effectivePrice':
        default:
          const aEffective = (a.price || 0) - (a.cashback_amount || 0);
          const bEffective = (b.price || 0) - (b.cashback_amount || 0);
          return aEffective - bEffective;
      }
    });

    setSortedProducts(sorted);
  }, [products, sortBy]);

  const calculateEffectivePrice = (price, cashbackAmount) => {
    return (price || 0) - (cashbackAmount || 0);
  };

  const bestDealIndex = sortedProducts.length > 0 ? 0 : -1; // Assuming first is best after sort

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modalContent}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.headerLeft}>
                <h2 className={styles.modalTitle}>⚖️ Compare Prices</h2>
                {productTitle && (
                  <p className={styles.productName}>{productTitle}</p>
                )}
              </div>
              <motion.button
                className={styles.closeButton}
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                ✕
              </motion.button>
            </div>

            {products.length === 0 ? (
              <div className={styles.emptyState}>
                <p>😕 No products to compare</p>
                <p>Add products from the results to compare prices</p>
              </div>
            ) : (
              <>
                {/* Sort Controls */}
                <div className={styles.sortControls}>
                  <label className={styles.sortLabel}>Sort by:</label>
                  <select
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="effectivePrice">💰 Best Deal (Effective Price)</option>
                    <option value="price">💲 Original Price</option>
                    <option value="cashback">🎁 Most Cashback</option>
                  </select>
                </div>

                {/* Comparison Table */}
                <div className={styles.tableContainer}>
                  <table className={styles.comparisonTable}>
                    <thead>
                      <tr>
                        <th className={styles.thMerchant}>Merchant</th>
                        <th className={styles.thPrice}>Price</th>
                        <th className={styles.thCashback}>Cashback</th>
                        <th className={styles.thEffective}>Effective Price</th>
                        <th className={styles.thAction}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProducts.map((product, idx) => {
                        const effectivePrice = calculateEffectivePrice(
                          product.price,
                          product.cashback_amount
                        );
                        const isBestDeal = idx === bestDealIndex;

                        return (
                          <motion.tr
                            key={idx}
                            className={`${styles.tableRow} ${
                              isBestDeal ? styles.bestDeal : ''
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ backgroundColor: 'rgba(0, 208, 132, 0.05)' }}
                          >
                            {/* Merchant */}
                            <td className={styles.tdMerchant}>
                              <div className={styles.merchantCell}>
                                <span className={styles.merchantName}>
                                  {product.merchant}
                                </span>
                                <div style={{ display: 'flex', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                                  {isBestDeal && (
                                    <span className={styles.bestBadge}>✅ Best</span>
                                  )}
                                  {/* Rating badge - only if real reviews exist */}
                                  {product.rating && product.reviews_count > 0 && (
                                    <span style={{
                                      fontSize: '11px',
                                      padding: '2px 6px',
                                      borderRadius: '3px',
                                      backgroundColor: 'rgba(255, 200, 0, 0.2)',
                                      color: '#ffc800',
                                    }}>
                                      ★ {product.rating.toFixed(1)} ({product.reviews_count})
                                    </span>
                                  )}
                                  {product.source && (
                                    <span style={{
                                      fontSize: '11px',
                                      padding: '2px 6px',
                                      borderRadius: '3px',
                                      backgroundColor: product.source === 'fiber' ? 'rgba(0, 208, 132, 0.2)' : 'rgba(100, 200, 255, 0.2)',
                                      color: product.source === 'fiber' ? '#00d084' : '#64c8ff',
                                    }}>
                                      {product.source === 'fiber' ? '🔗 Fiber' : product.source === 'shopify' ? '🛒 Shopify' : '📌 Pinterest'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className={styles.tdPrice}>
                              <span className={styles.priceValue}>
                                ${(product.price || 0).toFixed(2)}
                              </span>
                            </td>

                            {/* Cashback */}
                            <td className={styles.tdCashback}>
                              <div className={styles.cashbackCell}>
                                <span className={styles.cashbackRate}>
                                  {(product.cashback_rate * 100 || 0).toFixed(1)}%
                                </span>
                                <span className={styles.cashbackAmount}>
                                  +${(product.cashback_amount || 0).toFixed(2)}
                                </span>
                              </div>
                            </td>

                            {/* Effective Price */}
                            <td className={styles.tdEffective}>
                              <span
                                className={`${styles.effectivePrice} ${
                                  isBestDeal ? styles.bestPrice : ''
                                }`}
                              >
                                ${effectivePrice.toFixed(2)}
                              </span>
                            </td>

                            {/* Action */}
                            <td className={styles.tdAction}>
                              {product.affiliate_link ? (
                                <motion.a
                                  href={product.affiliate_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.btnShop}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Visit
                                </motion.a>
                              ) : (
                                <button
                                  className={styles.btnShop}
                                  disabled
                                  style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                >
                                  ⏳
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary Stats */}
                <div className={styles.summaryStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Price Range:</span>
                    <span className={styles.statValue}>
                      ${Math.min(...sortedProducts.map(p => p.price || 0)).toFixed(2)} —{' '}
                      ${Math.max(...sortedProducts.map(p => p.price || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Total Cashback Available:</span>
                    <span className={styles.statValue}>
                      ${(sortedProducts.reduce((sum, p) => sum + (p.cashback_amount || 0), 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Best Deal Savings:</span>
                    <span className={`${styles.statValue} ${styles.highlight}`}>
                      ${(Math.max(...sortedProducts.map(p => (p.price || 0) - (p.cashback_amount || 0))) -
                        Math.min(...sortedProducts.map(p => (p.price || 0) - (p.cashback_amount || 0)))).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className={styles.modalFooter}>
                  <motion.button
                    className={styles.btnSecondary}
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close Comparison
                  </motion.button>
                  {sortedProducts[0]?.affiliate_link && (
                    <motion.a
                      href={sortedProducts[0].affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnPrimary}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🛒 Shop at Best Price
                    </motion.a>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
