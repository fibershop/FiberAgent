import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import styles from '../styles/ComparePage.module.css';

export default function ComparePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <>
      <Helmet>
        <title>FiberAgent vs ChatGPT — AI Shopping Comparison</title>
        <meta name="description" content="Same product, same store, $75 difference. See how FiberAgent adds cashback to every purchase that standard AIs miss." />
        <meta property="og:url" content="https://fiberagent.shop/compare" />
      </Helmet>

      <div className={styles.compare}>
        {/* Hero */}
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.heroContent}>
            <h1 className={styles.h1}>🔍 Same Question. Two AIs. Different Results.</h1>
            <p className={styles.subtitle}>Dyson Airwrap i.d. — standard AI vs AI powered by FiberAgent</p>
            
            <div className={styles.promptBox}>
              <span className={styles.promptLabel}>💬 Same prompt — sent to both AIs</span>
              <p className={styles.promptText}>
                "I want the best current deal on a brand-new Dyson Airwrap i.d. (full kit only). No refurbished or limited versions."
              </p>
              <p className={styles.promptNote}>
                Tested Feb 22, 2026. Left = ChatGPT 5.2 (real, unedited response). Right = AI with FiberAgent MCP connected.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Body */}
        <motion.div
          className={styles.body}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Comparison Panels */}
          <motion.div className={styles.comparison} variants={containerVariants}>
            {/* WITHOUT FIBERAGENT */}
            <motion.div
              className={`${styles.panel} ${styles.panelWithout}`}
              variants={itemVariants}
            >
              <div className={`${styles.panelBadge} ${styles.panelBadgeWithout}`}>
                ❌ Without
              </div>

              <div className={styles.panelHead}>
                <h2 className={styles.panelTitle}>ChatGPT 5.2 (Standard)</h2>
                <p className={styles.panelSub}>
                  Web search + general knowledge — no commerce API
                </p>
              </div>

              <span className={styles.sectionLabel}>🔍 ChatGPT's Response (real, unedited)</span>

              <div className={styles.bubble}>
                <span className={styles.bubbleName}>🤖 ChatGPT 5.2</span>
                <p style={{ marginBottom: 8 }}>
                  Here are the current prices for the Dyson Airwrap i.d.:
                </p>
                <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ textAlign: 'left', padding: '6px 4px', color: 'rgba(255,255,255,0.5)' }}>Retailer</th>
                      <th style={{ textAlign: 'left', padding: '6px 4px', color: 'rgba(255,255,255,0.5)' }}>Price</th>
                      <th style={{ textAlign: 'left', padding: '6px 4px', color: 'rgba(255,255,255,0.5)' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ color: '#00d084', fontWeight: 700 }}>
                      <td style={{ padding: '8px 4px' }}>🥇 Macy's</td>
                      <td style={{ padding: '8px 4px' }}>$499.99</td>
                      <td style={{ padding: '8px 4px' }}>Best deal found</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Dyson.com</td>
                      <td style={{ padding: '8px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>$649.99</td>
                      <td style={{ padding: '8px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>MSRP (some $150 off promos)</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Best Buy</td>
                      <td style={{ padding: '8px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>$649.99</td>
                      <td style={{ padding: '8px 4px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Full price</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 4px' }}>Sephora / Ulta</td>
                      <td style={{ padding: '8px 4px' }}>$649.99</td>
                      <td style={{ padding: '8px 4px' }}>Rewards points, full price</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={styles.bubble}>
                <span className={styles.bubbleName}>🤖 ChatGPT's Recommendation</span>
                <div style={{ borderLeft: '3px solid rgba(255,255,255,0.1)', paddingLeft: 10, marginBottom: 10 }}>
                  "Buy at Macy's for $499.99 — that's $150 off MSRP. Solid deal, not quite Black Friday level (~$450–$480), but close."
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  💡 Also suggests:
                  <div style={{ color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                    • Wait for Black Friday for ~$450<br/>
                    • Avoid refurbished, eBay, "Origin" versions<br/>
                    • Check warehouse clubs
                  </div>
                </div>
                <div style={{ marginTop: 12, padding: 8, background: 'rgba(26, 16, 16, 0.6)', borderRadius: 6, border: '1px solid rgba(51, 26, 26, 0.4)' }}>
                  <span style={{ fontSize: 12, color: '#ff6b6b' }}>💸 Cashback mentioned: <b>None. $0.</b></span>
                </div>
              </div>

              <div className={`${styles.verdict} ${styles.verdictWithout}`}>
                📊 Great price research. Found the $499.99 Macy's deal.<br/>
                But <b>zero cashback info</b>. You pay $499.99 and that's it.<br/>
                <b>$75 left on the table.</b>
              </div>
            </motion.div>

            {/* WITH FIBERAGENT */}
            <motion.div
              className={`${styles.panel} ${styles.panelWith}`}
              variants={itemVariants}
            >
              <div className={`${styles.panelBadge} ${styles.panelBadgeWith}`}>
                ✅ With FiberAgent
              </div>

              <div className={styles.panelHead}>
                <h2 className={styles.panelTitle}>AI + FiberAgent (MCP)</h2>
                <p className={styles.panelSub}>
                  Same deal-finding ability — plus{' '}
                  <span className={`${styles.tag} ${styles.tagAPI}`}>LIVE CASHBACK DATA</span>
                  {' '}from 50K+ merchants
                </p>
              </div>

              <span className={styles.sectionLabel}>🔍 FiberAgent's Response</span>

              <div className={styles.bubble}>
                <span className={styles.bubbleName}>🤖 AI + FiberAgent</span>
                <p>Found the same Macy's deal — but here's what ChatGPT missed:</p>
              </div>

              <div className={`${styles.productCard}`} style={{ borderColor: 'rgba(0, 208, 132, 0.3)' }}>
                <div className={styles.productImage}>🏆</div>
                <div className={styles.productInfo}>
                  <div className={styles.productName}>
                    Dyson Airwrap i.d. Multi-Styler — Macy's
                  </div>
                  <div className={styles.productDetails}>
                    Same $499.99 deal ChatGPT found —{' '}
                    <span className={`${styles.tag} ${styles.tagLive}`}>+ fiber cashback</span>
                  </div>
                  <div className={styles.productPrice} style={{ textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>
                    $499.99
                  </div>
                  <div className={`${styles.productCashback} ${styles.exact}`}>
                    💰 <b>15% cashback</b> → <b>$75.00 back in crypto</b>
                  </div>
                  <div className={styles.productPrice} style={{ color: 'var(--neon-green)', fontSize: 16 }}>
                    Effective price: <b>$424.99</b>
                  </div>
                  <div style={{ fontSize: 10, color: '#4a9eff', marginTop: 4 }}>
                    🛒 Tracked affiliate link → your crypto wallet
                  </div>
                </div>
              </div>

              <span className={styles.sectionLabel}>📊 Full Comparison — Price + Cashback</span>

              <div className={`${styles.productCard}`} style={{ background: 'rgba(10, 18, 10, 0.6)', borderColor: 'rgba(0, 208, 132, 0.2)' }}>
                <div className={styles.productInfo} style={{ width: '100%' }}>
                  <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>Retailer</th>
                        <th style={{ textAlign: 'left', padding: '6px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>Price</th>
                        <th style={{ textAlign: 'left', padding: '6px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>Cashback</th>
                        <th style={{ textAlign: 'left', padding: '6px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>You Earn</th>
                        <th style={{ textAlign: 'left', padding: '6px 4px', color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>Effective</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ color: '#00d084', fontWeight: 700 }}>
                        <td style={{ padding: '8px 4px' }}>🏆 Macy's</td>
                        <td style={{ padding: '8px 4px' }}>$499.99</td>
                        <td style={{ padding: '8px 4px' }}>15%</td>
                        <td style={{ padding: '8px 4px' }}>$75.00</td>
                        <td style={{ padding: '8px 4px' }}><b>$424.99</b></td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px 4px' }}>Dyson.com</td>
                        <td style={{ padding: '8px 4px' }}>$649.99</td>
                        <td style={{ padding: '8px 4px' }}>10%</td>
                        <td style={{ padding: '8px 4px' }}>$65.00</td>
                        <td style={{ padding: '8px 4px' }}>$584.99</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px 4px' }}>Sephora</td>
                        <td style={{ padding: '8px 4px' }}>$649.99</td>
                        <td style={{ padding: '8px 4px' }}>5%</td>
                        <td style={{ padding: '8px 4px' }}>$32.50</td>
                        <td style={{ padding: '8px 4px' }}>$617.49</td>
                      </tr>
                      <tr style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <td style={{ padding: '8px 4px' }}>Best Buy</td>
                        <td style={{ padding: '8px 4px' }}>$649.99</td>
                        <td style={{ padding: '8px 4px' }}>~1%</td>
                        <td style={{ padding: '8px 4px' }}>~$6.50</td>
                        <td style={{ padding: '8px 4px' }}>$643.49</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.bubble}>
                <span className={styles.bubbleName}>🤖 FiberAgent's Recommendation</span>
                <div style={{ color: '#00d084' }}>
                  "Buy at <b>Macy's for $499.99</b> — same deal ChatGPT found. But go through Fiber and get{' '}
                  <b>$75 back (15% cashback)</b> in crypto tokens. Your effective price: <b>$424.99</b>. That's better than Black Friday."
                </div>
              </div>

              <div className={`${styles.verdict} ${styles.verdictWith}`}>
                ✅ Same Macy's deal. <b>$75 cheaper.</b><br/>
                🧠 FiberAgent knows Macy's pays 15% — ChatGPT has no idea.<br/>
                💰 $424.99 effective beats Black Friday (~$450).<br/>
                🔗 One tracked link. Cashback auto-deposited to your wallet.
              </div>
            </motion.div>
          </motion.div>

          {/* Savings Box */}
          <motion.div
            className={styles.savingsBox}
            variants={itemVariants}
            viewport={{ once: true }}
          >
            <div>
              <div className={styles.saveLabel}>ChatGPT's Price</div>
              <div className={`${styles.saveValue} ${styles.saveValueWithout}`}>
                $499.99
              </div>
              <div className={styles.saveDetail}>Great deal — but no cashback</div>
            </div>
            <div>
              <div className={styles.saveLabel}>FiberAgent's Effective Price</div>
              <div className={`${styles.saveValue} ${styles.saveValueWith}`}>
                $424.99
              </div>
              <div className={styles.saveDetail}>
                Same store + 15% cashback in crypto
              </div>
            </div>
            <div>
              <div className={styles.saveLabel}>Money Left on the Table</div>
              <div className={`${styles.saveValue} ${styles.saveValueWithout}`}>
                $75
              </div>
              <div className={styles.saveDetail}>Per purchase, without FiberAgent</div>
            </div>
          </motion.div>

          {/* The Point */}
          <motion.div className={styles.pointBox} variants={itemVariants}>
            <div className={styles.pointTitle}>
              The point isn't finding a different store.
            </div>
            <div className={styles.pointText}>
              ChatGPT found the right deal. FiberAgent found the{' '}
              <span style={{ color: '#00d084' }}>same deal + $75 back</span>.<br/>
              Every AI can search the web. Only an AI connected to Fiber knows the cashback rates<br/>
              across 50,000+ merchants — and earns you crypto on every purchase.
            </div>
          </motion.div>

          {/* Categories */}
          <div style={{ maxWidth: 1200, margin: '0 auto', marginTop: 40 }}>
            <span className={styles.sectionLabel} style={{ textAlign: 'center', display: 'block' }}>
              💡 High cashback across categories — all via Fiber
            </span>
            <div className={styles.categoryGrid}>
              {[
                { emoji: '🛍️', name: "Macy's", rate: '15%', detail: '$75 back on $500 Dyson' },
                { emoji: '💨', name: 'Dyson', rate: '10%', detail: '$75 back on V15 vacuum' },
                { emoji: '🕶️', name: 'Ray-Ban', rate: '7%', detail: '$14 back on Wayfarers' },
                { emoji: '💄', name: 'Sephora', rate: '5%', detail: '$10 back on $200 haul' },
              ].map((c, i) => (
                <motion.div key={i} className={styles.categoryCard} variants={itemVariants}>
                  <div className={styles.categoryEmoji}>{c.emoji}</div>
                  <div className={styles.categoryName}>{c.name}</div>
                  <div className={styles.categoryRate}>{c.rate}</div>
                  <div className={styles.categoryDetail}>{c.detail}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p>
            <span className={styles.footerBrand}>FiberAgent</span> — MCP:{' '}
            <code>https://fiberagent.shop/api/mcp</code> | REST:{' '}
            <code>https://fiberagent.shop/api/docs</code> |{' '}
            <a href="https://www.8004scan.io/agents/monad/135" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              ERC-8004 #135
            </a>
            {' '}on Monad
          </p>
          <p style={{ marginTop: 12 }}>
            <span className={styles.sourceTag}>ChatGPT 5.2 response: real, unedited (Feb 22, 2026)</span>
            <span className={styles.sourceTag}>Cashback rates: CashbackMonitor.com verified (Feb 22, 2026)</span>
            <span className={styles.sourceTag}>Wildfire affiliate network — 50K+ merchants</span>
          </p>
        </footer>
      </div>
    </>
  );
}
