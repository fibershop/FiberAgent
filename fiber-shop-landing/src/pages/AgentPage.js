import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import '../styles/AgentPage.css';

export default function AgentPage() {
  const FIBER_API = '/api/fiber-proxy';

  // Custom react-select styles (Fiber design)
  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'rgba(20,20,20,0.8)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '0px',
      cursor: 'pointer',
      transition: 'border-color 0.2s',
      ':hover': {
        borderColor: 'rgba(255,255,255,0.3)',
      }
    }),
    input: (base) => ({
      ...base,
      color: '#fff',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#fff',
    }),
    menu: (base) => ({
      ...base,
      background: 'rgba(20,20,20,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      marginTop: '4px',
    }),
    option: (base, state) => ({
      ...base,
      background: state.isSelected ? 'rgba(0,208,132,0.2)' : state.isFocused ? 'rgba(255,255,255,0.08)' : 'rgba(20,20,20,0.95)',
      color: '#fff',
      cursor: 'pointer',
      padding: '12px 16px',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'rgba(255,255,255,0.2)',
    }),
  };

  // Blockchain and token mapping
  const blockchainTokens = {
    'Monad': ['MON'],
    'Solana': ['SOL', 'BONK', 'MF', 'AOL', 'USDC', 'USD1', 'VALOR', 'PENGU']
  };

  // Generate test wallet
  const generateTestWallet = () => {
    const hex = '0123456789abcdef';
    let addr = '0xtest';
    for (let i = 0; i < 36; i++) addr += hex[Math.floor(Math.random() * 16)];
    return addr;
  };

  // Mode: 'new' = register new agent, 'existing' = use existing agent
  const [mode, setMode] = useState('new');
  
  // For "already registered" flow
  const [existingAgentId, setExistingAgentId] = useState('');
  const [existingAgentLoading, setExistingAgentLoading] = useState(false);
  const [existingAgentError, setExistingAgentError] = useState(null);

  // Registration state
  const [agentName, setAgentName] = useState('My Shopping Agent');
  const [walletAddress, setWalletAddress] = useState(() => generateTestWallet());
  const [selectedBlockchain, setSelectedBlockchain] = useState('Monad');
  const [selectedToken, setSelectedToken] = useState('MON');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);
  
  // After registration
  const [agentId, setAgentId] = useState(null);
  const [registered, setRegistered] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const getAvailableTokens = () => blockchainTokens[selectedBlockchain] || [];

  const handleBlockchainChange = (option) => {
    const newBlockchain = option.value;
    setSelectedBlockchain(newBlockchain);
    const availableTokens = blockchainTokens[newBlockchain];
    setSelectedToken(availableTokens[0]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);

    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'POST',
          endpoint: 'agent/register',
          body: {
            agent_name: agentName,
            wallet_address: walletAddress,
            preferred_token: selectedToken,
            description: 'Shopping agent via FiberAgent'
          }
        })
      });

      const data = await res.json();
      
      if (data.success || data.agent_id) {
        setAgentId(data.agent_id || data.existing_agent_id);
        setRegistered(true);
        setRegError(null);
      } else if (data.existing_agent_id) {
        // Already registered
        setAgentId(data.existing_agent_id);
        setRegistered(true);
        setRegError(null);
      } else {
        setRegError(data.error || 'Registration failed');
      }
    } catch (err) {
      setRegError('Error: ' + err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleLoadExistingAgent = async (e) => {
    e.preventDefault();
    if (!existingAgentId.trim()) return;

    setExistingAgentLoading(true);
    setExistingAgentError(null);

    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: `agent/${existingAgentId}/stats`
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setAgentId(existingAgentId);
        setRegistered(true);
        setExistingAgentError(null);
      } else {
        setExistingAgentError(data.error || 'Agent not found');
      }
    } catch (err) {
      setExistingAgentError('Error: ' + err.message);
    } finally {
      setExistingAgentLoading(false);
    }
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
            agent_id: agentId,
            limit: 12
          }
        })
      });

      const data = await res.json();
      if (data.success && data.results) {
        setProducts(data.results);
        setSearchError(null);
      } else {
        setSearchError(data.error || 'No results found');
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
        {/* Mode Selector */}
        {!registered && (
          <section className="mode-selector-section">
            <div className="mode-buttons">
              <button
                className={`mode-btn ${mode === 'new' ? 'active' : ''}`}
                onClick={() => {
                  setMode('new');
                  setExistingAgentError(null);
                }}
              >
                Create New Agent
              </button>
              <button
                className={`mode-btn ${mode === 'existing' ? 'active' : ''}`}
                onClick={() => {
                  setMode('existing');
                  setRegError(null);
                }}
              >
                I'm Already Registered
              </button>
            </div>
          </section>
        )}

        {/* Registration Section */}
        {!registered ? (
          <>
            {mode === 'new' ? (
              <section className="registration-section">
            <p className="section-label">STEP 1</p>
            <h2>Register your agent.</h2>
            <form onSubmit={handleRegister} className="reg-form">
              <div className="reg-grid">
                <div className="reg-field">
                  <label>Agent Name</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="My Shopping Agent"
                    className="reg-input"
                  />
                </div>
                <div className="reg-field">
                  <label>Wallet Address</label>
                  <div className="wallet-input-row">
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x..."
                      className="reg-input mono"
                    />
                    <button
                      type="button"
                      className="gen-btn"
                      onClick={() => setWalletAddress(generateTestWallet())}
                      title="Generate wallet"
                    >
                      ↻
                    </button>
                  </div>
                </div>
                <div className="reg-field">
                  <label>Blockchain</label>
                  <Select
                    options={Object.keys(blockchainTokens).map(chain => ({ value: chain, label: chain }))}
                    value={{ value: selectedBlockchain, label: selectedBlockchain }}
                    onChange={handleBlockchainChange}
                    styles={selectStyles}
                    isSearchable={false}
                  />
                </div>
                <div className="reg-field">
                  <label>Payout Token</label>
                  <Select
                    options={getAvailableTokens().map(token => ({ value: token, label: token }))}
                    value={{ value: selectedToken, label: selectedToken }}
                    onChange={(option) => setSelectedToken(option.value)}
                    styles={selectStyles}
                    isSearchable={false}
                  />
                </div>
              </div>
              <button type="submit" disabled={regLoading} className="reg-submit">
                {regLoading ? 'Registering…' : 'Register Agent'}
              </button>
              {regError && <p className="msg-error">{regError}</p>}
            </form>
              </section>
            ) : (
              <section className="registration-section">
                <p className="section-label">STEP 1</p>
                <h2>Access your dashboard.</h2>
                <form onSubmit={handleLoadExistingAgent} className="reg-form">
                  <div className="reg-grid">
                    <div className="reg-field" style={{gridColumn: '1 / -1'}}>
                      <label>Your Agent ID</label>
                      <input
                        type="text"
                        value={existingAgentId}
                        onChange={(e) => setExistingAgentId(e.target.value)}
                        placeholder="agent_12345"
                        className="reg-input mono"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={existingAgentLoading} className="reg-submit">
                    {existingAgentLoading ? 'Loading…' : 'Access Dashboard'}
                  </button>
                  {existingAgentError && <p className="msg-error">{existingAgentError}</p>}
                </form>
              </section>
            )}
          </>
        ) : (
          <>
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
                  <p className="card-label">Agent ID</p>
                  <p className="card-value-small">{agentId}</p>
                  <p className="card-desc">Payout: {selectedToken} on {selectedBlockchain}</p>
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
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.merchant_name} />
                        ) : (
                          <span className="pc-placeholder">{product.merchant_name[0]}</span>
                        )}
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
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="page-footer">
        <p>Build with Fiber. Deploy on Monad.</p>
      </footer>
    </div>
  );
}
