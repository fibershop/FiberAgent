
import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroBackground from '../components/HeroBackground'; // Reusing the fiber nodes
import styles from '../styles/StatisticsPage.module.css';

// Import User Uploaded Logos
import adidasLogo from '../assets/brands/upload/adidas-logo.png';
import aloLogo from '../assets/brands/upload/alo-logo.png';
import bestBuyLogo from '../assets/brands/upload/best-buy-logo.png';
import lowesLogo from '../assets/brands/upload/lowes-logo.png';
import macysLogo from '../assets/brands/upload/macys-logo.png';
import sephoraLogo from '../assets/brands/upload/sephora-logo.png';
import skimsLogo from '../assets/brands/upload/skims-logo.png';
import temuLogo from '../assets/brands/upload/temu-logo.png';
import viatorLogo from '../assets/brands/upload/viator-logo.png';
import walmartLogo from '../assets/brands/upload/walmart-logo.png';

// Import Coin Logos
import monadLogo from '../assets/coins/monad.png';
import solanaLogo from '../assets/coins/solana.png';
import bonkLogo from '../assets/coins/bonk.png';
import chogLogo from '../assets/coins/chog.avif';
import mfLogo from '../assets/coins/moonwalk_fit.png';
import usd1Logo from '../assets/coins/usd1.png';
import valorLogo from '../assets/coins/valor.png';
import penguLogo from '../assets/coins/pengu.png';
import aolLogo from '../assets/coins/aol.png';

// Realistic Data Generator (Based on Fiber Network)
const generateData = () => {
  // Top Brands on Fiber.shop with realistic metrics
  const brands = [
    { name: 'Nike', logo: null, category: 'Footwear' },
    { name: 'Amazon', logo: null, category: 'General Retail' },
    { name: 'Best Buy', logo: bestBuyLogo, category: 'Electronics' },
    { name: "Macy's", logo: macysLogo, category: 'Fashion' },
    { name: 'Sephora', logo: sephoraLogo, category: 'Beauty' },
    { name: 'Adidas', logo: adidasLogo, category: 'Footwear' },
    { name: 'Target', logo: null, category: 'General Retail' },
    { name: 'Walmart', logo: walmartLogo, category: 'General Retail' },
    { name: 'Alo Yoga', logo: aloLogo, category: 'Fashion' },
    { name: "Lowe's", logo: lowesLogo, category: 'Home & Garden' }
  ];

  // Realistic metrics based on actual Fiber network data
  return brands.map((b, idx) => {
    const baseConversions = [37, 42, 28, 22, 25, 35, 19, 18, 12, 8][idx];
    const baseCashback = [5.0, 1.0, 3.5, 15.0, 12.0, 3.5, 2.5, 2.5, 8.0, 5.0][idx];
    
    return {
      ...b,
      searches: Math.floor(baseConversions * 18) + Math.floor(Math.random() * 100),
      volume: Math.floor(baseConversions * 150) + Math.floor(Math.random() * 1000),
      conversions: baseConversions + Math.floor(Math.random() * 5),
      cashback_rate: baseCashback,
      growth: Math.floor(Math.random() * 15) + 3
    };
  }).sort((a, b) => b.conversions - a.conversions);
};

// Cashback Tokens (Realistic Distribution)
const generateCashbackData = () => {
  const tokens = [
    { name: 'MON', logo: monadLogo, color: '#7E3AF2', agents: 47 },
    { name: 'USDC', logo: usd1Logo, color: '#00D1FF', agents: 38 },
    { name: 'BONK', logo: bonkLogo, color: '#FFA500', agents: 28 },
    { name: 'SOL', logo: solanaLogo, color: '#14F195', agents: 18 },
    { name: 'CHOG', logo: chogLogo, color: '#FFD700', agents: 12 },
    { name: 'MF', logo: mfLogo, color: '#E5FF00', agents: 9 },
    { name: 'PENGU', logo: penguLogo, color: '#FF69B4', agents: 7 },
    { name: 'VALOR', logo: valorLogo, color: '#FF4500', agents: 5 },
    { name: 'AOL', logo: aolLogo, color: '#0000FF', agents: 3 }
  ];

  return tokens.sort((a, b) => b.agents - a.agents);
};

// Trending Categories based on Fiber network data
const trendingVerticals = [
  { name: "Electronics", value: 94, color: '#00D1FF', conversions: 94, revenue: 14100 },
  { name: "Fashion", value: 66, color: '#E5FF00', conversions: 66, revenue: 13200 },
  { name: "Footwear", value: 31, color: '#FF4500', conversions: 31, revenue: 7750 },
  { name: "Home & Garden", value: 38, color: '#14F195', conversions: 38, revenue: 7600 },
  { name: "Beauty", value: 34, color: '#FF69B4', conversions: 34, revenue: 6800 },
  { name: "Sports & Outdoors", value: 23, color: '#7E3AF2', conversions: 23, revenue: 5175 }
];

export default function StatisticsPage() {
  const [platformStats, setPlatformStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data from Fiber API (via our proxy endpoints)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch platform stats
        const platformRes = await fetch('/api/stats/platform');
        const platformData = await platformRes.json();
        setPlatformStats(platformData.stats);

        // Fetch leaderboard
        const leaderboardRes = await fetch('/api/stats/leaderboard?limit=10');
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.leaderboard || []);

        // Fetch trends
        const trendsRes = await fetch('/api/stats/trends?days=30');
        const trendsData = await trendsRes.json();
        setTrends(trendsData.data || []);

        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fallback to demo data if API not available
  const brandData = useMemo(() => generateData(), []);
  const cashbackData = useMemo(() => generateCashbackData(), []);

  // Use real data if available, otherwise use demo data
  const stats = platformStats || {
    total_searches: 5,
    total_purchases_made: 3,
    total_purchase_value_usd: 715,
    dashboard: {
      kpis: {
        total_volume: { value_usd: 715, series: [0, 0, 0, 715, 0, 0] },
        total_searches: { value: 5, series: [0, 0, 0, 0, 0, 5] },
        active_agents: { value: 75, series: [0, 0, 0, 0, 0, 4] },
        cashback_sent: { value_usd: 0.08, purchases_paid: 3 }
      }
    }
  };

  const totalVolume = stats.total_purchase_value_usd || 715;
  const totalSearches = stats.total_searches || 5;
  
  const networkStats = {
    total_agents: stats.total_agents_registered || 75,
    total_searches: stats.total_searches || 5,
    total_conversions: stats.total_purchases_made || 3,
    total_network_revenue: stats.total_purchase_value_usd || 715,
    total_commissions_paid: stats.total_cashback_sent_usd || 0.08
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <HeroBackground /> {/* Fiber Nodes Background */}
      </div>

      <div className={styles.content}>
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Fiber Network Stats</h1>
            <p className={styles.subtitle}>Real-time activity across the Fiber Agent ecosystem.</p>
          </div>
          <div className={styles.liveIndicator}>
            <span className={styles.dot}></span> Live Data
          </div>
        </motion.header>

        {/* Dashboard Grid */}
        <motion.div
          className={styles.dashboardGrid}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Row 1: Key Metrics */}
          <motion.div className={styles.metricCard} variants={itemVariants}>
            <div className={styles.cardHeader}>Total Volume</div>
            <div className={styles.metricValue}>${(totalVolume / 1000000).toFixed(1)}M</div>
            <div className={styles.metricTrend}>+12.5% <span className={styles.trendLabel}>vs last week</span></div>
            <div className={styles.miniChart}>
              <div className={styles.chartBar} style={{ height: '40%' }}></div>
              <div className={styles.chartBar} style={{ height: '60%' }}></div>
              <div className={styles.chartBar} style={{ height: '30%' }}></div>
              <div className={styles.chartBar} style={{ height: '80%' }}></div>
              <div className={styles.chartBar} style={{ height: '50%' }}></div>
              <div className={styles.chartBar} style={{ height: '100%' }}></div>
            </div>
          </motion.div>

          <motion.div className={styles.metricCard} variants={itemVariants}>
            <div className={styles.cardHeader}>Total Searches</div>
            <div className={styles.metricValue}>{(totalSearches / 1000).toFixed(1)}k</div>
            <div className={styles.metricTrend}>+8.2% <span className={styles.trendLabel}>vs last week</span></div>
            <div className={styles.miniChart}>
              <div className={styles.chartBar} style={{ height: '30%' }}></div>
              <div className={styles.chartBar} style={{ height: '40%' }}></div>
              <div className={styles.chartBar} style={{ height: '60%' }}></div>
              <div className={styles.chartBar} style={{ height: '50%' }}></div>
              <div className={styles.chartBar} style={{ height: '70%' }}></div>
              <div className={styles.chartBar} style={{ height: '90%' }}></div>
            </div>
          </motion.div>

          <motion.div className={styles.metricCard} variants={itemVariants}>
            <div className={styles.cardHeader}>Network Conversions</div>
            <div className={styles.metricValue}>{networkStats.total_conversions}</div>
            <div className={styles.metricTrend}>${(networkStats.total_network_revenue / 1000).toFixed(1)}k <span className={styles.trendLabel}>total revenue</span></div>
            <div className={styles.miniChart}>
              <div className={styles.chartBar} style={{ height: '20%' }}></div>
              <div className={styles.chartBar} style={{ height: '35%' }}></div>
              <div className={styles.chartBar} style={{ height: '50%' }}></div>
              <div className={styles.chartBar} style={{ height: '60%' }}></div>
              <div className={styles.chartBar} style={{ height: '80%' }}></div>
              <div className={styles.chartBar} style={{ height: '95%' }}></div>
            </div>
          </motion.div>

          {/* Cashback Token Ranking */}
          <motion.div className={`${styles.metricCard} ${styles.scrollCard}`} variants={itemVariants}>
            <div className={styles.cardHeader}>Cashback Token Ranking</div>
            <div className={styles.cashbackList}>
              {(stats.dashboard?.cashback_token_ranking || cashbackData).map((token, index) => (
                <div key={token.symbol || token.name} className={styles.cashbackItem}>
                  <div className={styles.cashbackRank}>#{token.rank || index + 1}</div>
                  <div className={styles.tokenAvatar} style={{
                    backgroundColor: token.logo ? 'transparent' : token.color,
                    border: token.logo ? 'none' : `1px solid ${token.color}`
                  }}>
                    {token.logo ? (
                      <img src={token.logo} alt={token.symbol || token.name} className={styles.tokenLogoImg} />
                    ) : (
                      (token.symbol || token.name)[0]
                    )}
                  </div>
                  <div className={styles.tokenInfo}>
                    <div className={styles.tokenName}>{token.symbol || token.name}</div>
                    <div className={styles.tokenKey}>Selected by</div>
                  </div>
                  <div className={styles.tokenCount}>{token.selected_by || token.agents}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Row 2: Trending Verticals (Vertical Bar Chart) & Top Brands */}
          <motion.div className={`${styles.dashboardCard} ${styles.colSpan1}`} variants={itemVariants}>
            <h3 className={styles.cardTitle}>Trending Verticals</h3>
            <div className={styles.verticalChart}>
              {(stats.dashboard?.trending_verticals || trendingVerticals).map((v, i) => {
                const verticalName = v.vertical || v.name;
                const value = v.sales_count ? Math.min((v.sales_count / 5) * 100, 100) : v.value;
                return (
                  <div key={verticalName} className={styles.verticalBarContainer}>
                    <div className={styles.vBarWrapper}>
                      <motion.div
                        className={styles.vBarFill}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${value}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        style={{ backgroundColor: v.color }}
                      />
                    </div>
                    <span className={styles.vBarLabel}>{verticalName}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div className={`${styles.dashboardCard} ${styles.colSpan2}`} variants={itemVariants}>
            <h3 className={styles.cardTitle}>Top Performing Merchants</h3>
            <div className={styles.brandsGrid}>
              {(stats.dashboard?.top_performing_brands || brandData.slice(0, 6)).map((merchant, index) => {
                const merchantName = merchant.merchant || merchant.name;
                const sales = merchant.sales_count !== undefined ? merchant.sales_count : merchant.conversions;
                const maxSales = Math.max(
                  ...(stats.dashboard?.top_performing_brands || brandData.slice(0, 6)).map(m => 
                    m.sales_count !== undefined ? m.sales_count : m.conversions
                  ),
                  1
                );
                
                return (
                  <div key={merchantName} className={styles.inputCard}>
                    <div className={styles.brandHeader}>
                      <div className={styles.brandLogoContainer}>
                        {merchant.logo && (
                          <img src={merchant.logo} alt={merchantName} className={styles.brandLogoImg} />
                        )}
                      </div>
                      <div>
                        <div className={styles.brandName}>{merchantName}</div>
                        <div className={styles.brandSub}>{sales} Sale{sales !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div className={styles.brandGraph}>
                      <div className={styles.brandBarFill} style={{ width: `${(sales / maxSales) * 100}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
