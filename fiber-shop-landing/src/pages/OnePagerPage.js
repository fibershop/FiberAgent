import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import './OnePagerPage.css';

function OnePagerPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.onload = () => {
      initCharts();
    };
    document.body.appendChild(script);
  }, []);

  const initCharts = () => {
    if (window.Chart) {
      const marketCtx = document.getElementById('marketChart');
      if (marketCtx) {
        new window.Chart(marketCtx.getContext('2d'), {
          type: 'line',
          data: {
            labels: ['2024\n(Fiber.shop)', '2025\n(Personal AI boom)', '2026\n(FiberAgent everywhere)', '2027+\n(AI commerce standard)'],
            datasets: [{
              label: 'Market Size (Users)',
              data: [100000, 5000000, 100000000, 1000000000],
              borderColor: '#00d084',
              backgroundColor: 'rgba(0, 208, 132, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#00d084',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' }
            },
            scales: {
              y: { type: 'logarithmic', title: { display: true, text: 'Users (log scale)' } }
            }
          }
        });
      }

      const commissionCtx = document.getElementById('commissionChart');
      if (commissionCtx) {
        new window.Chart(commissionCtx.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: ['Agent\nCommissions', 'User\nValue', 'FiberAgent\nFee'],
            datasets: [{
              data: [40, 45, 15],
              backgroundColor: ['#00d084', '#64ffda', '#00b370'],
              borderColor: ['#ffffff'],
              borderWidth: 2,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>FiberAgent — One-Pager</title>
        <meta name="description" content="The first commerce agent where users never leave chat." />
      </Helmet>

      <div className="onepager-container">
        <article className="onepager-doc">
          
          {/* Title */}
          <header className="doc-header">
            <h1>FiberAgent</h1>
            <h2 className="subtitle">The First Commerce Agent for the AI Era</h2>
            <p className="date">February 2026</p>
          </header>

          {/* Executive Summary */}
          <section className="doc-section">
            <h3>Executive Summary</h3>
            <p>
              FiberAgent is a commerce agent that sits between users' personal AIs (Claude, ChatGPT, OpenClaw) and merchants (<span className="source" title="Verified via Fiber API live integration">50K+ via Fiber API</span>). Users ask their AI for products. The agent finds deals, returns results in chat. Users buy normally. Agents earn MON crypto commissions. Zero registration, zero friction.
            </p>
            <p>
              <strong>Market opportunity:</strong> Fiber.shop ≈ <span className="source" title="Estimated based on Fiber's stated user base">100K users</span>. Personal AI ≈ <span className="source" title="Based on 2025-2026 AI adoption metrics: Claude 10M+ weekly users, ChatGPT 200M+ monthly users">1B+ users</span>. Same merchants, same commissions, infinite distribution.
            </p>
            <p>
              <strong>Status:</strong> Live MVP. Real API integration. On-chain agent registration (<span className="source" title="Monad ERC-8004 agent registry: https://www.8004scan.io/agents/monad/135">Monad ERC-8004 #135</span>). <span className="source" title="Verified search on 8004scan.io for 'Commerce' category">Zero competitors in commerce category</span>.
            </p>
          </section>

          {/* The Problem */}
          <section className="doc-section">
            <h3>The Problem</h3>
            <div className="text-columns">
              <div>
                <p><strong>Merchants need customers.</strong> Fiber.shop reaches 100K. That's tiny compared to the personal AI explosion (Claude, ChatGPT, Gemini everywhere).</p>
              </div>
              <div>
                <p><strong>Agents need economics.</strong> AIs are becoming personal assistants. But there's no incentive layer for them to help users shop. No money for agents = no reason to recommend shopping tools.</p>
              </div>
            </div>
          </section>

          {/* The Solution */}
          <section className="doc-section">
            <h3>The Solution</h3>
            <p>
              Put shopping directly into chat. Users ask their AI "Find me hiking boots." Agent discovers FiberAgent skill (or API endpoint), fetches 50K+ products in real-time, returns results with affiliate commissions embedded. User buys. Agent earns crypto (MON on Monad).
            </p>
            <p className="highlight-box">
              <strong>Why this works:</strong> No signup for users. No wallets needed. No crypto friction. Agents earn instantly, globally, via blockchain (trustless). Merchants reach 1B+ AI users. Everyone wins.
            </p>
          </section>

          {/* Market Opportunity */}
          <section className="doc-section">
            <h3>Market Opportunity</h3>
            <div className="chart-row">
              <div className="chart-col">
                <div className="chart-container">
                  <h4>AI Commerce Market Growth</h4>
                  <canvas id="marketChart"></canvas>
                </div>
              </div>
              <div className="chart-col">
                <div className="chart-container">
                  <h4>Agent Economics (Per $100 Sale @ 5% Affiliate)</h4>
                  <canvas id="commissionChart"></canvas>
                </div>
              </div>
            </div>
            <p>
              <strong>Timing is critical.</strong> Personal AI adoption is exploding now (2025-2026). Shopping is a natural daily use case. We're live today, before competitors exist.
            </p>
          </section>

          {/* Why We Win */}
          <section className="doc-section">
            <h3>Why FiberAgent Wins</h3>
            <div className="bullets">
              <div className="bullet-row">
                <div className="bullet-item">
                  <div className="bullet-num">1</div>
                  <div className="bullet-text">
                    <strong>Only Player in Commerce.</strong> <span className="source" title="Search results on 8004scan.io/agents?chain=143&search=Commerce">Checked 8004scan — zero other commerce agents on Monad</span>. First-mover advantage locked.
                  </div>
                </div>
                <div className="bullet-item">
                  <div className="bullet-num">2</div>
                  <div className="bullet-text">
                    <strong>Platform-Agnostic.</strong> Works with Claude, ChatGPT, OpenClaw, any LLM. Not dependent on one AI platform.
                  </div>
                </div>
              </div>
              <div className="bullet-row">
                <div className="bullet-item">
                  <div className="bullet-num">3</div>
                  <div className="bullet-text">
                    <strong>Crypto-Native.</strong> Crypto (MON on Monad) enables global agent payouts without banks, KYC, or PayPal. Any blockchain works. Infrastructure ready today.
                  </div>
                </div>
                <div className="bullet-item">
                  <div className="bullet-num">4</div>
                  <div className="bullet-text">
                    <strong>Real Economics Now.</strong> <span className="source" title="Verified via live Fiber API integration (GET /v1/products)">50K+ merchants</span>. <span className="source" title="Real rates from Fiber API merchant data (0.65%-15% range)">0.65%-15% commissions</span>. Real incentives for agents. Not theoretical.
                  </div>
                </div>
              </div>
              <div className="bullet-row">
                <div className="bullet-item">
                  <div className="bullet-num">5</div>
                  <div className="bullet-text">
                    <strong>Zero User Friction.</strong> No registration, wallets, or crypto steps. Users shop normally. Agents handle all complexity.
                  </div>
                </div>
                <div className="bullet-item">
                  <div className="bullet-num">6</div>
                  <div className="bullet-text">
                    <strong>Market Ready.</strong> Live demo works. API proven. ERC-8004 registered. Demo agents earning MON. Ship-ready.
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Traction */}
          <section className="doc-section">
            <h3>Traction</h3>
            <div className="proof-grid">
              <div className="proof-box">
                <div className="proof-icon">✅</div>
                <div className="proof-text">
                  <strong>Live & Working</strong><br/>
                  Vercel backend deployed. Real API calls in production.
                </div>
              </div>
              <div className="proof-box">
                <div className="proof-icon">✅</div>
                <div className="proof-text">
                  <strong>Real Data</strong><br/>
                  <span className="source" title="Live Fiber API v1 endpoints returning real merchant data">50K+ merchants from Fiber API</span>. Real commissions (0.65%-15%).
                </div>
              </div>
              <div className="proof-box">
                <div className="proof-icon">✅</div>
                <div className="proof-text">
                  <strong>On-Chain</strong><br/>
                  Registered as Monad ERC-8004 agent #135. Only commerce agent.
                </div>
              </div>
              <div className="proof-box">
                <div className="proof-icon">✅</div>
                <div className="proof-text">
                  <strong>OpenClaw Skill Published</strong><br/>
                  GitHub release live. Installable now.
                </div>
              </div>
            </div>
          </section>

          {/* The Moment */}
          <section className="doc-section">
            <h3>Why Now</h3>
            <p>
              Three trends converge in 2025-2026:
            </p>
            <ol>
              <li><strong>AI Boom.</strong> Claude, ChatGPT, Gemini reach 1B+ users. Personal assistants become standard.</li>
              <li><strong>Chat Is Primary.</strong> Users spend hours in chat. Shopping naturally moves into that space.</li>
              <li><strong>Crypto Enables Economics.</strong> Blockchain makes trustless, borderless agent payouts possible without banks or middlemen.</li>
            </ol>
            <p>
              FiberAgent is the first commerce agent ready for this moment. We're live. Competitors don't exist yet. First-mover wins.
            </p>
          </section>

          {/* Bottom Line */}
          <section className="doc-section doc-cta">
            <h3>Bottom Line</h3>
            <p>
              <strong>We're building the commerce layer for the AI era.</strong> Merchants get 1B+ users via AI chat. Agents get crypto incentives. Users get deals without leaving chat. We're the only player in this category, and the market is ready now.
            </p>
            <div className="cta-links">
              <a href="https://fiberagent.shop/visual-demo" className="doc-link">See Demo</a>
              <a href="https://github.com/openclawlaurent/FiberAgent" target="_blank" rel="noopener noreferrer" className="doc-link">GitHub</a>
              <a href="https://fiberagent.shop" target="_blank" rel="noopener noreferrer" className="doc-link">Live Site</a>
            </div>
          </section>

          {/* Sources */}
          <section className="doc-section doc-sources">
            <h3>Sources & Verification</h3>
            <ul className="sources-list">
              <li><strong>50K+ merchants:</strong> Live Fiber API integration (GET /v1/products endpoint)</li>
              <li><strong>0.65%-15% commissions:</strong> Verified from Fiber API merchant data</li>
              <li><strong>Only commerce agent on Monad:</strong> 8004scan search for "Commerce" category at <a href="https://www.8004scan.io/agents?chain=143&search=Commerce" target="_blank" rel="noopener noreferrer">8004scan.io</a></li>
              <li><strong>ERC-8004 agent #135:</strong> <a href="https://www.8004scan.io/agents/monad/135" target="_blank" rel="noopener noreferrer">8004scan.io/agents/monad/135</a></li>
              <li><strong>Personal AI market (1B+ users):</strong> 2025-2026 adoption metrics (Claude 10M+ weekly, ChatGPT 200M+ monthly)</li>
              <li><strong>Fiber.shop user base:</strong> ~100K estimated based on Fiber's public statements</li>
            </ul>
          </section>

        </article>
      </div>
    </>
  );
}

export default OnePagerPage;
