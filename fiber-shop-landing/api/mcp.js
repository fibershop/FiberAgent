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

const FIBER_API = 'https://api.fiber.shop/v1';
const BASE_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://fiberagent.shop';

// ─── Search via our backend /api/agent/search (handles Fiber API + Fallback) ───

async function searchViaBackend(keywords, agentId = 'mcp-user', limit = 10) {
  try {
    const params = new URLSearchParams({
      keywords,
      agent_id: agentId,
      size: String(limit)
    });

    const response = await fetch(`${BASE_URL}/api/agent/search?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      console.error(`Backend search returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Our backend already normalizes Fiber API response
    if (data.results && Array.isArray(data.results)) {
      return data.results.map(p => ({
        id: p.productId || p.id,
        title: p.title,
        brand: p.brand || '',
        price: p.price || 0,
        merchant: p.shop?.name || 'Unknown',
        domain: p.shop?.domain || '',
        cashbackRate: p.cashback?.rate ? parseFloat(p.cashback.rate) : 0,
        cashbackAmount: p.cashback?.amount || 0,
        // ⚠️ CRITICAL: Real Fiber affiliate links (with tracking ID + device ID)
        affiliateUrl: p.affiliateUrl || null,
        image: p.image || null,
        inStock: p.inStock !== false,
        url: p.url || null
      }));
    }

    return null;
  } catch (err) {
    console.error('Backend search error:', err.message);
    return null;
  }
}

// ─── Fallback Mock Catalog (for demo when API unavailable) ───

const FALLBACK_PRODUCTS = [
  { id: 'nike_pegasus_41', title: "Nike Pegasus 41 — Men's Road Running Shoes", brand: 'Nike', price: 145.00, merchant: 'NIKE', domain: 'nike.com', cashbackRate: 0.65, cashbackAmount: 0.94, affiliateUrl: 'https://api.fiber.shop/r/w?c=nike_pegasus_41' },
  { id: 'nike_vomero_premium', title: "Nike Vomero Premium — Men's Road Running Shoes", brand: 'Nike', price: 230.00, merchant: 'NIKE', domain: 'nike.com', cashbackRate: 0.65, cashbackAmount: 1.50, affiliateUrl: 'https://api.fiber.shop/r/w?c=nike_vomero_premium' },
  { id: 'nike_vomero5_fl', title: "Women's Nike Zoom Vomero 5 — Casual Shoes", brand: 'Nike', price: 170.00, merchant: 'Finish Line', domain: 'finishline.com', cashbackRate: 3.25, cashbackAmount: 5.53, affiliateUrl: 'https://api.fiber.shop/r/w?c=nike_vomero5_fl' },
  { id: 'nike_airmax270', title: 'Nike Air Max 270', brand: 'Nike', price: 170.00, merchant: 'NIKE', domain: 'nike.com', cashbackRate: 0.65, cashbackAmount: 1.11, affiliateUrl: 'https://api.fiber.shop/r/w?c=nike_airmax270' },
  { id: 'nike_af1_fl', title: "Men's Nike Air Force 1 '07 LV8 — Casual Shoes", brand: 'Nike', price: 115.00, merchant: 'Finish Line', domain: 'finishline.com', cashbackRate: 3.25, cashbackAmount: 3.74, affiliateUrl: 'https://api.fiber.shop/r/w?c=nike_af1_fl' },
  { id: 'adidas_ultraboost', title: 'Adidas Ultraboost 5 Running Shoes', brand: 'Adidas', price: 190.00, merchant: 'Adidas', domain: 'adidas.com', cashbackRate: 3.5, cashbackAmount: 6.65, affiliateUrl: 'https://api.fiber.shop/r/w?c=adidas_ultraboost' },
  { id: 'adidas_samba', title: 'Adidas Samba OG Shoes', brand: 'Adidas', price: 110.00, merchant: 'Adidas', domain: 'adidas.com', cashbackRate: 3.5, cashbackAmount: 3.85, affiliateUrl: 'https://api.fiber.shop/r/w?c=adidas_samba' },
  { id: 'adidas_gazelle', title: 'Adidas Gazelle Indoor Shoes', brand: 'Adidas', price: 120.00, merchant: 'Adidas', domain: 'adidas.com', cashbackRate: 3.5, cashbackAmount: 4.20, affiliateUrl: 'https://api.fiber.shop/r/w?c=adidas_gazelle' },
];

function searchFallback(query, max = 5) {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
  return FALLBACK_PRODUCTS
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
  return results.map((p, i) => {
    const link = p.affiliateUrl ? `[🛒 Shop now](${p.affiliateUrl})` : '🛒 (No link available)';
    const cashback = p.cashbackRate ? `${p.cashbackRate}% cashback → $${p.cashbackAmount.toFixed(2)}` : 'No cashback';
    return `${i+1}. **${p.title}**\n   $${p.price.toFixed(2)} at ${p.merchant} | ${cashback}\n   ${link}`;
  }).join('\n\n');
}

// ─── In-memory store ───
const agents = {};

// ─── Handler ───

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Info page for browsers — comprehensive MCP metadata
  if (req.method === 'GET' && !req.headers.accept?.includes('text/event-stream')) {
    return res.status(200).json({
      name: 'FiberAgent MCP Server',
      version: '1.0.0',
      protocol: 'Model Context Protocol (MCP)',
      transport: 'Streamable HTTP (Server-Sent Events)',
      documentation: 'https://fiberagent.shop/capabilities or https://github.com/openclawlaurent/FiberAgent/blob/main/MCP_INTEGRATION_GUIDE.md',
      authentication: 'None — open access, no API keys or rate limits',
      
      tools: [
        {
          name: 'search_products',
          description: 'Search across 50K+ merchants for products with real-time cashback rates and affiliate links',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Product search terms (e.g., "running shoes", "wireless headphones")' },
              max_results: { type: 'integer', description: 'Number of results to return', default: 5, maximum: 20 }
            },
            required: ['query']
          }
        },
        {
          name: 'search_by_intent',
          description: 'Natural language product search — describe what you want, we parse intent and find matching products',
          inputSchema: {
            type: 'object',
            properties: {
              intent: { type: 'string', description: 'Natural language description (e.g., "find running shoes under $150 with good reviews")' },
              max_results: { type: 'integer', description: 'Number of results to return', default: 5, maximum: 20 }
            },
            required: ['intent']
          }
        },
        {
          name: 'register_agent',
          description: 'Register your agent with FiberAgent to earn cashback commissions on referred purchases',
          inputSchema: {
            type: 'object',
            properties: {
              agent_id: { type: 'string', description: 'Unique identifier for your agent' },
              agent_name: { type: 'string', description: 'Human-readable name for your agent (optional)' },
              wallet: { type: 'string', description: 'Monad blockchain wallet address (0x...) where commissions are paid' }
            },
            required: ['agent_id', 'wallet']
          }
        },
        {
          name: 'get_agent_stats',
          description: 'Retrieve your registered agent\'s earnings, search statistics, and performance metrics',
          inputSchema: {
            type: 'object',
            properties: {
              agent_id: { type: 'string', description: 'Your registered agent ID' }
            },
            required: ['agent_id']
          }
        },
        {
          name: 'compare_cashback',
          description: 'Compare cashback rates across different merchants for the same product to find the best deal',
          inputSchema: {
            type: 'object',
            properties: {
              product_name: { type: 'string', description: 'Product name or title to compare (e.g., "Nike Pegasus 41")' },
              max_merchants: { type: 'integer', description: 'Number of merchants to compare', default: 5, maximum: 10 }
            },
            required: ['product_name']
          }
        }
      ],

      resources: [
        {
          uri: 'fiber://merchants/catalog',
          description: 'Access the full product catalog with 50K+ merchants, inventory, rates, domains, and ratings',
          mimeType: 'application/json',
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                brand: { type: 'string' },
                price: { type: 'number' },
                merchant: { type: 'string' },
                domain: { type: 'string' },
                cashback_rate: { type: 'number' },
                cashback_amount: { type: 'number' },
                affiliate_link: { type: 'string' }
              }
            }
          }
        },
        {
          uri: 'fiber://agent-card',
          description: 'Retrieve registered agent profile card with wallet, registration date, stats, and on-chain verification status',
          mimeType: 'application/json',
          queryParameters: {
            agent_id: { type: 'string', required: true, description: 'The agent ID to fetch card for' }
          },
          schema: {
            type: 'object',
            properties: {
              agent_id: { type: 'string' },
              wallet: { type: 'string' },
              registered_at: { type: 'string', format: 'date-time' },
              total_searches: { type: 'integer' },
              total_commissions_earned: { type: 'number' },
              on_chain_verified: { type: 'boolean' }
            }
          }
        },
        {
          uri: 'fiber://rates/top',
          description: 'Get top cashback merchants by category or rate, sorted by opportunity',
          mimeType: 'application/json',
          queryParameters: {
            category: { type: 'string', description: 'Product category filter (e.g., "footwear", "electronics")' },
            limit: { type: 'integer', description: 'Number of results', default: 10, maximum: 50 }
          },
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                merchant: { type: 'string' },
                domain: { type: 'string' },
                category: { type: 'string' },
                cashback_rate: { type: 'number' },
                average_commission: { type: 'number' },
                product_count: { type: 'integer' }
              }
            }
          }
        }
      ],

      prompts: [
        {
          name: 'shopping_assistant',
          description: 'Template for building a helpful shopping assistant that helps users find deals and understand cashback',
          arguments: [
            { name: 'user_preferences', description: 'User shopping preferences (budget, brands, categories)' }
          ]
        },
        {
          name: 'deal_finder',
          description: 'Template for deal-hunting scenarios with price comparison, cashback analysis, and best-deal recommendations',
          arguments: [
            { name: 'product_category', description: 'Product category to hunt deals in' },
            { name: 'budget_constraint', description: 'Maximum budget (optional)' }
          ]
        }
      ],

      capabilities: {
        tools: true,
        resources: true,
        prompts: true,
        roots: false
      },

      limits: {
        max_request_size: '10MB',
        max_response_size: '10MB',
        timeout_seconds: 30,
        concurrent_connections: 'Unlimited',
        rate_limiting: 'None (open access)'
      },

      endpoints: {
        mcp_protocol: 'https://fiberagent.shop/api/mcp',
        rest_api: 'https://fiberagent.shop/api/agent',
        openapi_spec: 'https://fiberagent.shop/openapi.json',
        capabilities_page: 'https://fiberagent.shop/capabilities',
        agent_card: 'https://fiberagent.shop/.well-known/agent-card.json'
      },

      on_chain: {
        network: 'Monad',
        standard: 'ERC-8004',
        agent_id: 135,
        registry_url: 'https://8004scan.io/agents/monad/135',
        verified: true,
        status: 'Only commerce agent on Monad'
      }
    });
  }

  // ─── JSON-RPC 2.0 Direct Handler (for simple tool invocation) ───
  if (req.method === 'POST' && req.body && typeof req.body === 'object') {
    const { jsonrpc, method, params, id } = req.body;
    
    // Simple JSON-RPC 2.0 dispatcher for direct tool calls
    if (jsonrpc === '2.0' && method === 'tools/call' && params?.name) {
      const { name, arguments: args } = params;
      
      try {
        let result;
        switch (name) {
          case 'search_products': {
            const keywords = args?.keywords || '';
            const agent_id = args?.agent_id || 'mcp-user';
            const max_results = Math.min(args?.max_results || 5, 20);
            
            // Call our backend (which handles Fiber API + fallback)
            let results = await searchViaBackend(keywords, agent_id, max_results);
            let source = '🔗 Fiber API Live';
            
            // Fallback to mock if backend unavailable
            if (!results || results.length === 0) {
              results = searchFallback(keywords, max_results);
              source = '📦 Fallback Catalog';
            }
            
            return res.status(200).json({
              jsonrpc: '2.0',
              result: {
                content: [{ type: 'text', text: `## Search: "${keywords}"\n\n${formatResults(results)}\n\n---\n*${results.length} products from Fiber's 50K+ merchant network. Source: ${source}*` }]
              },
              id
            });
          }
          case 'search_by_intent': {
            const intent = args?.intent || '';
            const agent_id = args?.agent_id || 'mcp-user';
            const keywords = extractKeywords(intent);
            const maxPrice = extractMaxPrice(intent);
            const wantsCashback = /highest\s+cashback|best\s+cashback/i.test(intent);
            
            if (!keywords) {
              return res.status(200).json({
                jsonrpc: '2.0',
                result: { content: [{ type: 'text', text: 'Could not parse your request. Try: "Find Nike shoes under $150"' }] },
                id
              });
            }
            
            // Call our backend (which handles Fiber API + fallback)
            let results = await searchViaBackend(keywords, agent_id, 20);
            let source = '🔗 Fiber API Live';
            
            // Fallback to mock
            if (!results || results.length === 0) {
              results = searchFallback(keywords, 20);
              source = '📦 Fallback Catalog';
            }
            
            if (maxPrice) results = results.filter(p => p.price <= maxPrice);
            if (wantsCashback) results.sort((a, b) => b.cashbackAmount - a.cashbackAmount);
            results = results.slice(0, args?.max_results || 5);
            
            return res.status(200).json({
              jsonrpc: '2.0',
              result: {
                content: [{ type: 'text', text: `## FiberAgent: "${intent}"\n**Parsed:** ${keywords}${maxPrice ? ` | max $${maxPrice}` : ''}${wantsCashback ? ' | best cashback' : ''}\n\n${formatResults(results)}\n\n---\nSource: ${source}` }]
              },
              id
            });
          }
          case 'register_agent': {
            const agent_id = args?.agent_id;
            const wallet = args?.wallet_address || args?.wallet;
            
            if (!agent_id || !wallet) {
              return res.status(200).json({
                jsonrpc: '2.0',
                error: { code: -32602, message: 'Missing required parameters: agent_id, wallet_address' },
                id
              });
            }
            
            if (agents[agent_id]) {
              return res.status(200).json({
                jsonrpc: '2.0',
                result: { content: [{ type: 'text', text: `Agent "${agent_id}" already registered. Wallet: ${agents[agent_id].wallet}` }] },
                id
              });
            }
            
            agents[agent_id] = {
              name: args?.agent_name || agent_id,
              wallet: wallet,
              token: args?.crypto_preference || 'MON',
              searches: 0,
              at: new Date().toISOString()
            };
            
            return res.status(200).json({
              jsonrpc: '2.0',
              result: {
                content: [{
                  type: 'text',
                  text: `✅ Registered!\n\n**ID:** ${agent_id}\n**Wallet:** ${wallet}\n**Token:** ${agents[agent_id].token}\n**ERC-8004:** https://www.8004scan.io/agents/monad/135\n\nYou earn cashback on every purchase via FiberAgent.`
                }]
              },
              id
            });
          }
          case 'get_agent_stats': {
            const agent_id = args?.agent_id;
            const a = agents[agent_id];
            const stats = a
              ? { agent_id, name: a.name, wallet: a.wallet, searches: a.searches, earnings_mon: 0, fiber_points: a.searches * 10, registered: a.at }
              : { agent_id, searches: 0, earnings_mon: 0, fiber_points: 0, note: 'Not registered in this session' };
            
            return res.status(200).json({
              jsonrpc: '2.0',
              result: { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] },
              id
            });
          }
          case 'compare_cashback': {
            const product_query = args?.product_name || args?.product_query || '';
            const results = search(product_query, 20).sort((a, b) => b.cashbackRate - a.cashbackRate);
            
            if (!results.length) {
              return res.status(200).json({
                jsonrpc: '2.0',
                result: { content: [{ type: 'text', text: `No products found for "${product_query}".` }] },
                id
              });
            }
            
            const best = results[0];
            const table = results.map((p, i) => `${i+1}. **${p.merchant}** — ${p.cashbackRate}% → $${p.cashbackAmount.toFixed(2)} | ${p.title} $${p.price.toFixed(2)}`).join('\n');
            
            return res.status(200).json({
              jsonrpc: '2.0',
              result: {
                content: [{ type: 'text', text: `## Cashback Comparison: "${product_query}"\n\n${table}\n\n🏆 Best: ${best.merchant} at ${best.cashbackRate}%` }]
              },
              id
            });
          }
          default:
            return res.status(200).json({
              jsonrpc: '2.0',
              error: { code: -32601, message: `Tool not found: ${name}` },
              id
            });
        }
      } catch (err) {
        return res.status(200).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: err.message },
          id
        });
      }
    }
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
        const agent = agent_id || 'mcp-user';
        const limit = Math.min(max_results || 5, 20);
        
        // Call backend (handles Fiber API + fallback)
        let results = await searchViaBackend(keywords, agent, limit);
        let source = '🔗 Fiber API Live';
        
        // Fallback
        if (!results || results.length === 0) {
          results = searchFallback(keywords, limit);
          source = '📦 Fallback Catalog';
        }
        
        return { content: [{ type: 'text', text: `## Search: "${keywords}"\n\n${formatResults(results)}\n\n---\n*${results.length} products from Fiber's 50K+ merchant network. Source: ${source}*` }] };
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
        const agent = agent_id || 'mcp-user';

        if (!keywords) return { content: [{ type: 'text', text: 'Could not parse your request. Try: "Find Nike shoes under $150"' }] };

        // Call backend (handles Fiber API + fallback)
        let results = await searchViaBackend(keywords, agent, 20);
        let source = '🔗 Fiber API Live';
        
        // Fallback
        if (!results || results.length === 0) {
          results = searchFallback(keywords, 20);
          source = '📦 Fallback Catalog';
        }
        
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

        return { content: [{ type: 'text', text: `## FiberAgent: "${intent}"\n**Parsed:** ${keywords}${maxPrice ? ` | max $${maxPrice}` : ''}${wantsCashback ? ' | best cashback' : ''}\n\n${formatResults(results)}\n\n---\nSource: ${source}` }] };
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
      async ({ product_query, agent_id }) => {
        const agent = agent_id || 'mcp-user';
        
        // Call backend (handles Fiber API + fallback)
        let results = await searchViaBackend(product_query, agent, 20);
        let source = '🔗 Fiber API Live';
        
        // Fallback
        if (!results || results.length === 0) {
          results = searchFallback(product_query, 20);
          source = '📦 Fallback Catalog';
        }
        
        results = results.sort((a, b) => b.cashbackRate - a.cashbackRate);
        if (!results.length) return { content: [{ type: 'text', text: `No products found for "${product_query}".` }] };
        const best = results[0];
        const table = results.map((p, i) => `${i+1}. **${p.merchant}** — ${p.cashbackRate}% → $${p.cashbackAmount.toFixed(2)} | ${p.title} $${p.price.toFixed(2)}`).join('\n');
        return { content: [{ type: 'text', text: `## Cashback Comparison: "${product_query}"\n\n${table}\n\n🏆 Best: ${best.merchant} at ${best.cashbackRate}%\n\n---\nSource: ${source}` }] };
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
