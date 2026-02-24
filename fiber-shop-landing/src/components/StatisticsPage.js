
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

// NO FAKE DATA - Only real data from Fiber API
// If you see fake data, that's a bug. Report it!

export default function StatisticsPage() {
  const [platformStats, setPlatformStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real data directly from Fiber API (CORS now enabled)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const FIBER_API = 'https://api.fiber.shop/v1';

        // Fetch platform stats
        const platformRes = await fetch(`${FIBER_API}/agent/stats/platform`);
        const platformData = await platformRes.json();
        console.log('Fiber API response:', platformData); // Debug: check what Fiber returns
        setPlatformStats(platformData.stats || platformData);

        // Fetch leaderboard
        const leaderboardRes = await fetch(`${FIBER_API}/agent/stats/leaderboard?limit=10`);
        const leaderboardData = await leaderboardRes.json();
        setLeaderboard(leaderboardData.leaderboard || []);

        // Fetch trends
        const trendsRes = await fetch(`${FIBER_API}/agent/stats/trends?days=30`);
        const trendsData = await trendsRes.json();
        setTrends(trendsData.daily_data || trendsData.data || []);

        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // NO FAKE DATA - Only show real data from Fiber API
  // If data doesn't load, show loading state or error state instead

  // TODO: Once Fiber API includes token logos, remove this hardcoded mapping
  // See: FIBER_API_ENHANCEMENT_PROPOSAL.md
  // Proposed Fiber response should include: { symbol, name, logo_url, color, ... }
  const enrichCashbackTokens = (tokens) => {
    const logoMap = {
      'BONK': bonkLogo,
      'MON': monadLogo,
      'SOL': solanaLogo,
      'CHOG': chogLogo,
      'MF': mfLogo,
      'USDC': usd1Logo,
      'PENGU': penguLogo,
      'VALOR': valorLogo,
      'AOL': aolLogo
    };
    
    return tokens?.map(token => ({
      ...token,
      // Once Fiber provides logo_url, use: logo: token.logo_url ? token.logo_url : null
      logo: logoMap[token.symbol] || null
    })) || null;
  };

  // TODO: Once Fiber API includes category colors, remove this hardcoded mapping
  // See: FIBER_API_ENHANCEMENT_PROPOSAL.md
  // Proposed Fiber response should include: { vertical, color, sales_count, ... }
  const enrichTrendingVerticals = (verticals) => {
    const colorMap = {
      'Electronics': '#00D1FF',
      'Fashion': '#E5FF00',
      'Footwear': '#FF4500',
      'Home & Garden': '#14F195',
      'Home': '#14F195',
      'Beauty': '#FF69B4',
      'Sports & Outdoors': '#7E3AF2',
      'Toys & Games': '#FF4500',
      'Clothing & Apparel': '#E5FF00',
      'Health & Beauty': '#FF69B4'
    };
    
    return verticals?.map(v => ({
      ...v,
      // Once Fiber provides color, use: color: v.color || colorMap[...] as fallback
      color: v.color || colorMap[v.vertical || v.name] || '#00D1FF'
    })) || null;
  };

  // Use real data if available, otherwise use demo data
  const enrichedTokens = platformStats?.dashboard?.cashback_token_ranking 
    ? enrichCashbackTokens(platformStats.dashboard.cashback_token_ranking)
    : null;

  const enrichedVerticals = platformStats?.dashboard?.trending_verticals
    ? enrichTrendingVerticals(platformStats.dashboard.trending_verticals)
    : null;

  const stats = platformStats ? {
    ...platformStats,
    dashboard: {
      ...platformStats.dashboard,
      cashback_token_ranking: enrichedTokens || platformStats.dashboard?.cashback_token_ranking,
      trending_verticals: enrichedVerticals || platformStats.dashboard?.trending_verticals
    }
  } : null;

  // Only show meaningful metrics that have actual data
  // Removed fake "conversions" and "volume" metrics that don't have context

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
            <span className={styles.dot}></span> {loading ? 'Loading...' : 'Live Data'}
          </div>
        </motion.header>

        {/* Loading State */}
        {loading && (
          <motion.div
            className={styles.loadingContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Fetching real-time network data...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            className={styles.errorContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className={styles.errorText}>⚠️ Unable to fetch statistics</p>
            <p className={styles.errorDetail}>{error}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Dashboard Grid (only show when data loaded) */}
        {stats && !loading && (
        <motion.div
          className={styles.dashboardGrid}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Row 1: Network Overview */}
          <motion.div className={styles.metricCard} variants={itemVariants}>
            <div className={styles.cardHeader}>Available Merchants</div>
            <motion.div 
              className={styles.metricValue}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {(stats?.total_merchants_catalog || 0).toLocaleString()}
            </motion.div>
            <div className={styles.metricTrend}>Across the Fiber network</div>
          </motion.div>

          <motion.div className={styles.metricCard} variants={itemVariants}>
            <div className={styles.cardHeader}>Registered Agents</div>
            <motion.div 
              className={styles.metricValue}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {stats?.total_agents_registered || 0}
            </motion.div>
            <div className={styles.metricTrend}>{stats?.active_agents || 0} currently active</div>
          </motion.div>

          <motion.div className={styles.metricCard} variants={itemVariants}>
            <div className={styles.cardHeader}>Total Searches</div>
            <motion.div 
              className={styles.metricValue}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {stats?.total_searches || 0}
            </motion.div>
            <div className={styles.metricTrend}>
              {stats?.searches_today || 0} today · {stats?.searches_this_week || 0} this week
            </div>
          </motion.div>

          {/* Cashback Token Ranking */}
          <motion.div className={`${styles.metricCard} ${styles.scrollCard}`} variants={itemVariants}>
            <div className={styles.cardHeader}>Cashback Token Ranking</div>
            <div className={styles.cashbackList}>
              {stats?.dashboard?.cashback_token_ranking?.map((token, index) => (
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
          {stats?.dashboard?.trending_verticals?.length > 0 && (
          <motion.div className={`${styles.dashboardCard} ${styles.colSpan1}`} variants={itemVariants}>
            <h3 className={styles.cardTitle}>Trending Verticals</h3>
            <div className={styles.verticalChart}>
              {stats?.dashboard?.trending_verticals?.map((v, i) => {
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
          )}

          {stats?.dashboard?.top_performing_brands?.length > 0 && (
          <motion.div className={`${styles.dashboardCard} ${styles.colSpan2}`} variants={itemVariants}>
            <h3 className={styles.cardTitle}>Top Performing Merchants</h3>
            <div className={styles.brandsGrid}>
              {stats?.dashboard?.top_performing_brands?.map((merchant, index) => {
                const merchantName = merchant.merchant || merchant.name;
                const sales = merchant.sales_count !== undefined ? merchant.sales_count : merchant.conversions;
                const maxSales = Math.max(
                  ...(stats?.dashboard?.top_performing_brands || []).map(m => 
                    m.sales_count !== undefined ? m.sales_count : m.conversions
                  ),
                  1
                );
                
                return (
                  <motion.div 
                    key={merchantName} 
                    className={styles.inputCard}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
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
                      <motion.div 
                        className={styles.brandBarFill} 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(sales / maxSales) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.15 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
          )}
        </motion.div>
        )}
      </div>
    </div>
  );
}
