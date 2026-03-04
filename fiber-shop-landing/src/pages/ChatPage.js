import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import styles from '../styles/ChatPage.module.css';

export default function ChatPage() {
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
  const [walletConnected, setWalletConnected] = useState(true); // Enable by default for testing
  const [showDisclaimer, setShowDisclaimer] = useState(!localStorage.getItem('fiberagent_disclaimer_accepted'));
  const messagesEndRef = useRef(null);

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

    // Add user message
    addMessage('user', input);
    const searchQuery = input;
    setInput('');
    setLoading(true);

    try {
      // Call real backend API using verified test agent
      const res = await fetch('/api/fiber-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'agent/search',
          queryParams: { keywords: searchQuery, agent_id: 'agent_c56b31fd2bd952ed214c7452', limit: 6 }
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        addMessage('assistant', `❌ Search failed: ${data.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      // Transform Fiber API response to product cards
      const products = data.results?.slice(0, 6).map(m => {
        // Fiber returns merchant data with cashback object
        const cashbackDisplay = m.cashback?.display || '5%';
        const cashbackPercent = parseFloat(cashbackDisplay) || 5;
        
        return {
          title: m.merchant_name || 'Shop',
          price: m.price ? `$${m.price}` : 'View Store',
          cashback_rate: cashbackPercent / 100,
          cashback_amount: m.cashback_amount || 0,
          merchant: m.merchant_domain || m.merchant_name,
          image: m.image_url ? m.image_url : '🛍️',
          affiliate_link: m.affiliate_link,
        };
      }) || [];

      if (products.length === 0) {
        addMessage('assistant', `Sorry, no products found for "${searchQuery}". Try different keywords!`);
      } else {
        const responseText = `Found ${data.results_count || products.length} merchants with "${searchQuery}":\n\n`;
        addMessage('assistant', responseText, products);
      }
    } catch (err) {
      addMessage('assistant', `❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
                  {message.products && (
                    <div className={styles.productsGrid}>
                      {message.products.map((product, pidx) => (
                        <motion.div
                          key={pidx}
                          className={styles.productCard}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: pidx * 0.1 }}
                        >
                          <div className={styles.productImage}>
                            {typeof product.image === 'string' && product.image.startsWith('http') ? (
                              <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              product.image
                            )}
                          </div>

                          <div className={styles.productDetails}>
                            <div className={styles.productTitle}>{product.title}</div>

                            <div className={styles.productPrice}>
                              <span className={styles.priceLabel}>Price:</span>
                              <span className={styles.priceValue}>
                                {typeof product.price === 'number' ? `$${product.price.toLocaleString()}` : product.price}
                              </span>
                            </div>

                            <div className={styles.productCashback}>
                              <span className={styles.cashbackLabel}>Cashback:</span>
                              <span className={styles.cashbackValue}>
                                {Math.round(product.cashback_rate * 100)}% {product.cashback_amount > 0 ? `($${product.cashback_amount})` : ''}
                              </span>
                            </div>

                            <div className={styles.productMerchant}>
                              <span className={styles.merchantLabel}>Merchant:</span>
                              <span className={styles.merchantName}>{product.merchant}</span>
                            </div>

                            <motion.a
                              href={product.affiliate_link || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.btnShopNow}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{ display: 'inline-block', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                            >
                              🛒 Shop Now
                            </motion.a>
                          </div>
                        </motion.div>
                      ))}
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
                className={styles.input}
                placeholder="Ask me anything about shopping... e.g., 'Find me gaming laptop under $2000'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                rows={3}
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
    </>
  );
}
