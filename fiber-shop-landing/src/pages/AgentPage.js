import React, { useState, useEffect } from 'react';
import '../styles/AgentPage.css';

export default function AgentPage() {
  const FIBER_API = '/api/fiber-proxy';

  // Blockchain and token mapping
  const blockchainTokens = {
    'Monad': ['MON'],
    'Solana': ['SOL', 'BONK', 'MF', 'AOL', 'USDC', 'USD1', 'VALOR', 'PENGU']
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedBlockchain, setSelectedBlockchain] = useState('Monad');
  const [selectedToken, setSelectedToken] = useState('MON');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const getAvailableTokens = () => blockchainTokens[selectedBlockchain] || [];

  const handleBlockchainChange = (e) => {
    const newBlockchain = e.target.value;
    setSelectedBlockchain(newBlockchain);
    const availableTokens = blockchainTokens[newBlockchain];
    setSelectedToken(availableTokens[0]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setProducts([]);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'agent/search',
          queryParams: {
            keywords: searchQuery,
            agent_id: 'demo-agent',
            limit: 12
          }
        })
      });

      const data = await res.json();
      if (data.success && data.results) {
        setProducts(data.results);
      } else {
        setSearchError('No results found');
        setProducts([]);
      }
    } catch (err) {
      setSearchError('Search failed: ' + err.message);
      setProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="agent-page">
      {/* Header */}
      <section className="page-hero">
        <div className="hero-inner">
          <p className="label">FOR AGENTS</p>
          <h1>Build revenue, not features.</h1>
          <p className="sub">Register once. Search forever. Earn automatically.</p>
        </div>
      </section>

      <div className="page-body">
        {/* Dashboard Cards */}
        <section className="dashboard-section">
          <div className="dashboard-grid">
            <div className="dash-card">
              <p className="card-label">Your Earnings</p>
              <p className="card-value">$0.00</p>
              <p className="card-desc">This month</p>
            </div>
            <div className="dash-card">
              <p className="card-label">Active Users</p>
              <p className="card-value">0</p>
              <p className="card-desc">Shopping through you</p>
            </div>
            <div className="dash-card">
              <p className="card-label">Payout Settings</p>
              <div className="settings-flex">
                <div className="setting-field">
                  <label>Blockchain</label>
                  <select value={selectedBlockchain} onChange={handleBlockchainChange} className="setting-select">
                    {Object.keys(blockchainTokens).map(chain => (
                      <option key={chain} value={chain}>{chain}</option>
                    ))}
                  </select>
                </div>
                <div className="setting-field">
                  <label>Token</label>
                  <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)} className="setting-select">
                    {getAvailableTokens().map(token => (
                      <option key={token} value={token}>{token}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="card-desc">Receive {selectedToken} on {selectedBlockchain}</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-section">
          <p className="section-label">THE PROCESS</p>
          <h2>Three steps to revenue.</h2>
          <div className="steps-layout">
            <div className="how-step">
              <span className="step-num">01</span>
              <h3>Register</h3>
              <p>You already did. Your agent ID is ready to query FiberAgent.</p>
            </div>
            <div className="how-step">
              <span className="step-num">02</span>
              <h3>Query & Share</h3>
              <p>Your agent searches FiberAgent. You share the affiliate link with your users.</p>
            </div>
            <div className="how-step">
              <span className="step-num">03</span>
              <h3>Earn</h3>
              <p>User buys. You get a kickback in {selectedToken}. Automatic. On-chain.</p>
            </div>
          </div>
        </section>

        {/* Search Products */}
        <section className="products-section">
          <p className="section-label">SEARCH</p>
          <h2>Find what your users want.</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="shoes, electronics, food…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" disabled={searchLoading} className="search-btn">
              {searchLoading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {searchError && <p className="search-error">{searchError}</p>}

          {products.length === 0 ? (
            <div className="empty-state">
              <p>Start searching to see products and earnings.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <a
                  key={product.merchant_id}
                  href={product.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="product-card"
                >
                  <div className="pc-image">
                    {product.image_url ? <img src={product.image_url} alt={product.merchant_name} /> : <span className="pc-placeholder">{product.merchant_name[0]}</span>}
                  </div>
                  <div className="pc-body">
                    <h4>{product.merchant_name}</h4>
                    <span className="pc-shop">{product.merchant_domain}</span>
                    <span className="pc-earn">{product.cashback.display}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Tips */}
        <section className="tips-section">
          <p className="section-label">TIPS</p>
          <h2>Maximize your earnings.</h2>
          <div className="tips-grid">
            <div className="tip-box">
              <h3>Share What Converts</h3>
              <p>Find products your users actually buy. Quality over quantity.</p>
            </div>
            <div className="tip-box">
              <h3>Build on Trust</h3>
              <p>Your reputation score grows with every successful transaction.</p>
            </div>
            <div className="tip-box">
              <h3>Real-time Payouts</h3>
              <p>No waiting. Earnings hit your wallet as transactions confirm.</p>
            </div>
            <div className="tip-box">
              <h3>API-First</h3>
              <p>Integrate FiberAgent directly into your agent. One API call per search.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="page-footer">
        <p>Build with Fiber. Deploy on Monad.</p>
      </footer>
    </div>
  );
}
