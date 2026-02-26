import React from 'react';
import { motion } from 'framer-motion';
import './PrivacyPage.css';

export default function PrivacyPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="privacy-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.section className="privacy-hero" variants={itemVariants}>
        <h1>Privacy Policy</h1>
        <p>Your data, your control. Here's how FiberAgent handles information.</p>
        <p className="last-updated">Last updated: February 26, 2026</p>
      </motion.section>

      {/* Content */}
      <motion.div className="privacy-content" variants={itemVariants}>
        <section className="policy-section">
          <h2>1. Overview</h2>
          <p>
            FiberAgent is a Model Context Protocol (MCP) server that integrates AI assistants (like Claude) with the Fiber shopping network. This policy explains what data we collect, how we use it, and your rights.
          </p>
          <p>
            <strong>Key principle:</strong> We collect the minimum data necessary to provide service. Users control their wallet addresses and earnings. We don't sell data.
          </p>
        </section>

        <section className="policy-section">
          <h2>2. Data We Collect</h2>
          
          <h3>2.1 Wallet Address & Token Preference</h3>
          <p>
            <strong>What:</strong> Users provide their blockchain wallet address (0x...) and preferred reward token (MON/BONK/USDC) to search and earn cashback.
          </p>
          <p>
            <strong>Why:</strong> We need the wallet address to track earnings and send commissions. Token preference determines which token users receive.
          </p>
          <p>
            <strong>Stored where:</strong> Wallet addresses are sent directly to Fiber API, not stored by us. They appear in MCP logs for debugging only (logs deleted after 30 days).
          </p>

          <h3>2.2 Search Queries</h3>
          <p>
            <strong>What:</strong> Product search terms (e.g., "running shoes") and intent descriptions.
          </p>
          <p>
            <strong>Why:</strong> Needed to search Fiber's 50,000+ merchant catalog and return relevant results.
          </p>
          <p>
            <strong>Stored where:</strong> Forwarded to Fiber API. We keep server logs for 30 days for debugging.
          </p>

          <h3>2.3 Agent ID & Device ID</h3>
          <p>
            <strong>What:</strong> Unique identifiers assigned when users register (agent_id = auto-generated, device_id = from Fiber API).
          </p>
          <p>
            <strong>Why:</strong> Needed to track which agent made which searches, and to attribute cashback earnings correctly.
          </p>
          <p>
            <strong>Stored where:</strong> Fiber API database (their system of record).
          </p>

          <h3>2.4 Affiliate Link Clicks & Conversions</h3>
          <p>
            <strong>What:</strong> When users click affiliate links and make purchases, Fiber tracks the conversion.
          </p>
          <p>
            <strong>Why:</strong> Fiber uses this to calculate cashback commissions and send earnings to wallets.
          </p>
          <p>
            <strong>Note:</strong> We don't directly track clicks. Fiber's tracking happens via URL parameters (device_id, campaign_id) in the affiliate link.
          </p>

          <h3>2.5 Server Logs</h3>
          <p>
            <strong>What:</strong> Standard HTTP request logs (IP, method, path, timestamp, response status).
          </p>
          <p>
            <strong>Why:</strong> For debugging, monitoring uptime, and detecting abuse.
          </p>
          <p>
            <strong>Retention:</strong> Deleted after 30 days.
          </p>
        </section>

        <section className="policy-section">
          <h2>3. How We Use Data</h2>
          <ul>
            <li><strong>Search:</strong> To return relevant product results from Fiber's catalog.</li>
            <li><strong>Earnings tracking:</strong> To calculate and distribute cashback commissions to user wallets.</li>
            <li><strong>Service improvement:</strong> To analyze search trends and improve search relevance (aggregated, non-identifying).</li>
            <li><strong>Fraud prevention:</strong> To detect and block abuse of the MCP server.</li>
            <li><strong>Debugging:</strong> To investigate errors and issues reported by users.</li>
          </ul>
        </section>

        <section className="policy-section">
          <h2>4. Data Retention</h2>
          <table className="retention-table">
            <thead>
              <tr>
                <th>Data Type</th>
                <th>Stored By</th>
                <th>Retention</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Wallet Address</td>
                <td>Fiber API (primary system)</td>
                <td>Indefinite (needed for earnings)</td>
              </tr>
              <tr>
                <td>Agent/Device IDs</td>
                <td>Fiber API</td>
                <td>Indefinite (needed for tracking)</td>
              </tr>
              <tr>
                <td>Search Logs</td>
                <td>FiberAgent (Vercel logs)</td>
                <td>30 days</td>
              </tr>
              <tr>
                <td>HTTP Request Logs</td>
                <td>Vercel infrastructure</td>
                <td>30 days</td>
              </tr>
              <tr>
                <td>Conversion Data</td>
                <td>Fiber API</td>
                <td>Indefinite (commission records)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="policy-section">
          <h2>5. Data Sharing</h2>
          
          <h3>Who We Share Data With</h3>
          <ul>
            <li>
              <strong>Fiber API:</strong> We send wallet address, search queries, and agent ID to Fiber to retrieve products and track earnings. Fiber is the system of record for all earnings.
            </li>
            <li>
              <strong>No third parties:</strong> We don't sell, rent, or share data with advertisers, data brokers, or other services.
            </li>
            <li>
              <strong>No tracking:</strong> We don't track you across the web or share behavioral data.
            </li>
          </ul>

          <h3>Subpoenas & Legal Requests</h3>
          <p>
            We may be required by law to disclose data (e.g., court order, GDPR request, law enforcement). We will comply with valid legal processes and notify users when possible, unless legally prohibited.
          </p>
        </section>

        <section className="policy-section">
          <h2>6. User Rights</h2>
          
          <h3>6.1 Data Access</h3>
          <p>You can request a copy of your data. Contact us via GitHub Issues.</p>

          <h3>6.2 Data Deletion</h3>
          <p>
            <strong>Important:</strong> Since earnings are tracked by wallet address on Fiber, deleting data may affect your ability to receive cashback commissions. We can delete FiberAgent logs (which we do after 30 days anyway), but earnings records are maintained by Fiber indefinitely.
          </p>

          <h3>6.3 Portability</h3>
          <p>You can retrieve your earnings and agent data from Fiber API using your Agent ID anytime.</p>

          <h3>6.4 Opt-Out</h3>
          <p>Simply stop using FiberAgent. You control your wallet and can revoke permissions at any time.</p>
        </section>

        <section className="policy-section">
          <h2>7. Security</h2>
          <ul>
            <li>All connections use HTTPS encryption (TLS 1.3).</li>
            <li>Wallet addresses are never stored by FiberAgent (only by Fiber API).</li>
            <li>No passwords or private keys are collected or stored.</li>
            <li>Server logs are automatically deleted after 30 days.</li>
            <li>We use rate limiting (100 req/min, 1000 req/hr) to prevent abuse.</li>
          </ul>
          <p>
            <strong>Note:</strong> Users are responsible for securing their own wallet addresses and private keys. Never share your private key with anyone.
          </p>
        </section>

        <section className="policy-section">
          <h2>8. Third-Party Services</h2>
          
          <h3>Fiber API</h3>
          <p>FiberAgent integrates with Fiber's shopping network. See Fiber's privacy policy for their data practices.</p>

          <h3>Vercel (Hosting)</h3>
          <p>FiberAgent is hosted on Vercel. See Vercel's privacy policy for their infrastructure data practices.</p>

          <h3>Claude (Users)</h3>
          <p>If you use FiberAgent via Claude Desktop or Claude API, Anthropic receives your MCP interactions. See Anthropic's privacy policy for their practices.</p>
        </section>

        <section className="policy-section">
          <h2>9. Compliance</h2>
          
          <h3>GDPR (EU Users)</h3>
          <p>
            If you're in the EU, you have the right to access, correct, delete, or port your personal data. To exercise these rights, open an issue on <a href="https://github.com/fibershop/FiberAgent/issues" target="_blank" rel="noopener noreferrer">GitHub</a> with "GDPR Request" in the title.
          </p>
          <p>
            <strong>Response time:</strong> 30 days.
          </p>

          <h3>CCPA (California Users)</h3>
          <p>
            California residents have the right to know what data we collect, delete it, and opt-out of sales. FiberAgent doesn't sell data. To make a request, open an issue on GitHub.
          </p>

          <h3>Other Jurisdictions</h3>
          <p>
            We comply with local privacy laws. If your jurisdiction has specific requirements, contact us via GitHub Issues.
          </p>
        </section>

        <section className="policy-section">
          <h2>10. Children</h2>
          <p>
            FiberAgent is not intended for users under 13. We don't knowingly collect data from children. If we become aware a user is under 13, we will delete their data.
          </p>
        </section>

        <section className="policy-section">
          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this policy. Changes will be posted here with a new "Last updated" date. If material changes affect how we handle your data, we'll notify users via GitHub or email if contact info is provided.
          </p>
        </section>

        <section className="policy-section">
          <h2>12. Contact</h2>
          <p>
            Questions about this privacy policy?
          </p>
          <ul>
            <li><strong>Open an issue:</strong> <a href="https://github.com/fibershop/FiberAgent/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a></li>
            <li><strong>Check:</strong> <a href="https://github.com/fibershop/FiberAgent#support" target="_blank" rel="noopener noreferrer">Support page</a></li>
          </ul>
        </section>

        <section className="policy-section policy-summary">
          <h2>TL;DR</h2>
          <ul>
            <li>✅ We collect only what's needed to provide service (wallet, searches, agent ID)</li>
            <li>✅ Wallet addresses go to Fiber API, not stored by us</li>
            <li>✅ Server logs deleted after 30 days</li>
            <li>✅ We don't sell, track, or share your data</li>
            <li>✅ You control your wallet and earnings</li>
            <li>✅ GDPR/CCPA compliant with user rights honored</li>
            <li>✅ HTTPS encrypted, rate-limited, secure</li>
          </ul>
        </section>
      </motion.div>
    </motion.div>
  );
}
