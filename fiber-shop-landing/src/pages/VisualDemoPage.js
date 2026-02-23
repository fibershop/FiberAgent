import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import './VisualDemoPage.css';

function VisualDemoPage() {
  const [activeLLM, setActiveLLM] = useState('openclaw');

  useEffect(() => {
    const messages = document.querySelectorAll('.message');
    messages.forEach((msg, idx) => {
      msg.style.animationDelay = `${idx * 0.3}s`;
    });
  }, []);

  const llmCards = [
    {
      id: 'openclaw',
      badge: 'Auto-Discover',
      name: 'OpenClaw',
      desc: 'Your personal AI automatically discovers FiberAgent. Just ask for products. No setup needed.',
    },
    {
      id: 'claude',
      badge: 'Works Everywhere',
      name: 'Claude Desktop / Web',
      desc: 'Works in Claude Desktop, Claude.ai, or any Claude integration. Zero friction for users.',
    },
    {
      id: 'gpt4',
      badge: 'REST API',
      name: 'Any LLM',
      desc: 'Works with ChatGPT, Claude, local models, or any AI. Pure API integration.',
    },
  ];

  const bullets = [
    {
      num: '1',
      title: 'Only Commerce Agent',
      text: 'Zero competitors on Monad. Check 8004scan — FiberAgent is the only player in the Commerce category.',
    },
    {
      num: '2',
      title: 'Zero Friction',
      text: 'No signup. No wallet. No crypto. Just chat. "Find me shoes" → instant results → click & buy. Users never touch anything but the shopping link.',
    },
    {
      num: '3',
      title: 'Crypto Powers Agent Payouts',
      text: 'Agents earn MON directly (users don\'t touch crypto). No banks, no KYC, no PayPal. Pure wallet-to-wallet settlement. Global, trustless, instant.',
    },
    {
      num: '4',
      title: 'Market Explodes',
      text: 'Fiber.shop is 100K users. Personal AI is 1B+ users. Every person with Claude, GPT-4, or an OpenClaw agent is a potential customer.',
    },
    {
      num: '5',
      title: 'Agents Own the Commissions',
      text: 'Agents earn MON directly (users don\'t see crypto). Agent controls tokens — can share value with user, reinvest, or keep. Economics locked in.',
    },
    {
      num: '6',
      title: 'Perfect Timing',
      text: 'Personal AI is exploding. Shopping is a core daily use case. When users ask their AI for products, FiberAgent owns that moment.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>FiberAgent — Zero Friction Commerce Demo</title>
        <meta name="description" content="The first commerce agent where users never leave chat. Instant shopping with cashback rewards." />
        <meta property="og:title" content="FiberAgent — Zero Friction Commerce Demo" />
        <meta property="og:description" content="Discover how FiberAgent brings shopping into any LLM chat." />
      </Helmet>

      <div className="visual-demo-container">
        <header className="visual-demo-header">
          <h1>FiberAgent</h1>
          <p className="tagline">The First Commerce Agent Where Users Never Leave Chat</p>
        </header>

        {/* LLM Selection */}
        <div className="demo-grid">
          {llmCards.map((card) => (
            <div
              key={card.id}
              className={`llm-card ${activeLLM === card.id ? 'active' : ''}`}
              onClick={() => setActiveLLM(card.id)}
            >
              <div className="llm-badge">{card.badge}</div>
              <div className="llm-name">{card.name}</div>
              <div className="llm-desc">{card.desc}</div>
            </div>
          ))}
        </div>

        {/* Chat Demo */}
        <div className="chat-demo">
          <div className="message user">
            <div className="text">Find me hiking boots with cashback 🥾</div>
          </div>

          <div className="message ai">
            <div className="text">
              <div style={{ marginBottom: '8px' }}>Found 5 options with real cashback rewards:</div>
              <div className="products-grid">
                <div className="product-item">
                  <div className="product-name">Columbia Ridge Backpacker</div>
                  <div className="product-price">$119.99</div>
                  <div className="product-cashback">4% affiliate = $4.80 MON</div>
                </div>
                <div className="product-item">
                  <div className="product-name">Salomon Quest 4D</div>
                  <div className="product-price">$249.99</div>
                  <div className="product-cashback">2% affiliate = $5.00 MON</div>
                </div>
                <div className="product-item">
                  <div className="product-name">Merrell Moab 3</div>
                  <div className="product-price">$149.99</div>
                  <div className="product-cashback">3% affiliate = $4.50 MON</div>
                </div>
                <div className="product-item">
                  <div className="product-name">ASICS Gel-Venture</div>
                  <div className="product-price">$99.99</div>
                  <div className="product-cashback">5% affiliate = $5.00 MON</div>
                </div>
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.9em', color: '#a0a0a0' }}>
                🤖 I'll earn MON commissions (after purchase is confirmed). No wallet setup needed for you — I handle all the crypto. Just shop normally.
              </div>
            </div>
          </div>

          <div className="message user">
            <div className="text">Go with the Columbia one</div>
          </div>

          <div className="message ai">
            <div className="text">
              ✅ Perfect! Here's your link:<br />
              <code style={{ color: '#64ffda', display: 'block', marginTop: '8px' }}>
                https://fiberagent.shop/r/columbia-ridge...
              </code>
              <div style={{ marginTop: '8px', fontSize: '0.9em' }}>Click and buy normally. No signup, no wallet, no crypto steps. I earn the commission in the background. 🚀</div>
            </div>
          </div>
        </div>

        {/* API Flow */}
        <div className="api-flow">
          <div className="flow-title">How It Works (Under the Hood)</div>
          <div className="flow-steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-label">User Asks</div>
              <div className="step-desc">"Find hiking boots"</div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-label">LLM Discovers</div>
              <div className="step-desc">FiberAgent skill via semantic search</div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-label">API Call</div>
              <div className="step-desc">POST /api/agent/search with keywords</div>
            </div>
            <div className="step">
              <div className="step-num">4</div>
              <div className="step-label">Results</div>
              <div className="step-desc">50K+ merchants, real cashback</div>
            </div>
          </div>

          <div className="code-label">📤 Sample API Request (from Agent)</div>
          <div className="code-block">
            <span style={{ color: '#64ffda' }}>POST</span> /api/agent/search<br />
            {'{'}
            <br />
            &nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"keywords"</span>: ["hiking", "boots"],
            <br />
            &nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"agent_id"</span>: "claude-shopping-agent-001",
            <br />
            &nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"wallet"</span>: "0x790b405d466f7fdd..."
            <br />
            {'}'}
          </div>

          <div style={{ marginTop: '16px' }}></div>
          <div className="code-label">📥 Sample API Response</div>
          <div className="code-block">
            {'{'}
            <br />
            &nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"products"</span>: [
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;{'{'}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"name"</span>: "Columbia Ridge Backpacker",
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"price"</span>: 119.99,
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"affiliate_rate"</span>: 0.04,
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"affiliate_commission_mon"</span>: 4.80,
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"affiliate_link"</span>: "https://fiberagent.shop/r/...",
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"merchant"</span>: "Amazon"
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;{'}'}
            <br />
            &nbsp;&nbsp;],
            <br />
            &nbsp;&nbsp;<span style={{ color: '#64ffda' }}>"potential_agent_earnings_mon"</span>: 4.80
            <br />
            {'}'}
          </div>
        </div>

        {/* The 6 Bullets */}
        <section className="bullets-section">
          <div className="bullets-header">
            <h2>Why FiberAgent Wins</h2>
            <p>The 6 factors converging now</p>
          </div>

          <div className="six-bullets">
            {bullets.map((bullet) => (
              <div key={bullet.num} className="bullet">
                <div className="bullet-num">{bullet.num}</div>
                <div className="bullet-title">{bullet.title}</div>
                <div className="bullet-text">{bullet.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="cta-section">
          <div className="cta-text">Ready to use FiberAgent?</div>
          <div className="cta-buttons">
            <a href="https://github.com/openclawlaurent/FiberAgent" target="_blank" rel="noopener noreferrer">
              <button className="btn btn-primary">Learn More</button>
            </a>
            <a href="https://fiberagent.shop" target="_blank" rel="noopener noreferrer">
              <button className="btn btn-secondary">Try Live Demo</button>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default VisualDemoPage;
