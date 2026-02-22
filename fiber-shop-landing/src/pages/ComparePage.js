import React from 'react';
import { Helmet } from 'react-helmet-async';

const styles = {
  page: { background: '#0a0a0a', color: '#e0e0e0', minHeight: '100vh', padding: '30px 20px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  header: { textAlign: 'center', marginBottom: 28 },
  h1: { fontSize: 28, color: '#fff', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#888' },
  promptBox: { background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, padding: '16px 20px', margin: '20px auto', maxWidth: 750, textAlign: 'left' },
  promptLabel: { fontSize: 11, color: '#00d084', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  promptText: { fontSize: 15, color: '#fff', fontStyle: 'italic' },
  promptNote: { fontSize: 12, color: '#666', marginTop: 6 },
  comparison: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 1200, margin: '0 auto' },
  panel: { borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden' },
  panelBadge: { position: 'absolute', top: 0, right: 0, padding: '6px 16px', borderRadius: '0 14px 0 12px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 },
  sectionLabel: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, margin: '14px 0 8px' },
  bubble: { background: '#111', borderRadius: 12, padding: 14, marginBottom: 10, fontSize: 13, lineHeight: 1.6 },
  productCard: { background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 12, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' },
  noImg: { width: 56, height: 56, background: '#222', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  tag: (bg, fg, border) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: bg, color: fg, border: `1px solid ${border}` }),
  verdict: (color) => ({ marginTop: 14, padding: 14, borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: 600, lineHeight: 1.5, background: `${color}14`, border: `1px solid ${color}4d`, color }),
  savingsBox: { maxWidth: 1200, margin: '24px auto', background: 'linear-gradient(135deg, #1a2a1a 0%, #0a1a0a 100%)', border: '2px solid #00d084', borderRadius: 16, padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, textAlign: 'center' },
  saveLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
  saveValue: (color) => ({ fontSize: 30, fontWeight: 800, color, marginTop: 4 }),
  saveDetail: { fontSize: 11, color: '#aaa', marginTop: 4 },
  footer: { textAlign: 'center', marginTop: 24, color: '#555', fontSize: 12 },
  sourceTag: { display: 'inline-block', background: '#111', border: '1px solid #333', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#888', margin: '4px 2px' },
  catCard: { background: '#0d0d0d', border: '1px solid #222', borderRadius: 10, padding: 16, textAlign: 'center' },
};

function Table({ headers, rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, margin: '8px 0' }}>
      <thead>
        <tr>{headers.map((h, i) => <th key={i} style={{ color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, padding: '6px 4px', textAlign: 'left', borderBottom: '1px solid #333' }}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ color: row.color || '#ccc' }}>
            {row.cells.map((c, j) => <td key={j} style={{ padding: '7px 4px', borderBottom: '1px solid #1a1a1a', fontWeight: row.bold ? 700 : 400 }}>{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ComparePage() {
  return (
    <div style={styles.page}>
      <Helmet>
        <title>FiberAgent vs ChatGPT — AI Shopping Comparison</title>
        <meta name="description" content="Same product, same store, $75 difference. See how FiberAgent adds cashback to every purchase that standard AIs miss." />
      </Helmet>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.h1}>🔍 Same Question. Two AIs. Different Results.</h1>
        <p style={styles.subtitle}>Dyson Airwrap i.d. — standard AI vs AI powered by FiberAgent</p>
        <div style={styles.promptBox}>
          <div style={styles.promptLabel}>💬 Same prompt — sent to both AIs</div>
          <div style={styles.promptText}>"I want the best current deal on a brand-new Dyson Airwrap i.d. (full kit only). No refurbished or limited versions."</div>
          <div style={styles.promptNote}>Tested Feb 22, 2026. Left = ChatGPT 5.2 (real, unedited response). Right = AI with FiberAgent MCP connected.</div>
        </div>
      </div>

      {/* Side by side */}
      <div style={styles.comparison}>

        {/* WITHOUT */}
        <div style={{ ...styles.panel, background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 100%)', border: '2px solid #ff4444' }}>
          <div style={{ ...styles.panelBadge, background: '#ff4444', color: '#fff' }}>❌ Without</div>
          <h2 style={{ fontSize: 18, marginBottom: 3 }}>ChatGPT 5.2 (Standard)</h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Web search + general knowledge — no commerce API</p>

          <div style={styles.sectionLabel}>🔍 ChatGPT's Response (real, unedited)</div>
          <div style={styles.bubble}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#ff6b6b' }}>🤖 ChatGPT 5.2</div>
            <p style={{ marginBottom: 8 }}>Here are the current prices for the Dyson Airwrap i.d.:</p>
            <Table
              headers={['Retailer', 'Price', 'Notes']}
              rows={[
                { cells: ['🥇 Macy\'s', '$499.99', 'Best deal found'], color: '#00d084', bold: true },
                { cells: ['Dyson.com', '$649.99', 'MSRP (some $150 off promos)'] },
                { cells: ['Best Buy', '$649.99', 'Full price'] },
                { cells: ['Sephora / Ulta', '$649.99', 'Rewards points, full price'] },
              ]}
            />
          </div>

          <div style={styles.bubble}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#ff6b6b' }}>🤖 ChatGPT's Recommendation</div>
            <div style={{ borderLeft: '3px solid #333', paddingLeft: 10, margin: '6px 0', color: '#ccc' }}>
              "Buy at Macy's for $499.99 — that's $150 off MSRP. Solid deal, not quite Black Friday level (~$450–$480), but close."
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#888' }}>
              💡 Also suggests:<br />
              <span style={{ color: '#aaa' }}>• Wait for Black Friday for ~$450</span><br />
              <span style={{ color: '#aaa' }}>• Avoid refurbished, eBay, "Origin" versions</span>
            </div>
            <div style={{ marginTop: 10, padding: 8, background: '#1a1010', borderRadius: 6, border: '1px solid #331a1a' }}>
              <span style={{ fontSize: 12, color: '#ff6b6b' }}>💸 Cashback mentioned: <b>None. $0.</b></span>
            </div>
          </div>

          <div style={styles.verdict('#ff4444')}>
            📊 Great price research. Found the $499.99 Macy's deal.<br />
            But <b>zero cashback info</b>. You pay $499.99 and that's it.<br />
            <b>$75 left on the table.</b>
          </div>
        </div>

        {/* WITH */}
        <div style={{ ...styles.panel, background: 'linear-gradient(135deg, #1a1a1a 0%, #1a2a1a 100%)', border: '2px solid #00d084' }}>
          <div style={{ ...styles.panelBadge, background: '#00d084', color: '#000' }}>✅ With FiberAgent</div>
          <h2 style={{ fontSize: 18, marginBottom: 3 }}>AI + FiberAgent (MCP)</h2>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Same deal-finding ability — plus <span style={styles.tag('rgba(74,158,255,0.15)', '#4a9eff', 'rgba(74,158,255,0.3)')}>LIVE CASHBACK DATA</span> from 50K+ merchants</p>

          <div style={styles.sectionLabel}>🔍 FiberAgent's Response</div>
          <div style={styles.bubble}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#00d084' }}>🤖 AI + FiberAgent</div>
            <p>Found the same Macy's deal — but here's what ChatGPT missed:</p>
          </div>

          <div style={{ ...styles.productCard, borderColor: '#1a3a1a' }}>
            <div style={styles.noImg}>🏆</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Dyson Airwrap i.d. Multi-Styler — Macy's</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Same $499.99 deal ChatGPT found — <span style={styles.tag('rgba(0,208,132,0.15)', '#00d084', 'rgba(0,208,132,0.3)')}>+ fiber cashback</span></div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3, textDecoration: 'line-through', color: '#666' }}>$499.99</div>
              <div style={{ fontSize: 14, color: '#00d084', marginTop: 3 }}>💰 <b>15% cashback</b> → <b>$75.00 back in crypto</b></div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#00d084', marginTop: 3 }}>Effective price: <b>$424.99</b></div>
              <div style={{ fontSize: 10, marginTop: 2, color: '#4a9eff' }}>🛒 Tracked affiliate link → your crypto wallet</div>
            </div>
          </div>

          <div style={styles.sectionLabel}>📊 Full Comparison — Price + Cashback</div>
          <div style={{ ...styles.productCard, background: '#0a120a', borderColor: '#1a3a1a' }}>
            <div style={{ flex: 1, padding: '2px 0' }}>
              <Table
                headers={['Retailer', 'Price', 'Cashback', 'You Earn', 'Effective']}
                rows={[
                  { cells: ['🏆 Macy\'s', '$499.99', '15%', '$75.00', '$424.99'], color: '#00d084', bold: true },
                  { cells: ['Dyson.com', '$649.99', '10%', '$65.00', '$584.99'] },
                  { cells: ['Sephora', '$649.99', '5%', '$32.50', '$617.49'] },
                  { cells: ['Best Buy', '$649.99', '~1%', '~$6.50', '$643.49'], color: '#888' },
                ]}
              />
            </div>
          </div>

          <div style={styles.bubble}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#00d084' }}>🤖 FiberAgent's Recommendation</div>
            <div style={{ color: '#00d084' }}>
              "Buy at <b>Macy's for $499.99</b> — same deal ChatGPT found. But go through Fiber and get <b>$75 back (15% cashback)</b> in crypto tokens. Your effective price: <b>$424.99</b>. That's better than Black Friday."
            </div>
          </div>

          <div style={styles.verdict('#00d084')}>
            ✅ Same Macy's deal. <b>$75 cheaper.</b><br />
            🧠 FiberAgent knows Macy's pays 15% — ChatGPT has no idea.<br />
            💰 $424.99 effective beats Black Friday (~$450).<br />
            🔗 One tracked link. Cashback auto-deposited to your wallet.
          </div>
        </div>
      </div>

      {/* Savings */}
      <div style={styles.savingsBox}>
        <div>
          <div style={styles.saveLabel}>ChatGPT's Price</div>
          <div style={styles.saveValue('#ff6b6b')}>$499.99</div>
          <div style={styles.saveDetail}>Great deal — but no cashback</div>
        </div>
        <div>
          <div style={styles.saveLabel}>FiberAgent's Effective Price</div>
          <div style={styles.saveValue('#00d084')}>$424.99</div>
          <div style={styles.saveDetail}>Same store + 15% cashback in crypto</div>
        </div>
        <div>
          <div style={styles.saveLabel}>Money Left on the Table</div>
          <div style={styles.saveValue('#ff6b6b')}>$75</div>
          <div style={styles.saveDetail}>Per purchase, without FiberAgent</div>
        </div>
      </div>

      {/* The point */}
      <div style={{ maxWidth: 800, margin: '20px auto', textAlign: 'center' }}>
        <div style={{ ...styles.bubble, border: '1px solid #333' }}>
          <div style={{ fontSize: 16, color: '#fff', fontWeight: 700, marginBottom: 8 }}>The point isn't finding a different store.</div>
          <div style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6 }}>
            ChatGPT found the right deal. FiberAgent found the <b style={{ color: '#00d084' }}>same deal + $75 back</b>.<br />
            Every AI can search the web. Only an AI connected to Fiber knows the cashback rates<br />
            across 50,000+ merchants — and earns you crypto on every purchase.
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ maxWidth: 1200, margin: '20px auto' }}>
        <div style={{ ...styles.sectionLabel, textAlign: 'center', marginBottom: 12 }}>💡 High cashback across categories — all via Fiber</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { emoji: '🛍️', name: "Macy's", rate: '15%', detail: '$75 back on $500 Dyson' },
            { emoji: '💨', name: 'Dyson', rate: '10%', detail: '$75 back on V15 vacuum' },
            { emoji: '🕶️', name: 'Ray-Ban', rate: '7%', detail: '$14 back on Wayfarers' },
            { emoji: '💄', name: 'Sephora', rate: '5%', detail: '$10 back on $200 haul' },
          ].map((c, i) => (
            <div key={i} style={styles.catCard}>
              <div style={{ fontSize: 28 }}>{c.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 4 }}>{c.name}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#00d084', marginTop: 2 }}>{c.rate}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{c.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p><strong>FiberAgent</strong> — MCP: <code>https://fiberagent.shop/api/mcp</code> | REST: <code>https://fiberagent.shop/api/docs</code> | <a href="https://www.8004scan.io/agents/monad/135" style={{ color: '#00d084', textDecoration: 'none' }}>ERC-8004 #135</a> on Monad</p>
        <p style={{ marginTop: 6 }}>
          <span style={styles.sourceTag}>ChatGPT 5.2 response: real, unedited (Feb 22, 2026)</span>
          <span style={styles.sourceTag}>Cashback rates: CashbackMonitor.com verified (Feb 22, 2026)</span>
          <span style={styles.sourceTag}>Wildfire affiliate network — 50K+ merchants</span>
        </p>
      </div>
    </div>
  );
}
