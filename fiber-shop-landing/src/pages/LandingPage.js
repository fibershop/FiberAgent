import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/LandingPage.module.css';
import HeroBackground from '../components/HeroBackground';
import ScrambledText from '../components/ScrambledText';
import LiveTransactions from '../components/LiveTransactions';
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



      {/* Live Helper Text currently active */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ marginBottom: '60px', marginTop: '20px' }}
      >
        <LiveTransactions />
      </motion.div>

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
              On-chain signals + real purchase data = deals that actually convert.
              Not guessing from an NFT. Knowing they bought running shoes last month.
            </p>
          </motion.div>

          <motion.div className={styles.glassCard} variants={fadeInUp}>
            <div className={styles.cardIcon}>🏢</div>
            <h3 className={styles.cardTitle}>50,000+ Merchants</h3>
            <p className={styles.cardText}>
              Real commission structures via our global affiliate network.
              Nike. Adidas. Walmart. Not mock data.
            </p>
          </motion.div>

          <motion.div className={styles.glassCard} variants={fadeInUp}>
            <div className={styles.cardIcon}>💸</div>
            <h3 className={styles.cardTitle}>Agent Economics</h3>
            <p className={styles.cardText}>
              Every agent in the chain gets paid. Kickbacks flow automatically.
              No contracts. No negotiations. Just code.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Live Activity Section */}
      <section className={styles.section} style={{ paddingTop: '0' }}>
        <BrandMarquee />
      </section>

      {/* COMMENTED OUT: How It Works section - will restore in a few days
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
      */}

      {/* Footer */}
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>FiberAgent</span>
        <div className={styles.footerLinks}>
          <a href="https://fiber.shop" target="_blank" rel="noopener noreferrer">fiber.shop</a>
          <a href="https://x.com/fiber_shop" target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
      </footer>
    </div>
  );
}
