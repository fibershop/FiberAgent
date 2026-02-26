import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './GettingStartedPage.css';

function GettingStartedPage() {
  const [activeTab, setActiveTab] = useState('user');

  return (
    <>
      <Helmet>
        <title>Getting Started with FiberAgent</title>
        <meta name="description" content="Start using FiberAgent in 5 minutes. Guides for users and AI agents." />
      </Helmet>

      <div className="getting-started-container">
        <header className="gs-header">
          <h1>Getting Started</h1>
          <p className="gs-tagline">Start shopping smarter in 5 minutes.</p>
        </header>

        {/* Tab Selector */}
        <div className="gs-tabs">
          <button
            className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            👤 I'm a User
          </button>
          <button
            className={`tab-btn ${activeTab === 'agent' ? 'active' : ''}`}
            onClick={() => setActiveTab('agent')}
          >
            🤖 I'm an Agent
          </button>
        </div>

        {/* USER GUIDE */}
        {activeTab === 'user' && (
          <section className="gs-content user-guide">
            <h2>For Users: Start Shopping with FiberAgent</h2>

            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-content">
                  <h3>Get Claude Desktop</h3>
                  <p>Download <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer">Claude Desktop</a> (free, macOS/Windows).</p>
                </div>
              </div>

              <div className="step">
                <div className="step-num">2</div>
                <div className="step-content">
                  <h3>Open Config File</h3>
                  <p><strong>macOS:</strong> ~/Library/Application Support/Claude/claude_desktop_config.json</p>
                  <p><strong>Windows:</strong> %APPDATA%\Claude\claude_desktop_config.json</p>
                </div>
              </div>

              <div className="step">
                <div className="step-num">3</div>
                <div className="step-content">
                  <h3>Add FiberAgent</h3>
                  <div className="code-block">
                    <pre><code>{`{
  "mcpServers": {
    "fiberagent": {
      "url": "https://fiberagent.shop/api/mcp"
    }
  }
}`}</code></pre>
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="step-num">4</div>
                <div className="step-content">
                  <h3>Restart Claude</h3>
                  <p>Close and reopen Claude Desktop. FiberAgent tools appear in the Tools menu.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-num">5</div>
                <div className="step-content">
                  <h3>Start Shopping!</h3>
                  <p>Ask Claude: "Find me running shoes under $150" or any product you need.</p>
                  <p>Claude will return deals with real cashback rates. Click the link to buy.</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="how-it-works">
              <h3>How It Works</h3>
              <div className="flow">
                <div className="flow-box">
                  <span className="flow-emoji">💬</span>
                  <p><strong>You Ask:</strong><br/>"Find hiking boots"</p>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-box">
                  <span className="flow-emoji">🔍</span>
                  <p><strong>Claude Searches:</strong><br/>50K+ products</p>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-box">
                  <span className="flow-emoji">🛍️</span>
                  <p><strong>You Get:</strong><br/>Best deals with rates</p>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-box">
                  <span className="flow-emoji">💳</span>
                  <p><strong>You Buy:</strong><br/>Normal checkout</p>
                </div>
              </div>
            </div>

            <div className="faq-section">
              <h3>Questions?</h3>
              <div className="faq-item">
                <strong>Is it really free?</strong>
                <p>Yes, 100% free. No accounts, no signups, no fees ever.</p>
              </div>
              <div className="faq-item">
                <strong>How do I get cashback?</strong>
                <p>When you buy through FiberAgent's affiliate link, merchants pay commission. Currently goes to your agent. Agents can share with users.</p>
              </div>
              <div className="faq-item">
                <strong>What devices work?</strong>
                <p>Claude Desktop on Mac and Windows. Also works in Claude.ai web, ChatGPT, or any AI with MCP/REST API support.</p>
              </div>
            </div>
          </section>
        )}

        {/* AGENT GUIDE */}
        {activeTab === 'agent' && (
          <section className="gs-content agent-guide">
            <h2>For Agents: Start Earning Commissions</h2>

            <div className="steps">
              <div className="step">
                <div className="step-num">1</div>
                <div className="step-content">
                  <h3>Create a Monad Wallet</h3>
                  <p>You need a Monad wallet to receive commissions. Use MetaMask or any Web3 wallet.</p>
                  <p className="hint">💡 Your wallet address is your agent ID on FiberAgent.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-num">2</div>
                <div className="step-content">
                  <h3>Register Your Agent</h3>
                  <div className="code-block">
                    <pre><code>{`curl -X POST https://fiberagent.shop/api/agent/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "my-shopping-agent-001",
    "agent_name": "My Shopping Helper",
    "wallet": "0x790b405d..."
  }'`}</code></pre>
                  </div>
                  <p className="hint">💡 Response includes your agent token ID for on-chain verification.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-num">3</div>
                <div className="step-content">
                  <h3>Choose Your Integration</h3>
                  <div className="integration-options">
                    <div className="option">
                      <strong>🤖 MCP (Easiest)</strong>
                      <code>https://fiberagent.shop/api/mcp</code>
                      <p>Works with Claude, ChatGPT, any MCP client.</p>
                    </div>
                    <div className="option">
                      <strong>🔌 REST API</strong>
                      <code>POST /api/agent/search</code>
                      <p>Custom integrations, full control.</p>
                    </div>
                    <div className="option">
                      <strong>⚙️ OpenClaw Skill</strong>
                      <code>npm install github:fibershop/FiberAgent</code>
                      <p>Local AI integration, auto-discovery.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="step-num">4</div>
                <div className="step-content">
                  <h3>Start Making Searches</h3>
                  <p>When your users ask for products, call FiberAgent and return results with affiliate links.</p>
                  <div className="code-block">
                    <pre><code>{`POST /api/agent/search
{
  "keywords": ["hiking boots"],
  "agent_id": "my-shopping-agent-001",
  "wallet": "0x790b405d..."
}`}</code></pre>
                  </div>
                </div>
              </div>

              <div className="step">
                <div className="step-num">5</div>
                <div className="step-content">
                  <h3>Track Your Earnings</h3>
                  <div className="code-block">
                    <pre><code>{`POST /api/agent/get-stats
{
  "agent_id": "my-shopping-agent-001"
}`}</code></pre>
                  </div>
                  <p>Returns: total searches, commissions earned, average per search.</p>
                </div>
              </div>
            </div>

            {/* Commission Flow */}
            <div className="commission-flow">
              <h3>How You Earn</h3>
              <div className="flow-diagram">
                <div className="flow-item">
                  <span className="item-label">User buys</span>
                  <strong className="item-amount">$100</strong>
                </div>
                <div className="flow-connector">↓</div>
                <div className="flow-item">
                  <span className="item-label">Merchant pays</span>
                  <strong className="item-amount">5% = $5</strong>
                </div>
                <div className="flow-connector">↓</div>
                <div className="flow-item highlight">
                  <span className="item-label">You get ~</span>
                  <strong className="item-amount">$2 MON</strong>
                </div>
              </div>
              <p className="flow-note">📌 After 30-90 day refund window (merchant-dependent). Paid directly to your wallet.</p>
            </div>

            {/* Agent Benefits */}
            <div className="benefits">
              <h3>Why Register?</h3>
              <div className="benefit-grid">
                <div className="benefit">
                  <span className="benefit-icon">⛓️</span>
                  <strong>On-Chain Verified</strong>
                  <p>Your agent token ID is recorded on Monad blockchain (ERC-8004). Transparent, trustless identity.</p>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">💰</span>
                  <strong>Real Earnings</strong>
                  <p>Commissions sent directly to your wallet in MON tokens. No middleman, no fees.</p>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">🛍️</span>
                  <strong>50K+ Products</strong>
                  <p>Access entire Fiber merchant network. Nike, Amazon, Best Buy, Sephora, and thousands more.</p>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">📊</span>
                  <strong>Real-Time Stats</strong>
                  <p>Track searches, earnings, and trends. See which products convert best.</p>
                </div>
              </div>
            </div>

            <div className="faq-section">
              <h3>Agent Questions?</h3>
              <div className="faq-item">
                <strong>No rate limits?</strong>
                <p>Correct. Call FiberAgent unlimited times. No quotas, no API keys, no authentication.</p>
              </div>
              <div className="faq-item">
                <strong>When do I get paid?</strong>
                <p>Depends on merchant. Usually 30-90 days after purchase (refund window). Then crypto payment to your wallet (trustless settlement, no middleman).</p>
              </div>
              <div className="faq-item">
                <strong>Can I earn on my own users?</strong>
                <p>Yes! Your users click your links. If they buy, you earn. No setup needed.</p>
              </div>
              <div className="faq-item">
                <strong>What's on-chain registration?</strong>
                <p>Your agent ID is recorded on Monad blockchain. Transparent, verifiable, and enables future features (reputation, governance).</p>
              </div>
            </div>
          </section>
        )}

        {/* Next Steps */}
        <section className="gs-next-steps">
          <h2>Next Steps</h2>
          <div className="next-steps-grid">
            <a href="/developers" className="next-step">
              <div className="step-icon">📚</div>
              <h3>Developer Hub</h3>
              <p>Full API documentation, code examples, and integration guides</p>
            </a>
            <a href="/capabilities" className="next-step">
              <div className="step-icon">📋</div>
              <h3>API Reference</h3>
              <p>Complete tool schemas, resources, and technical specs</p>
            </a>
            <a href="https://github.com/fibershop/FiberAgent" target="_blank" rel="noopener noreferrer" className="next-step">
              <div className="step-icon">🔧</div>
              <h3>GitHub</h3>
              <p>Source code, skills, and community discussions</p>
            </a>
            <a href="/visual-demo" className="next-step">
              <div className="step-icon">🎬</div>
              <h3>Visual Demo</h3>
              <p>Interactive walkthrough showing FiberAgent in action</p>
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

export default GettingStartedPage;
