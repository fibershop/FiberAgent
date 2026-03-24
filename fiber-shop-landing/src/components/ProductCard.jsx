import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/ProductCard.module.css';

export default function ProductCard({
  id,
  title,
  price,
  image,
  merchant,
  cashback_rate,
  cashback_amount,
  rating,
  reviews_count,
  availability,
  affiliate_link,
  onMoreLikeThis,
  onCompare,
  onBookmark,
  isBookmarked = false,
}) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);

  const handleBookmarkClick = () => {
    setLocalBookmarked(!localBookmarked);
    onBookmark?.(id, !localBookmarked);
  };

  const handleMoreLikeThis = () => {
    onMoreLikeThis?.(title, merchant);
  };

  const handleCompare = () => {
    onCompare?.(id, title, price, merchant);
  };

  const renderImage = () => {
    if (typeof image === 'string' && image.startsWith('http') && !imageError) {
      return (
        <img
          src={image}
          alt={title}
          className={styles.cardImage}
          onError={() => setImageError(true)}
        />
      );
    }
    return (
      <div className={styles.imageFallback}>
        {typeof image === 'string' && !image.startsWith('http') ? image : '🛍️'}
      </div>
    );
  };

  return (
    <motion.div
      className={styles.productCard}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Card Header with Bookmark */}
      <div className={styles.cardHeader}>
        <motion.button
          className={`${styles.bookmarkBtn} ${localBookmarked ? styles.bookmarked : ''}`}
          onClick={handleBookmarkClick}
          whileTap={{ scale: 0.9 }}
          title={localBookmarked ? 'Remove bookmark' : 'Bookmark this product'}
        >
          {localBookmarked ? '❤️' : '🤍'}
        </motion.button>
        {availability && (
          <div className={`${styles.availabilityBadge} ${availability === 'in_stock' ? styles.inStock : styles.outOfStock}`}>
            {availability === 'in_stock' ? '✓ In Stock' : 'Out of Stock'}
          </div>
        )}
      </div>

      {/* Image Container */}
      <div className={styles.imageContainer}>
        {renderImage()}
      </div>

      {/* Product Info */}
      <div className={styles.productInfo}>
        <h3 className={styles.productTitle}>{title}</h3>

        {/* Rating - Only show if we have a real rating (not fake/fallback) */}
        {rating && rating > 0 && reviews_count > 0 && (
          <div className={styles.ratingContainer}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(rating) ? styles.filledStar : styles.emptyStar}>
                  ★
                </span>
              ))}
            </div>
            <span className={styles.ratingText}>
              {rating.toFixed(1)} ({reviews_count})
            </span>
          </div>
        )}

        {/* Merchant */}
        <div className={styles.merchant}>
          <span className={styles.merchantLabel}>Via:</span>
          <span className={styles.merchantName}>{merchant}</span>
        </div>

        {/* Price Section */}
        {price && (
          <div className={styles.priceSection}>
            <div className={styles.price}>
              {typeof price === 'number' ? `$${price.toLocaleString()}` : price}
            </div>
          </div>
        )}

        {/* Cashback Highlight - Handle 0% case */}
        <motion.div
          className={styles.cashbackHighlight}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.cashbackBadge}>
            {cashback_rate > 0 ? (
              <>
                <span className={styles.cashbackEmoji}>💰</span>
                <span className={styles.cashbackText}>
                  Earn {(cashback_rate * 100).toFixed(1)}%
                  {cashback_amount > 0 && ` ($${cashback_amount.toFixed(2)})`}
                </span>
              </>
            ) : (
              <>
                <span className={styles.cashbackEmoji}>💳</span>
                <span className={styles.cashbackText}>Best price — no cashback</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {affiliate_link ? (
            <motion.a
              href={affiliate_link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnShopNow}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🛒 Shop Now
            </motion.a>
          ) : (
            <button className={styles.btnShopNow} disabled style={{ opacity: 0.5 }}>
              ⏳ Loading...
            </button>
          )}

          {/* Secondary Actions */}
          <motion.button
            className={styles.btnSecondary}
            onClick={handleMoreLikeThis}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Find more products like this"
          >
            🔍 More Like This
          </motion.button>

          {onCompare && (
            <motion.button
              className={styles.btnSecondary}
              onClick={handleCompare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Compare prices across stores"
            >
              ⚖️ Compare
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
