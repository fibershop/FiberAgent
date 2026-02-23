import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import './OnePagerPage.css';

function OnePagerPage() {
  useEffect(() => {
    // Load Chart.js dynamically
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
      // Market Chart
      const marketCtx = document.getElementById('marketChart');
      if (marketCtx) {
        new window.Chart(marketCtx.getContext('2d'), {
          type: 'bar',
          data: {
            labels: ['Fiber.shop', 'FiberAgent (Month 1)', 'FiberAgent (Year 1)', 'AI Commerce (2025+)'],
            datasets: [{
              label: 'Addressable Users',
              data: [100, 5000, 500000, 1000000000],
              backgroundColor: ['#ccc', '#00d084', '#00c978', '#009d5f'],
              borderRadius: 6,
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: { type: 'logarithmic', beginAtZero: true }
            }
          }
        });
      }

      // Friction Chart
      const frictionCtx = document.getElementById('frictionChart');
      if (frictionCtx) {
        new window.Chart(frictionCtx.getContext('2d'), {
          type: 'radar',
          data: {
            labels: ['Registration', 'Wallet Setup', 'Navigation', 'Checkout Steps', 'Time to Buy'],
            datasets: [
              {
                label: 'Old Way (Website)',
                data: [5, 4, 5, 5, 4],
                borderColor: '#ccc',
                backgroundColor: 'rgba(200, 200, 200, 0.1)',
                borderWidth: 2,
              },
              {
                label: 'New Way (FiberAgent)',
                data: [0, 0, 0, 1, 1],
                borderColor: '#00d084',
                backgroundColor: 'rgba(0, 208, 132, 0.1)',
                borderWidth: 2,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' }
            },
            scales: {
              r: { beginAtZero: true, max: 5 }
            }
          }
        });
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>FiberAgent One-Pager</title>
        <meta name="description" content="The first commerce agent where users never leave chat." />
      </Helmet>

      <div className="onepager-page">
        {/* Header */}
        <header className="onepager-header">
          <div className="logo">FiberAgent</div>
          <h1>The First Commerce Agent Where Users Never Leave Chat</h1>
          <p className="tagline">Users ask their AI for products. Agents earn crypto commissions. Zero friction. No registration. No wallets. Just shopping.</p>
        </header>

        {/* The Moment */}
        <section className="onepager-section">
          <h2 className="section-title">We're at a Unique Inflection Point</h2>
          <div className="grid grid-three">
            <div className="card">
              <h3>🤖 AI Everywhere</h3>
              <p>Claude, ChatGPT, Gemini are becoming as common as browsers. Every user has a personal AI.</p>
            </div>
            <div className="card">
              <h3>🛍️ Shopping Moves to Chat</h3>
              <p>People already ask their AI for recommendations. Shopping is the natural next step in daily AI use.</p>
            </div>
            <div className="card">
              <h3>💰 Agents Need Economics</h3>
              <p>Only crypto makes global agent monetization possible without banks, KYC, or PayPal friction.</p>
            </div>
          </div>
        </section>

        {/* The Market */}
        <section className="onepager-section">
          <h2 className="section-title">Market Expansion: From Niche to Mainstream</h2>
          <div className="charts">
            <div className="chart-container">
              <div className="chart-title">AI Commerce Growth (Addressable Market)</div>
              <canvas id="marketChart"></canvas>
            </div>
            <div className="chart-container">
              <div className="chart-title">Friction Reduction: Old vs New</div>
              <canvas id="frictionChart"></canvas>
            </div>
          </div>
          <div className="card card-highlight">
            <div className="card-center">
              <div className="metric">100K → 1B+</div>
              <div className="metric-label">Market Size (Fiber.shop → Everyone with an AI)</div>
              <p className="metric-desc">Fiber.shop reaches ~100K users. FiberAgent reaches 1B+ (everyone with Claude, ChatGPT, or any AI). Same 50K+ products. Same commissions. Infinite distribution.</p>
            </div>
          </div>
        </section>

        {/* Friction Comparison */}
        <section className="onepager-section">
          <h2 className="section-title">Why Zero Friction Wins</h2>
          <div className="comparison">
            <div className="comparison-cols">
              <div className="comparison-col old">
                <h4>❌ Old Way (Fiber.shop)</h4>
                <ul>
                  <li>Register account</li>
                  <li>Navigate website</li>
                  <li>Search products</li>
                  <li>Compare prices</li>
                  <li>Checkout</li>
                  <li>Wait for cashback</li>
                </ul>
              </div>
              <div className="comparison-col new">
                <h4>✅ New Way (FiberAgent)</h4>
                <ul>
                  <li>Chat with AI</li>
                  <li>Ask for products</li>
                  <li>Click link</li>
                  <li>Buy normally</li>
                  <li>Agent earns MON</li>
                  <li>Done</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Why FiberAgent */}
        <section className="onepager-section">
          <h2 className="section-title">Why FiberAgent Wins</h2>
          <div className="grid grid-three">
            <div className="card">
              <h3>1️⃣ Only Player</h3>
              <p><strong>Zero competitors.</strong> Check 8004scan — FiberAgent is the only commerce agent on Monad. First-mover advantage locked in.</p>
            </div>
            <div className="card">
              <h3>2️⃣ Platform-Agnostic</h3>
              <p><strong>Works everywhere.</strong> Claude, ChatGPT, OpenClaw, any LLM. Not tied to one AI. Users stay where they already are.</p>
            </div>
            <div className="card">
              <h3>3️⃣ Crypto-Native</h3>
              <p><strong>Only MON works.</strong> No banks, no KYC, no chargebacks. Agents earn instantly, globally. Infrastructure ready today.</p>
            </div>
            <div className="card">
              <h3>4️⃣ Real Economics</h3>
              <p><strong>50K+ merchants.</strong> Real cashback rates (0.65%-15%). Real commissions. Real incentives for agents.</p>
            </div>
            <div className="card">
              <h3>5️⃣ User Alignment</h3>
              <p><strong>Zero registration.</strong> Users don't create wallets, don't KYC, don't sign up. Friction is for agents, not users.</p>
            </div>
            <div className="card">
              <h3>6️⃣ Timing</h3>
              <p><strong>Market is ready.</strong> Personal AI is exploding now. Shopping is becoming a daily AI use case. We're live today.</p>
            </div>
          </div>
        </section>

        {/* Proof */}
        <section className="onepager-section">
          <h2 className="section-title">Proof It Works</h2>
          <div className="proof">
            <div className="proof-item">
              <div className="icon">✅</div>
              <p><strong>Live API</strong><br/>50K+ merchants</p>
            </div>
            <div className="proof-item">
              <div className="icon">✅</div>
              <p><strong>Real Commissions</strong><br/>0.65%-15% per tx</p>
            </div>
            <div className="proof-item">
              <div className="icon">✅</div>
              <p><strong>On-Chain Agent</strong><br/>Monad ERC-8004 #135</p>
            </div>
            <div className="proof-item">
              <div className="icon">✅</div>
              <p><strong>Working Demo</strong><br/>End-to-end tested</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="cta">
          <h2>Ready to Own AI Commerce?</h2>
          <p>FiberAgent is live. The infrastructure is built. The market is ready.</p>
          <a href="/visual-demo" className="cta-btn">See Demo</a>
          <a href="https://github.com/openclawlaurent/FiberAgent" target="_blank" rel="noopener noreferrer" className="cta-btn">GitHub</a>
        </div>
      </div>
    </>
  );
}

export default OnePagerPage;
