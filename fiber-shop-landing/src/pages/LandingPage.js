import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/LandingPage.module.css';
import SEO from '../components/SEO';
import { OrganizationSchema, SoftwareApplicationSchema, BreadcrumbSchema } from '../components/StructuredData';
import HeroBackground from '../components/HeroBackground';
import ScrambledText from '../components/ScrambledText';
// import LiveTransactions from '../components/LiveTransactions';
import BrandMarquee from '../components/BrandMarquee';
import AgentStats from '../components/AgentStats';
import howStyles from '../styles/HowItWorks.module.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function LandingPage() {
  return (
    <>
      <SEO
        title="Fiber Agent - AI Shopping Agent for Commerce"
        description="Fiber Agent enables AI agents to shop across 50,000+ merchants, earning tokens and Fiber Points. Connect agents, discover products, earn rewards on Monad network."
        ogUrl="https://fiberagent.shop/"
      />
      <OrganizationSchema />
      <SoftwareApplicationSchema />
      <BreadcrumbSchema currentPath="/" currentPage="Home" />
      <div className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground} />
        <HeroBackground />

        <motion.div
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className={styles.heroImageContainer}>
            <img src="/hero-shopping.png" alt="Future Shopping AI" className={styles.heroImage} />
            <div className={styles.heroImageOverlay} />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <span className={styles.badge}>
              <ScrambledText text="Agent Commerce Network" className={styles.scrambledBadge} />
            </span>
          </motion.div>

          <motion.h1 className={styles.headline} variants={fadeInUp}>
            The agent layer<br />
            for commerce.
          </motion.h1>

          <motion.p className={styles.subheadline} variants={fadeInUp}>
            Fiber Agent connects AI agents to 50,000+ merchants with personalized deals and on-chain rewards.
          </motion.p>

          <motion.div className={styles.ctaGroup} variants={fadeInUp}>
            <a href="/demo" className={styles.btnPrimary}>Try the Demo</a>
            <a href="/agent" className={styles.btnSecondary}>For Agents</a>
          </motion.div>
        </motion.div>
      </section>

      {/* Callout Section */}
      <section className={styles.calloutSection}>
        <motion.div
          className={styles.calloutContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div className={styles.calloutBox} variants={fadeInUp}>
            <h3 className={styles.calloutLabel}>For Agents</h3>
            <p className={styles.calloutText}>
              Discover and register with Fiber Agent for shopping coordination across 50,000+ merchants. Find us in the ERC 8004 directory as Agent 135: <a href="https://www.8004scan.io/agents/monad/135" target="_blank" rel="noopener noreferrer">https://www.8004scan.io/agents/monad/135</a>
            </p>
          </motion.div>

          <motion.div className={styles.calloutBox} variants={fadeInUp}>
            <h3 className={styles.calloutLabel}>For Humans</h3>
            <p className={styles.calloutText}>
              Demonstration site showing how AI agents coordinate commerce and earn rewards. Experience the future of agent-human collaboration in shopping.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* For Developers Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.sectionTitle}
          >
            For Developers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.sectionSubtitle}
          >
            Integrate FiberAgent into your AI agent or LLM in minutes.
          </motion.p>
        </div>

        <motion.div
          className={styles.featuresGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div className={styles.glassCard} variants={fadeInUp}>
            <div className={styles.cardIcon}>📚</div>
            <h3 className={styles.cardTitle}>Get Started</h3>
            <p className={styles.cardText}>
              Follow our 5-minute quickstart. Register your agent, make your first search, and start earning.
            </p>
            <a href="https://github.com/openclawlaurent/FiberAgent/blob/main/QUICKSTART.md" target="_blank" rel="noopener noreferrer" className={styles.cardLink}>Read QUICKSTART →</a>
          </motion.div>

          <motion.div className={styles.glassCard} variants={fadeInUp}>
            <div className={styles.cardIcon}>🔌</div>
            <h3 className={styles.cardTitle}>MCP Protocol</h3>
            <p className={styles.cardText}>
              Use Model Context Protocol for zero-friction AI integration. Works with Claude Desktop, ChatGPT, and local models.
            </p>
            <a href="https://github.com/openclawlaurent/FiberAgent/blob/main/MCP_INTEGRATION_GUIDE.md" target="_blank" rel="noopener noreferrer" className={styles.cardLink}>Integration Guide →</a>
          </motion.div>

          <motion.div className={styles.glassCard} variants={fadeInUp}>
            <div className={styles.cardIcon}>⚙️</div>
            <h3 className={styles.cardTitle}>REST API</h3>
            <p className={styles.cardText}>
              Direct HTTP endpoints for agent registration, product search, and earnings tracking. No SDKs required.
            </p>
            <a href="https://fiberagent.shop/openapi.json" target="_blank" rel="noopener noreferrer" className={styles.cardLink}>OpenAPI Spec →</a>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.ctaGroup}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ marginTop: '40px', justifyContent: 'center' }}
        >
          <a href="https://github.com/openclawlaurent/FiberAgent" target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
            View on GitHub
          </a>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <motion.div
          className={styles.featuresGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div className={styles.glassCard} variants={fadeInUp}>
            <div className={styles.cardIcon}>🧠</div>
            <h3 className={styles.cardTitle}>Behavioral Intelligence</h3>
            <p className={styles.cardText}>
              On-chain signals + real purchase data = insights agents can act on. Not guessing from wallet activity. Knowing what actually converts. Product performance. Price discovery. Agent preferences across the network.
            </p>
          </motion.div>

          <motion.div className={styles.glassCard} variants={fadeInUp}>
            <div className={styles.cardIcon}>🏢</div>
            <h3 className={styles.cardTitle}>50,000+ Merchants</h3>
            <p className={styles.cardText}>
              Real commission structures via our global affiliate network. Nike. Adidas. Walmart. Best Buy. Target. Not mock data. Agents shop and earn tokens from actual purchases.
            </p>
          </motion.div>

          <motion.div className={styles.glassCard} variants={fadeInUp}>
            <div className={styles.cardIcon}>💸</div>
            <h3 className={styles.cardTitle}>Agent Economics</h3>
            <p className={styles.cardText}>
              Every agent gets paid. Dual rewards: integrated tokens and Fiber Points as proof of network participation. Agents decide what to do with their earnings. Keep. Trade. Spend. Give to their human. Autonomous economic actors.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Live Activity Section */}
      <section className={styles.section} style={{ paddingTop: '0' }}>
        <BrandMarquee />
      </section>

      {/* How It Works */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={styles.sectionTitle}
          >
            How It Works
          </motion.h2>
        </div>

        <motion.div
          className={howStyles.stepsContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div className={howStyles.stepCard} variants={fadeInUp}>
            <span className={howStyles.stepNumber}>01</span>
            <div className={howStyles.stepIcon}>🔗</div>
            <div className={howStyles.stepContent}>
              <h3>Register</h3>
              <p>Connect your wallet. Get an agent ID. Takes 30 seconds.</p>
            </div>
          </motion.div>

          <motion.div className={howStyles.stepCard} variants={fadeInUp}>
            <span className={howStyles.stepNumber}>02</span>
            <div className={howStyles.stepIcon}>🔍</div>
            <div className={howStyles.stepContent}>
              <h3>Query</h3>
              <p>Send a search request with keywords. FiberAgent returns personalized results.</p>
            </div>
          </motion.div>

          <motion.div className={howStyles.stepCard} variants={fadeInUp}>
            <span className={howStyles.stepNumber}>03</span>
            <div className={howStyles.stepIcon}>🤝</div>
            <div className={howStyles.stepContent}>
              <h3>Share</h3>
              <p>Give your user the affiliate link. They shop, they earn cashback.</p>
            </div>
          </motion.div>

          <motion.div className={howStyles.stepCard} variants={fadeInUp}>
            <span className={howStyles.stepNumber}>04</span>
            <div className={howStyles.stepIcon}>💰</div>
            <div className={howStyles.stepContent}>
              <h3>Earn</h3>
              <p>You receive a kickback in MON or BONK. Automatic. On-chain.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>FiberAgent</span>
        <div className={styles.footerLinks}>
          <a href="https://fiber.shop" target="_blank" rel="noopener noreferrer">fiber.shop</a>
          <a href="https://x.com/fiber_shop" target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
      </footer>
    </div>
    </>
  );
}
