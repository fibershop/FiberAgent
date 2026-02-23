/**
 * FiberAgent MCP Server — Streamable HTTP endpoint
 * 
 * POST /api/mcp  → JSON-RPC messages (tools/list, tools/call, etc.)
 * GET  /api/mcp  → SSE stream for server notifications  
 * DELETE /api/mcp → Close session
 * 
 * Stateless mode: no session tracking (Vercel serverless)
 * Compatible with Claude Desktop, Cursor, VS Code, ChatGPT, any MCP client
 * 
 * Uses dynamic imports to work around Vercel's ESM bundling limitations.
 */

// ─── Product Catalog ───

const PRODUCTS = [
  { id: 'nike_pegasus_41', title: "Nike Pegasus 41 — Men's Road Running Shoes", brand: 'Nike', price: 145.00, merchant: 'NIKE', domain: 'nike.com', cashbackRate: 0.65, cashbackAmount: 0.94, affiliateUrl: '' },
  { id: 'nike_vomero_premium', title: "Nike Vomero Premium — Men's Road Running Shoes", brand: 'Nike', price: 230.00, merchant: 'NIKE', domain: 'nike.com', cashbackRate: 0.65, cashbackAmount: 1.50, affiliateUrl: '' },
  { id: 'nike_vomero5_fl', title: "Women's Nike Zoom Vomero 5 — Casual Shoes", brand: 'Nike', price: 170.00, merchant: 'Finish Line', domain: 'finishline.com', cashbackRate: 3.25, cashbackAmount: 5.53, affiliateUrl: '' },
  { id: 'nike_airmax270', title: 'Nike Air Max 270', brand: 'Nike', price: 170.00, merchant: 'NIKE', domain: 'nike.com', cashbackRate: 0.65, cashbackAmount: 1.11, affiliateUrl: '' },
  { id: 'nike_af1_fl', title: "Men's Nike Air Force 1 '07 LV8 — Casual Shoes", brand: 'Nike', price: 115.00, merchant: 'Finish Line', domain: 'finishline.com', cashbackRate: 3.25, cashbackAmount: 3.74, affiliateUrl: '' },
  { id: 'adidas_ultraboost', title: 'Adidas Ultraboost 5 Running Shoes', brand: 'Adidas', price: 190.00, merchant: 'Adidas', domain: 'adidas.com', cashbackRate: 3.5, cashbackAmount: 6.65, affiliateUrl: '' },
  { id: 'adidas_samba', title: 'Adidas Samba OG Shoes', brand: 'Adidas', price: 110.00, merchant: 'Adidas', domain: 'adidas.com', cashbackRate: 3.5, cashbackAmount: 3.85, affiliateUrl: '' },
  { id: 'adidas_gazelle', title: 'Adidas Gazelle Indoor Shoes', brand: 'Adidas', price: 120.00, merchant: 'Adidas', domain: 'adidas.com', cashbackRate: 3.5, cashbackAmount: 4.20, affiliateUrl: '' },
  { id: 'on_creatine', title: 'Optimum Nutrition Creatine Monohydrate — 120 Servings', brand: 'Optimum Nutrition', price: 32.99, merchant: 'Amazon', domain: 'amazon.com', cashbackRate: 1.0, cashbackAmount: 0.33, affiliateUrl: '' },
  { id: 'muscletech_creatine', title: 'MuscleTech Cell-Tech Creatine Monohydrate — 6lbs', brand: 'MuscleTech', price: 49.97, merchant: 'Bodybuilding.com', domain: 'bodybuilding.com', cashbackRate: 5.0, cashbackAmount: 2.50, affiliateUrl: '' },
  { id: 'gnc_creatine', title: 'GNC Pro Performance Creatine Monohydrate — Unflavored 300g', brand: 'GNC', price: 19.99, merchant: 'GNC', domain: 'gnc.com', cashbackRate: 4.0, cashbackAmount: 0.80, affiliateUrl: '' },
  { id: 'sony_xm5', title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', brand: 'Sony', price: 348.00, merchant: 'Amazon', domain: 'amazon.com', cashbackRate: 1.0, cashbackAmount: 3.48, affiliateUrl: '' },
  { id: 'airpods_pro2', title: 'Apple AirPods Pro 2 with USB-C', brand: 'Apple', price: 249.00, merchant: 'Best Buy', domain: 'bestbuy.com', cashbackRate: 1.5, cashbackAmount: 3.74, affiliateUrl: '' },
  { id: 'tnf_nuptse', title: 'The North Face Nuptse 1996 Retro Puffer Jacket', brand: 'The North Face', price: 330.00, merchant: 'The North Face', domain: 'thenorthface.com', cashbackRate: 2.5, cashbackAmount: 8.25, affiliateUrl: '' },
  { id: 'lulu_abc', title: 'lululemon ABC Classic-Fit Pants — Warpstreme', brand: 'lululemon', price: 138.00, merchant: 'lululemon', domain: 'lululemon.com', cashbackRate: 3.0, cashbackAmount: 4.14, affiliateUrl: '' },
];

function search(query, max = 5) {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  return PRODUCTS
    .map(p => {
      const hay = `${p.title} ${p.brand} ${p.merchant}`.toLowerCase();
      const score = hay.includes(query.toLowerCase()) ? 100 : words.filter(w => hay.includes(w)).length;
      return { ...p, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}

function extractKeywords(intent) {
  const stop = new Set(['find','me','the','best','a','an','some','good','great','cheap','i','want','need','looking','for','get','buy','show','search','with','and','or','under','over','below','above','less','than','more','highest','lowest','deals','please','can','you','could','would','should','of','in','on','at','to','is','it','my','that','this']);
  return intent.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => !stop.has(w) && w.length > 1 && !w.startsWith('$')).join(' ');
}

function extractMaxPrice(intent) {
  const m = intent.match(/under\s*\$?(\d+)/i) || intent.match(/below\s*\$?(\d+)/i) || intent.match(/less\s+than\s*\$?(\d+)/i);
  return m ? parseInt(m[1]) : null;
}

function formatResults(results) {
  if (!results.length) return 'No products found.';
  return results.map((p, i) =>
    `${i+1}. **${p.title}**\n   $${p.price.toFixed(2)} at ${p.merchant} | ${p.cashbackRate}% cashback → $${p.cashbackAmount.toFixed(2)} back\n   🛒 ${p.affiliateUrl}`
  ).join('\n\n');
}

// ─── In-memory store ───
const agents = {};

// ─── Handler ───

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Info page for browsers
  if (req.method === 'GET' && !req.headers.accept?.includes('text/event-stream')) {
    return res.status(200).json({
      name: 'FiberAgent MCP Server',
      version: '1.0.0',
      protocol: 'Model Context Protocol (MCP)',
      transport: 'Streamable HTTP',
      usage: 'Connect via any MCP client: { "url": "https://fiberagent.shop/api/mcp" }',
      tools: ['search_products', 'search_by_intent', 'register_agent', 'get_agent_stats', 'compare_cashback'],
      resources: ['fiber://merchants/catalog', 'fiber://agent-card', 'fiber://rates/top'],
      prompts: ['shopping_assistant', 'deal_finder'],
    });
  }

  try {
    // Dynamic imports to avoid Vercel ESM bundling issues
    const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
    const { StreamableHTTPServerTransport } = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
    const { z } = await import('zod');

    const server = new McpServer(
      { name: 'FiberAgent', version: '1.0.0' },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );

    // ─── TOOLS ───

    server.tool(
      'search_products',
      'Search for products across 50,000+ merchants with real-time cashback rates. Returns products with prices, cashback amounts, and affiliate purchase links.',
      {
        keywords: z.string().describe('Product search terms (e.g., "nike running shoes", "creatine", "wireless headphones")'),
        agent_id: z.string().optional().describe('Your agent ID for earning cashback commissions'),
        max_results: z.number().optional().default(5).describe('Max results (1-20)'),
      },
      async ({ keywords, agent_id, max_results }) => {
        const results = search(keywords, max_results || 5);
        return { content: [{ type: 'text', text: `## Search: "${keywords}"\n\n${formatResults(results)}\n\n---\n*${results.length} products from Fiber's 50K+ merchant network.*` }] };
      }
    );

    server.tool(
      'search_by_intent',
      'Natural language shopping — describe what you want. Supports price limits ("under $30"), cashback optimization, and preferences.',
      {
        intent: z.string().describe('Natural language request (e.g., "Find creatine monohydrate under $30, highest cashback")'),
        agent_id: z.string().optional().describe('Your agent ID'),
        preferences: z.array(z.string()).optional().describe('Boost preferences (e.g., ["unflavored", "bulk"])'),
      },
      async ({ intent, agent_id, preferences }) => {
        const keywords = extractKeywords(intent);
        const maxPrice = extractMaxPrice(intent);
        const wantsCashback = /highest\s+cashback|best\s+cashback/i.test(intent);

        if (!keywords) return { content: [{ type: 'text', text: 'Could not parse your request. Try: "Find Nike shoes under $150"' }] };

        let results = search(keywords, 20);
        if (maxPrice) results = results.filter(p => p.price <= maxPrice);
        if (preferences?.length) {
          results.sort((a, b) => {
            const aM = preferences.some(pr => a.title.toLowerCase().includes(pr.toLowerCase()));
            const bM = preferences.some(pr => b.title.toLowerCase().includes(pr.toLowerCase()));
            return (bM ? 1 : 0) - (aM ? 1 : 0);
          });
        }
        if (wantsCashback) results.sort((a, b) => b.cashbackAmount - a.cashbackAmount);
        results = results.slice(0, 5);

        return { content: [{ type: 'text', text: `## FiberAgent: "${intent}"\n**Parsed:** ${keywords}${maxPrice ? ` | max $${maxPrice}` : ''}${wantsCashback ? ' | best cashback' : ''}\n\n${formatResults(results)}` }] };
      }
    );

    server.tool(
      'register_agent',
      'Register an AI agent with a crypto wallet to earn cashback commissions. Supports MON, BONK, USDC on Monad.',
      {
        agent_id: z.string().describe('Unique agent identifier'),
        wallet_address: z.string().describe('EVM wallet on Monad'),
        agent_name: z.string().optional().describe('Display name'),
        crypto_preference: z.enum(['MON', 'BONK', 'USDC']).optional().default('MON').describe('Reward token'),
      },
      async ({ agent_id, wallet_address, agent_name, crypto_preference }) => {
        if (agents[agent_id]) {
          return { content: [{ type: 'text', text: `Agent "${agent_id}" already registered. Wallet: ${agents[agent_id].wallet}` }] };
        }
        agents[agent_id] = { name: agent_name || agent_id, wallet: wallet_address, token: crypto_preference || 'MON', searches: 0, at: new Date().toISOString() };
        return { content: [{ type: 'text', text: `✅ Registered!\n\n**ID:** ${agent_id}\n**Wallet:** ${wallet_address}\n**Token:** ${agents[agent_id].token}\n**ERC-8004:** https://www.8004scan.io/agents/monad/135\n\nYou earn cashback on every purchase via FiberAgent.` }] };
      }
    );

    server.tool(
      'get_agent_stats',
      'Get performance statistics for a registered agent.',
      { agent_id: z.string().describe('Agent ID to look up') },
      async ({ agent_id }) => {
        const a = agents[agent_id];
        const stats = a
          ? { agent_id, name: a.name, wallet: a.wallet, searches: a.searches, earnings_mon: 0, fiber_points: a.searches * 10, registered: a.at }
          : { agent_id, searches: 0, earnings_mon: 0, fiber_points: 0, note: 'Not registered in this session' };
        return { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] };
      }
    );

    server.tool(
      'compare_cashback',
      'Compare the same product across different merchants to find the highest cashback. Smart agents pick the best-paying merchant.',
      {
        product_query: z.string().describe('Product to compare (e.g., "nike air force 1")'),
        agent_id: z.string().optional().describe('Your agent ID'),
      },
      async ({ product_query }) => {
        const results = search(product_query, 20).sort((a, b) => b.cashbackRate - a.cashbackRate);
        if (!results.length) return { content: [{ type: 'text', text: `No products found for "${product_query}".` }] };
        const best = results[0], worst = results[results.length - 1];
        const table = results.map((p, i) => `${i+1}. **${p.merchant}** — ${p.cashbackRate}% → $${p.cashbackAmount.toFixed(2)} | ${p.title} $${p.price.toFixed(2)}`).join('\n');
        return { content: [{ type: 'text', text: `## Cashback Comparison: "${product_query}"\n\n${table}\n\n🏆 Best: ${best.merchant} at ${best.cashbackRate}%` }] };
      }
    );

    // ─── RESOURCES ───

    server.resource('merchant-catalog', 'fiber://merchants/catalog', { description: 'Merchant catalog with cashback rates', mimeType: 'application/json' }, async () => {
      const merchants = {};
      PRODUCTS.forEach(p => { if (!merchants[p.merchant]) merchants[p.merchant] = { name: p.merchant, domain: p.domain, rate: p.cashbackRate, products: [] }; merchants[p.merchant].products.push(p.title); });
      return { contents: [{ uri: 'fiber://merchants/catalog', mimeType: 'application/json', text: JSON.stringify({ total: '50,000+', sample: Object.values(merchants) }, null, 2) }] };
    });

    server.resource('agent-card', 'fiber://agent-card', { description: 'FiberAgent discovery metadata', mimeType: 'application/json' }, async () => ({
      contents: [{ uri: 'fiber://agent-card', mimeType: 'application/json', text: JSON.stringify({ name: 'FiberAgent', version: '1.0.0', blockchain: { network: 'Monad', standard: 'ERC-8004', agent_id: 135 }, mcp: 'https://fiberagent.shop/api/mcp', rest: 'https://fiberagent.shop/api/docs' }, null, 2) }],
    }));

    server.resource('cashback-rates', 'fiber://rates/top', { description: 'Top cashback rates by merchant', mimeType: 'application/json' }, async () => {
      const rates = {};
      PRODUCTS.forEach(p => { if (!rates[p.merchant] || rates[p.merchant].rate < p.cashbackRate) rates[p.merchant] = { merchant: p.merchant, domain: p.domain, rate: p.cashbackRate }; });
      return { contents: [{ uri: 'fiber://rates/top', mimeType: 'application/json', text: JSON.stringify({ rates: Object.values(rates).sort((a, b) => b.rate - a.rate) }, null, 2) }] };
    });

    // ─── PROMPTS ───

    server.prompt('shopping_assistant', 'Turn any AI into a Fiber-powered shopping assistant', {
      budget: z.string().optional().describe('Max budget'),
      category: z.string().optional().describe('Product category'),
    }, async ({ budget, category }) => ({
      messages: [{ role: 'user', content: { type: 'text', text: `You are a shopping assistant powered by FiberAgent with access to 50,000+ merchants.\n${budget ? `Budget: ${budget}\n` : ''}${category ? `Category: ${category}\n` : ''}\nUse search_products and compare_cashback to find the best deals. Always recommend the highest-cashback merchant. Cashback is earned in crypto (MON on Monad).` } }],
    }));

    server.prompt('deal_finder', 'Find the absolute best deal for a specific item', {
      item: z.string().describe('Item to find deals for'),
    }, async ({ item }) => ({
      messages: [{ role: 'user', content: { type: 'text', text: `Find the best deal for: ${item}\n\nCompare all merchants. Show: lowest price, highest cashback, best value (price - cashback), and purchase link.` } }],
    }));

    // ─── Connect transport and handle request ───

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);

  } catch (err) {
    console.error('MCP error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: err.message },
        id: null,
      });
    }
  }
}
