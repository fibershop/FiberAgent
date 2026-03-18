import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import styles from '../styles/ChatPage.module.css';
import ProductCard from '../components/ProductCard';
import FilterChips from '../components/FilterChips';
import CompareModal from '../components/CompareModal';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useBookmarks } from '../hooks/useBookmarks';

export default function ChatPage() {
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmarks();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      text: '👋 Hi! I\'m your FiberAgent shopping assistant. Tell me what you want to buy, and I\'ll find the best deals with cashback rewards.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(!localStorage.getItem('fiberagent_disclaimer_accepted'));
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareProducts, setCompareProducts] = useState([]);
  const [compareTitle, setCompareTitle] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [lastFilteredMessageId, setLastFilteredMessageId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [imageErrors, setImageErrors] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleConnectWallet = () => {
    // Placeholder for wallet connection
    setWalletConnected(true);
    addMessage('assistant', '✅ Wallet connected! You\'re ready to earn cashback. What product are you looking for?');
  };

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('fiberagent_disclaimer_accepted', 'true');
    setShowDisclaimer(false);
  };

  const addMessage = (type, text, products = null) => {
    const newMessage = {
      id: messages.length + 1,
      type,
      text,
      products,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);
    setError(null);

    // Add user message to state
    const newUserMessage = {
      id: messages.length + 1,
      type: 'user',
      text: userMessage,
      timestamp: new Date(),
    };
    setMessages([...messages, newUserMessage]);

    try {
      // Build conversation history including the message we just added
      const conversationHistory = [
        ...messages.map(m => ({
          type: m.type,
          text: m.text,
        })),
        {
          type: 'user',
          text: userMessage,
        },
      ];

      // Set a timeout for API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Call conversational chat API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(res.statusText || 'API request failed');
      }

      const data = await res.json();

      if (!data.success) {
        const errorMsg = data.error || 'Unknown error';
        const errorType = errorMsg.includes('overload') ? 'timeout' : 'error';
        const friendlyError = errorMsg.includes('overload') 
          ? '⏳ Taking longer than expected. Retrying...'
          : `🌐 Couldn't load products. Try again?`;
        
        setError({
          type: errorType,
          message: friendlyError,
          originalError: errorMsg,
        });

        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            type: 'assistant',
            text: friendlyError,
            error: true,
            timestamp: new Date(),
          },
        ]);
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
        return;
      }

      // Transform product results to cards
      const products = (data.products || []).map((p, idx) => ({
        id: p.id || `product_${idx}`,
        title: p.title || p.merchant || 'Unknown Product',
        price: p.price || 0,
        cashback_rate: (p.cashback_rate || parseFloat(p.cashback || 0) / 100),
        cashback_amount: p.cashback_amount || 0,
        merchant: p.merchant || p.domain || 'Unknown Merchant',
        image: p.image_url || p.image || '🛍️',
        affiliate_link: p.affiliate_link,
        rating: p.rating || null,
        reviews_count: p.reviews_count || 0,
        availability: p.availability || null,
      })) || [];

      // Extract filters and trending from API if available
      const availableFilters = data.available_filters || {
        priceRanges: [],
        categories: [],
        ratings: [],
        availability: [],
        cashbackRates: [],
      };
      const trending = data.trending || [];

      // Add Claude's response with products, filters, and trending
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          type: 'assistant',
          text: data.response || 'Here are the products I found:',
          products: products.length > 0 ? products : null,
          availableFilters: Object.keys(availableFilters).length > 0 ? availableFilters : null,
          trending: trending.length > 0 ? trending : null,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      const isTimeout = err.name === 'AbortError';
      const errorMsg = isTimeout ? '⏳ Request timed out. Please try again.' : `🌐 Network error: ${err.message}`;
      
      setError({
        type: isTimeout ? 'timeout' : 'network',
        message: errorMsg,
        originalError: err.message,
      });

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          type: 'assistant',
          text: errorMsg,
          error: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      // Auto-focus input for next message
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFilterClick = (filters) => {
    setSelectedFilters(filters);
    
    // Build filter query string
    const filterParts = [];
    Object.entries(filters).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        filterParts.push(`${key}: ${values.join(', ')}`);
      } else if (typeof values === 'string') {
        filterParts.push(`${values}`);
      }
    });

    const filterQuery = filterParts.length > 0 
      ? `Show me products with ${filterParts.join(' and ')}`
      : 'Show me more options';

    // Auto-send the filter query
    setInput(filterQuery);
    setLastFilteredMessageId(messages[messages.length - 1]?.id);
    setTimeout(() => {
      // Trigger send programmatically
      handleSendMessage.call({ currentQuery: filterQuery });
    }, 100);
  };

  const handleBookmarkClick = (product) => {
    toggleBookmark(product);
  };

  const handleMoreLikeThis = (productTitle, merchant) => {
    const query = `Show me more products like "${productTitle}" from ${merchant}`;
    setInput(query);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCompare = (productId, productTitle, price, merchant) => {
    // In a real scenario, you'd fetch comparison data from API
    // For now, we'll collect products for comparison
    const currentProduct = {
      id: productId,
      title: productTitle,
      price,
      merchant,
    };

    setCompareTitle(productTitle);
    
    // Find all products with same title from current messages
    const allProducts = [];
    messages.forEach(msg => {
      if (msg.products) {
        allProducts.push(...msg.products);
      }
    });

    const productsToCompare = allProducts.filter(p => 
      p.title?.toLowerCase().includes(productTitle.toLowerCase()) || 
      p.title === productTitle
    );

    setCompareProducts(productsToCompare.slice(0, 4)); // Limit to 4
    setShowCompareModal(true);
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <>
      <Helmet>
        <title>FiberAgent Chat — AI Shopping Assistant</title>
        <meta name="description" content="Chat with an AI to find products with cashback rewards across 50,000+ merchants." />
        <meta property="og:url" content="https://fiberagent.shop/chat" />
      </Helmet>

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <motion.div
          className={styles.disclaimerOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.disclaimerModal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <div className={styles.disclaimerHeader}>
              <h2>⚠️ Important Disclaimer</h2>
              <p>Please read before using FiberAgent Chat</p>
            </div>

            <div className={styles.disclaimerContent}>
              <div className={styles.disclaimerItem}>
                <strong>🛍️ Shopping Only</strong>
                <p>This AI only helps find products with cashback rewards. It cannot help with homework, medical advice, legal advice, or anything else.</p>
              </div>

              <div className={styles.disclaimerItem}>
                <strong>⚡ No Liability</strong>
                <p>FiberAgent is not responsible for incorrect product information, cashback not being paid, or merchant issues. Use recommendations at your own risk.</p>
              </div>

              <div className={styles.disclaimerItem}>
                <strong>💰 Cashback Not Guaranteed</strong>
                <p>Cashback rates and availability are subject to change. Actual earnings depend on merchant policies and purchase completion.</p>
              </div>

              <div className={styles.disclaimerItem}>
                <strong>📋 Terms Apply</strong>
                <p>By using FiberAgent Chat, you agree to our Terms of Service and accept these limitations.</p>
              </div>
            </div>

            <div className={styles.disclaimerActions}>
              <button className={styles.btnAccept} onClick={handleAcceptDisclaimer}>
                I Understand & Accept
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className={styles.chatPage}>
        {/* Header */}
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>🤖 FiberAgent Chat</h1>
              <p className={styles.subtitle}>Find products with cashback. Talk naturally.</p>
            </div>
            {!walletConnected && (
              <motion.button
                className={styles.btnConnect}
                onClick={handleConnectWallet}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔗 Connect Wallet
              </motion.button>
            )}
            {walletConnected && (
              <div className={styles.walletStatus}>
                <span className={styles.statusDot}>●</span>
                Wallet Connected
              </div>
            )}
          </div>
        </motion.header>

        {/* Chat Container */}
        <div className={styles.chatContainer}>
          {/* Messages */}
          <div className={styles.messagesArea}>
            {/* Error Display */}
            {error && (
              <ErrorMessage
                type={error.type}
                title={error.type === 'timeout' ? 'Taking Too Long' : 'Oops!'}
                message={error.message}
                onRetry={handleRetry}
                onDismiss={() => setError(null)}
              />
            )}

            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                className={`${styles.message} ${styles[message.type === 'user' ? 'messageUser' : 'messageAssistant']}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div className={styles.messageBubble}>
                  <p className={styles.messageText}>{message.text}</p>

                  {/* Products Grid */}
                  {message.products && message.products.length > 0 && (
                    <div className={styles.productsGrid}>
                      {message.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          title={product.title}
                          price={product.price}
                          image={product.image}
                          merchant={product.merchant}
                          cashback_rate={product.cashback_rate}
                          cashback_amount={product.cashback_amount}
                          rating={product.rating}
                          reviews_count={product.reviews_count}
                          availability={product.availability}
                          affiliate_link={product.affiliate_link}
                          isBookmarked={isBookmarked(product.id)}
                          onBookmark={handleBookmarkClick}
                          onMoreLikeThis={handleMoreLikeThis}
                          onCompare={handleCompare}
                        />
                      ))}
                    </div>
                  )}

                  {/* Filter Chips */}
                  {message.availableFilters && (
                    <div className={styles.filterSection}>
                      <FilterChips
                        availableFilters={message.availableFilters}
                        onFiltersChange={handleFilterClick}
                        selectedFilters={selectedFilters}
                        trending={message.trending}
                      />
                    </div>
                  )}

                  <span className={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                className={`${styles.message} ${styles.messageAssistant}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className={styles.messageBubble}>
                  <p className={styles.messageText}>🔍 Finding the best products for you...</p>
                  <LoadingSkeleton count={2} type="product" />
                  <div className={styles.loadingDots}>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                    <span className={styles.dot}></span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <div className={styles.inputWrapper}>
              <textarea
                ref={inputRef}
                className={styles.input}
                placeholder="Ask me anything about shopping... e.g., 'Find me gaming laptop under $2000'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                rows={3}
                autoFocus
              />
              <motion.button
                className={`${styles.btnSend} ${loading ? styles.btnDisabled : ''}`}
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                {loading ? '⏳' : '📤 Send'}
              </motion.button>
            </div>

            <p className={styles.inputHint}>
              💡 Try asking: "Best gaming laptop under $2000" or "Show me Nike shoes with cashback"
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>
            <span className={styles.footerBrand}>FiberAgent Chat</span> — 50,000+ merchants | Real cashback rewards
          </p>
          <p style={{ marginTop: 8, fontSize: 12, color: 'rgba(255, 255, 255, 0.4)' }}>
            Shopping only. See disclaimer for limitations.
          </p>
        </footer>
      </div>

      {/* Compare Modal */}
      <CompareModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        products={compareProducts}
        productTitle={compareTitle}
      />
    </>
  );
}
