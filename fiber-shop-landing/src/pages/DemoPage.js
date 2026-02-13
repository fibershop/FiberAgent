import React, { useState } from 'react';
import '../styles/DemoPage.css';

export default function DemoPage() {
  const FIBER_API = '/api/fiber-proxy';

  const generateTestWallet = () => {
    const hex = '0123456789abcdef';
    let addr = '0xtest';
    for (let i = 0; i < 36; i++) addr += hex[Math.floor(Math.random() * 16)];
    return addr;
  };

  const [agentId, setAgentId] = useState(null);
  const [agentName, setAgentName] = useState('My Shopping Agent');
  const [walletAddress, setWalletAddress] = useState(() => generateTestWallet());
  const [regResponse, setRegResponse] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);

  const [searchKeywords, setSearchKeywords] = useState('shoes');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

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
          body: { agent_name: agentName, wallet_address: walletAddress, description: 'Shopping agent via FiberAgent' }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Handle 409 — already registered
        if (data.existing_agent_id) {
          setAgentId(data.existing_agent_id);
          setRegResponse({ agent_id: data.existing_agent_id, agent_name: agentName, status: 'active (existing)' });
        } else {
          setRegError(data.error || 'Registration failed');
        }
      } else {
        setRegResponse(data);
        setAgentId(data.agent_id);
      }
    } catch (err) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!agentId) { setSearchError('Register first'); return; }
    
    // Clear previous results immediately
    setSearchResults(null);
    setSearchLoading(true);
    setSearchError(null);
    
    try {
      const res = await fetch(FIBER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GET',
          endpoint: 'agent/search',
          queryParams: { keywords: searchKeywords, agent_id: agentId, limit: 8 }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) setSearchError(data.error || 'Search failed');
      else setSearchResults(data);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="demo">
      {/* Header */}
      <section className="demo-hero">
        <div className="demo-hero-inner">
          <p className="label">LIVE DEMO</p>
          <h1>Try FiberAgent.</h1>
          <p className="sub">Register an agent, search 50,000+ merchants, see real cashback rates.</p>
        </div>
      </section>

      <div className="demo-body">
        {/* Step 1 */}
        <section className="demo-panel">
          <div className="panel-head">
            <span className="step-badge">01</span>
            <h2>Register your agent</h2>
          </div>
          <form onSubmit={handleRegister} className="reg-form">
            <div className="field">
              <label>Agent Name</label>
              <input value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="My Shopping Agent" />
            </div>
            <div className="field">
              <label>Wallet Address</label>
              <div className="wallet-row">
                <input value={walletAddress} onChange={e => setWalletAddress(e.target.value)} placeholder="0x..." className="mono" />
                <button type="button" className="btn-icon" onClick={() => setWalletAddress(generateTestWallet())} title="Generate wallet">↻</button>
              </div>
            </div>
            <button type="submit" disabled={regLoading} className="btn-submit">
              {regLoading ? 'Registering…' : 'Register Agent'}
            </button>
            {regError && <p className="msg-error">{regError}</p>}
            {regResponse && (
              <div className="msg-success">
                <p><strong>Agent ID</strong> {regResponse.agent_id}</p>
                <p><strong>Status</strong> {regResponse.status || 'active'}</p>
              </div>
            )}
          </form>
        </section>

        {/* Step 2 */}
        <section className="demo-panel">
          <div className="panel-head">
            <span className="step-badge">02</span>
            <h2>Search products</h2>
          </div>
          {!agentId ? (
            <p className="muted">Register an agent first.</p>
          ) : (
            <>
              <form onSubmit={handleSearch} className="search-form">
                <input value={searchKeywords} onChange={e => setSearchKeywords(e.target.value)} placeholder="shoes, electronics, fitness…" />
                <button type="submit" disabled={searchLoading} className="btn-submit">
                  {searchLoading ? 'Searching…' : 'Search'}
                </button>
              </form>
              {searchError && <p className="msg-error">{searchError}</p>}
            </>
          )}
        </section>

        {/* Results */}
        {searchResults && searchResults.results && (
          <section className="results-section">
            <p className="results-count">{searchResults.results_count} merchants found for "{searchResults.query}"</p>
            <div className="results-grid">
              {searchResults.results.map((m) => (
                <a key={m.merchant_id} href={m.affiliate_link} target="_blank" rel="noopener noreferrer" className="merchant-card">
                  <div className="mc-image">
                    {m.image_url ? <img src={m.image_url} alt={m.merchant_name} /> : <span className="mc-placeholder">{m.merchant_name[0]}</span>}
                  </div>
                  <div className="mc-body">
                    <h3>{m.merchant_name}</h3>
                    <span className="mc-domain">{m.merchant_domain}</span>
                    <span className="mc-cashback">{m.cashback.display} cashback</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
