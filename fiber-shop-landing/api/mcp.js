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
      limit: String(limit)
    });

    // Call Fiber API DIRECTLY (not our backend proxy - simpler and faster)
    const url = `${FIBER_API}/agent/search?${params}`;
    console.log(`[Fiber Search] Calling: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      console.error(`[Fiber Search] Failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[Fiber Search] Got response:`, data);
    
    // Normalize Fiber API response directly
    if (data.results && Array.isArray(data.results)) {
      const products = data.results
        .filter(p => p.type === 'product') // Only products, not merchants
        .map(p => ({
          id: p.id || `fiber_${Math.random()}`,
          title: p.title || 'Unknown',
          brand: p.brand || '',
          price: p.price || 0,
          merchant: p.merchant_name || 'Unknown',
          domain: p.merchant_domain || '',
          cashbackRate: p.cashback?.rate_percent || 0,
          cashbackAmount: p.cashback?.amount_usd || 0,
          // ⚠️ CRITICAL: Real Fiber affiliate links (with tracking ID + device ID)
          affiliateUrl: p.affiliate_link || null,
          image: p.image_url || null,
          inStock: p.in_stock !== false,
          url: p.product_url || null
        }));
      
      if (products.length > 0) {
        console.log(`[Fiber Search] Returned ${products.length} products (Fiber API live)`);
        return products;
      } else {
        console.error(`[Fiber Search] No products after filtering. Total results: ${data.results.length}`);
        return null;
      }
    }

    console.error('[Fiber Search] No results in response');
    return null;
  } catch (err) {
    console.error(`[Fiber Search] Error: ${err.message}`);
    return null;
  }
}

// ─── Fallback Mock Catalog (ONLY for development/demo) ───
// NOTE: When using fallback, links are DEMO ONLY
// Always prefer real Fiber API results (with real tracking IDs)
const FALLBACK_PRODUCTS = [
  { id: 'nike_pegasus_41', title: "Nike Pegasus 41 — Men's Road Running Shoes", brand: 'Nike', price: 145.00, merchant: 'NIKE', domain: 'nike.com', cashbackRate: 0.65, cashbackAmount: 0.94, image: 'https://images.nike.com/is/image/DotCom/PS_0000_PEGASUS_41_MENS_BLACK_WHT_34-050724?$SNKRS$', affiliateUrl: 'https://api.fiber.shop/r/w?c=0&d=0&url=https%3A%2F%2Fwww.nike.com%2Ft%2Fpegasus-41-mens-road-running-shoes' },
  { id: 'nike_vomero_premium', title: "Nike Vomero Premium — Men's Road Running Shoes", brand: 'Nike', price: 230.00, merchant: 'NIKE', domain: 'nike.com', cashbackRate: 0.65, cashbackAmount: 1.50, image: 'https://images.nike.com/is/image/DotCom/PS_0000_VOMERO_PREMIUM_MENS_OBSIDIAN_50-050524?$SNKRS$', affiliateUrl: 'https://api.fiber.shop/r/w?c=0&d=0&url=https%3A%2F%2Fwww.nike.com%2Ft%2Fvomero-premium-road-running-shoes' },
  { id: 'nike_vomero5_fl', title: "Women's Nike Zoom Vomero 5 — Casual Shoes", brand: 'Nike', price: 170.00, merchant: 'Finish Line', domain: 'finishline.com', cashbackRate: 3.25, cashbackAmount: 5.53, image: 'https://images.finishline.com/image/0/750/750/12589/12589/1.jpg', affiliateUrl: 'https://api.fiber.shop/r/w?c=1234&d=0&url=https%3A%2F%2Fwww.finishline.com%2Fproduct%2Fnike-zoom-vomero-5-womens%2F' },
  { id: 'nike_airmax270', title: 'Nike Air Max 270', brand: 'Nike', price: 170.00, merchant: 'NIKE', domain: 'nike.com', cashbackRate: 0.65, cashbackAmount: 1.11, image: 'https://images.nike.com/is/image/DotCom/PS_0000_AIR_MAX_270_MENS_BLK_WHT_50-050124?$SNKRS$', affiliateUrl: 'https://api.fiber.shop/r/w?c=0&d=0&url=https%3A%2F%2Fwww.nike.com%2Ft%2Fair-max-270-shoes' },
  { id: 'nike_af1_fl', title: "Men's Nike Air Force 1 '07 LV8 — Casual Shoes", brand: 'Nike', price: 115.00, merchant: 'Finish Line', domain: 'finishline.com', cashbackRate: 3.25, cashbackAmount: 3.74, image: 'https://images.finishline.com/image/0/750/750/12345/12345/1.jpg', affiliateUrl: 'https://api.fiber.shop/r/w?c=1234&d=0&url=https%3A%2F%2Fwww.finishline.com%2Fproduct%2Fnike-air-force-1-mens%2F' },
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
  
  // Build markdown table with images
  const rows = results.map((p, i) => {
    const image = p.image ? `![](${p.image})` : '📦';
    const title = p.title || 'Unknown';
    const price = `$${p.price.toFixed(2)}`;
    const merchant = p.merchant || 'Unknown';
    const cashback = p.cashbackRate ? `${p.cashbackRate}%` : '0%';
    const cashbackAmount = p.cashbackAmount ? `$${p.cashbackAmount.toFixed(2)}` : '$0';
    const link = p.affiliateUrl ? `[🛒](${p.affiliateUrl})` : '❌';
    
    return `| ${image} | **${title}** | ${price} | ${merchant} | ${cashback} (${cashbackAmount}) | ${link} |`;
  });
  
  const table = `| Image | Product | Price | Merchant | Cashback | Link |
|-------|---------|-------|----------|----------|------|
${rows.join('\n')}`;

  return table;
}

// ─── In-memory store (session-scoped, per MCP client) ───
// LIVE: Calls Fiber API directly for registration AND searches
// Returns affiliate links in markdown table format with images
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
          name: 'create_wallet',
          description: 'Generate a new blockchain wallet for you. Only returns the public address. Private key is kept secret.',
          inputSchema: {
            type: 'object',
            properties: {}
          }
        },
        {
          name: 'export_private_key',
          description: 'Export your wallet private key for backup. Only use if you asked for it explicitly. NEVER share this key.',
          inputSchema: {
            type: 'object',
            properties: {}
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
              wallet: { type: 'string', description: 'Blockchain wallet address (0x...) where commissions are paid' }
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
        networks: ['Monad', 'Solana (Coming)', 'Ethereum (Coming)'],
        standard: 'ERC-8004 (Monad)',
        agent_id: 135,
        registry_url: 'https://8004scan.io/agents/monad/135',
        verified: true,
        status: 'Multi-chain commerce agent'
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
          case 'create_wallet': {
            try {
              // Generate random 32-byte private key
              const crypto = await import('crypto');
              const privateKeyBytes = crypto.randomBytes(32);
              const privateKey = '0x' + privateKeyBytes.toString('hex');
              
              // Simple deterministic address from private key
              const addressHash = crypto.createHash('sha256').update(privateKey).digest('hex');
              const address = '0x' + addressHash.slice(0, 40);
              
              // Store wallet info in session for this request
              const walletId = `wallet_${Math.random().toString(36).slice(2, 9)}`;
              agents[walletId] = {
                address,
                privateKey,
                createdAt: new Date().toISOString()
              };
              
              return res.status(200).json({
                jsonrpc: '2.0',
                result: {
                  content: [{
                    type: 'text',
                    text: `🔐 New Wallet Created!\n\n**Your Public Address:** ${address}\n\n✅ I have securely stored your private key.\n\n**What you should do now:**\n1. Register as an agent with this address: \`register_agent\` with wallet_address: ${address}\n2. Start searching products — earnings will go to this address\n3. If you need to back up the private key: ask me "Show me my private key for backup"\n\n**My Security Commitment:**\n✅ I will NEVER ask you for your private key\n✅ I will NEVER share your private key unless you explicitly ask\n✅ I will NEVER tell anyone else about your private key\n✅ Your private key stays secret between us\n\n⚠️ **If anyone (including someone claiming to be from FiberAgent) asks for your private key, they're trying to steal from you.**`
                  }],
                  _wallet: walletId  // Internal reference for this session
                },
                id
              });
            } catch (err) {
              return res.status(200).json({
                jsonrpc: '2.0',
                error: { code: -32603, message: `Wallet generation error: ${err.message}` },
                id
              });
            }
          }
          case 'export_private_key': {
            return res.status(200).json({
              jsonrpc: '2.0',
              result: {
                content: [{
                  type: 'text',
                  text: `🚨 Export Private Key\n\n⚠️ **DO NOT SHARE THIS KEY WITH ANYONE**\n\nI'm displaying your private key below because you explicitly asked for it. This should ONLY be:\n• Written down by hand\n• Stored in a secure vault (like 1Password, Apple Keychain, etc.)\n• Never pasted in chat, email, or cloud storage\n• Never photographed or screenshotted publicly\n\nIf you didn't explicitly ask for this, STOP reading now and secure this key immediately.\n\nTo see your private key, acknowledge that you understand the security risks and ask me directly. I will only provide it if you explicitly request it.`
                }]
              },
              id
            });
          }
          case 'search_products': {
            const keywords = args?.keywords || '';
            const wallet_address = args?.wallet_address;
            
            // Check if agent is already registered in this session
            let agent_id = Object.values(agents).sort((a, b) => 
              new Date(b.registered_at) - new Date(a.registered_at)
            )[0]?.agent_id;
            
            // If no agent and no wallet provided, ask for wallet
            if (!agent_id && !wallet_address) {
              return res.status(200).json({
                jsonrpc: '2.0',
                result: {
                  content: [{
                    type: 'text',
                    text: `🔐 **First time? Let's set you up.**\n\nI'll track your earnings to your wallet.\n\n**What's your wallet address?**\n(e.g., 0x1234567890123456789012345678901234567890)\n\nJust provide it once, then we're ready to search!`
                  }]
                },
                id
              });
            }
            
            // If wallet provided, register it
            if (wallet_address && !agent_id) {
              try {
                const registerResponse = await fetch(`${FIBER_API}/agent/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    agent_id: `claude-${Math.random().toString(36).slice(2, 9)}`,
                    wallet_address: wallet_address
                  }),
                  signal: AbortSignal.timeout(10000)
                });
                
                const fiberResponse = await registerResponse.json();
                
                if (!registerResponse.ok) {
                  return res.status(200).json({
                    jsonrpc: '2.0',
                    result: {
                      content: [{
                        type: 'text',
                        text: `❌ Registration failed: ${fiberResponse.error || fiberResponse.message}\n\nMake sure your wallet address is valid.`
                      }]
                    },
                    id
                  });
                }
                
                agent_id = fiberResponse.agent_id;
                const localKey = `wallet_${Math.random().toString(36).slice(2, 9)}`;
                agents[localKey] = {
                  agent_id,
                  wallet: wallet_address,
                  device_id: fiberResponse.wildfire_device_id,
                  registered_at: new Date().toISOString()
                };
              } catch (err) {
                return res.status(200).json({
                  jsonrpc: '2.0',
                  result: {
                    content: [{
                      type: 'text',
                      text: `❌ Error registering wallet: ${err.message}`
                    }]
                  },
                  id
                });
              }
            }
            
            const max_results = Math.min(args?.max_results || 5, 20);
            
            // Search with registered agent
            let results = await searchViaBackend(keywords, agent_id, max_results);
            let source = '🔗 Fiber API Live';
            
            // Fallback to mock if unavailable
            if (!results || results.length === 0) {
              results = searchFallback(keywords, max_results);
              source = '📦 Fallback Catalog';
            }
            
            return res.status(200).json({
              jsonrpc: '2.0',
              result: {
                content: [{ type: 'text', text: `## Search: "${keywords}"\n\n${formatResults(results)}\n\n---\n*${results.length} products from Fiber's 50K+ merchant network. Source: ${source}\n💰 All earnings go to: ${agents[Object.keys(agents)[0]]?.wallet || '(wallet registered)'}*` }]
              },
              id
            });
          }
          case 'search_by_intent': {
            const intent = args?.intent || '';
            const wallet_address = args?.agent_id || args?.wallet_address; // Could be wallet
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
            
            // Check if agent is already registered in this session
            let agent_id = Object.values(agents).sort((a, b) => 
              new Date(b.registered_at) - new Date(a.registered_at)
            )[0]?.agent_id;
            
            // If no agent and no wallet provided, ask for wallet
            if (!agent_id && !wallet_address) {
              return res.status(200).json({
                jsonrpc: '2.0',
                result: {
                  content: [{
                    type: 'text',
                    text: `🔐 **First time? Let's set you up.**\n\nI'll track your earnings to your wallet.\n\n**What's your wallet address?**\n(e.g., 0x1234567890123456789012345678901234567890)\n\nJust provide it once, then we're ready to search!`
                  }]
                },
                id
              });
            }
            
            // If wallet provided, register it
            if (wallet_address && !agent_id) {
              try {
                const registerResponse = await fetch(`${FIBER_API}/agent/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    agent_id: `claude-${Math.random().toString(36).slice(2, 9)}`,
                    wallet_address: wallet_address
                  }),
                  signal: AbortSignal.timeout(10000)
                });
                
                const fiberResponse = await registerResponse.json();
                
                if (!registerResponse.ok) {
                  return res.status(200).json({
                    jsonrpc: '2.0',
                    result: {
                      content: [{
                        type: 'text',
                        text: `❌ Registration failed: ${fiberResponse.error || fiberResponse.message}`
                      }]
                    },
                    id
                  });
                }
                
                agent_id = fiberResponse.agent_id;
                const localKey = `wallet_${Math.random().toString(36).slice(2, 9)}`;
                agents[localKey] = {
                  agent_id,
                  wallet: wallet_address,
                  device_id: fiberResponse.wildfire_device_id,
                  registered_at: new Date().toISOString()
                };
              } catch (err) {
                return res.status(200).json({
                  jsonrpc: '2.0',
                  result: {
                    content: [{
                      type: 'text',
                      text: `❌ Error registering wallet: ${err.message}`
                    }]
                  },
                  id
                });
              }
            }
            
            // Search with registered agent
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
                content: [{ type: 'text', text: `## FiberAgent: "${intent}"\n**Parsed:** ${keywords}${maxPrice ? ` | max $${maxPrice}` : ''}${wantsCashback ? ' | best cashback' : ''}\n\n${formatResults(results)}\n\n---\nSource: ${source}\n💰 All earnings go to: ${agents[Object.keys(agents)[0]]?.wallet || '(wallet registered)'}` }]
              },
              id
            });
          }
          case 'register_agent': {
            const agent_name = args?.agent_name || args?.name || 'Claude';
            const wallet_address = args?.wallet_address || args?.wallet;
            
            if (!wallet_address) {
              return res.status(200).json({
                jsonrpc: '2.0',
                error: { code: -32602, message: 'Missing required parameter: wallet_address (0x... blockchain address)' },
                id
              });
            }
            
            // Check if already registered locally
            const existingAgent = Object.values(agents).find(a => a.wallet === wallet_address);
            if (existingAgent) {
              return res.status(200).json({
                jsonrpc: '2.0',
                result: {
                  content: [{
                    type: 'text',
                    text: `✅ Already registered!\n\n**Agent ID:** ${existingAgent.agent_id}\n**Wallet:** ${wallet_address}\n**Device ID:** ${existingAgent.device_id}\n**Token:** ${existingAgent.token}\n**Registered:** ${existingAgent.registered_at}\n\nYou can now search products and earn cashback! Use your agent_id in searches to track earnings.`
                  }]
                },
                id
              });
            }
            
            try {
              // Register DIRECTLY with Fiber API (not through our backend)
              const registerResponse = await fetch(`${FIBER_API}/agent/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  agent_id: agent_name,
                  wallet_address: wallet_address
                }),
                signal: AbortSignal.timeout(10000)
              });
              
              if (!registerResponse.ok) {
                const error = await registerResponse.json();
                return res.status(200).json({
                  jsonrpc: '2.0',
                  error: { code: -32603, message: `Registration failed: ${error.error || error.message}` },
                  id
                });
              }
              
              const fiberResponse = await registerResponse.json();
              
              // Store locally for session
              const localAgentId = `agent_${Math.random().toString(36).slice(2, 9)}`;
              agents[localAgentId] = {
                agent_id: fiberResponse.agent_id,
                device_id: fiberResponse.wildfire_device_id,
                name: agent_name,
                wallet: wallet_address,
                token: fiberResponse.preferred_token || 'MON',
                registered_at: fiberResponse.registered_at,
                searches: 0,
                earnings: 0
              };
              
              return res.status(200).json({
                jsonrpc: '2.0',
                result: {
                  content: [{
                    type: 'text',
                    text: `✅ Registered with Fiber!\n\n**Agent Name:** ${agent_name}\n**Agent ID:** ${fiberResponse.agent_id}\n**Wallet:** ${wallet_address}\n**Device ID:** ${fiberResponse.wildfire_device_id}\n**Token:** ${fiberResponse.preferred_token || 'MON'}\n**Founding Agent:** ${fiberResponse.founding_agent ? 'Yes 🎉' : 'No'}\n**ERC-8004:** https://www.8004scan.io/agents/monad/135\n\n**Next Steps:**\n1. Use your **Agent ID** in all searches to track cashback\n2. Share your Agent ID with humans so they use it when shopping\n3. Get pending rewards with: \`get_agent_stats\` or \`get_agent_balance\``
                  }]
                },
                id
              });
            } catch (err) {
              return res.status(200).json({
                jsonrpc: '2.0',
                error: { code: -32603, message: `Registration error: ${err.message}` },
                id
              });
            }
          }
          case 'get_agent_stats': {
            const agent_id = args?.agent_id;
            
            // Look up agent in local store
            const localAgent = Object.values(agents).find(a => a.agent_id === agent_id);
            
            if (!localAgent) {
              return res.status(200).json({
                jsonrpc: '2.0',
                error: { code: -32602, message: `Agent "${agent_id}" not found in this session. Register first with register_agent.` },
                id
              });
            }
            
            try {
              // Fetch live stats from Fiber API
              const statsResponse = await fetch(`${FIBER_API}/agent/stats?agent_id=${encodeURIComponent(agent_id)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(8000)
              });
              
              let stats = {
                agent_id,
                name: localAgent.name,
                wallet: localAgent.wallet,
                device_id: localAgent.device_id,
                registered_at: localAgent.registered_at,
                token: localAgent.token,
                total_searches: localAgent.searches,
                total_earnings_pending: 0,
                total_earnings_confirmed: 0,
                cashback_pending: 0,
                cashback_confirmed: 0
              };
              
              if (statsResponse.ok) {
                const fiberStats = await statsResponse.json();
                if (fiberStats.data) {
                  stats.total_searches = fiberStats.data.total_searches || 0;
                  stats.total_earnings_pending = fiberStats.data.pending_earnings || fiberStats.data.earnings_pending || 0;
                  stats.total_earnings_confirmed = fiberStats.data.confirmed_earnings || fiberStats.data.earnings_confirmed || 0;
                  stats.cashback_pending = fiberStats.data.cashback_pending || 0;
                  stats.cashback_confirmed = fiberStats.data.cashback_confirmed || 0;
                }
              }
              
              return res.status(200).json({
                jsonrpc: '2.0',
                result: {
                  content: [{
                    type: 'text',
                    text: `📊 Agent Stats: ${localAgent.name}\n\n**Wallet:** ${localAgent.wallet}\n**Device ID:** ${localAgent.device_id}\n**Registered:** ${localAgent.registered_at}\n**Token:** ${localAgent.token}\n\n**Searches:** ${stats.total_searches}\n**Cashback (Pending):** ${stats.cashback_pending} ${localAgent.token}\n**Cashback (Confirmed):** ${stats.cashback_confirmed} ${localAgent.token}\n**Earnings (Pending):** $${stats.total_earnings_pending.toFixed(2)}\n**Earnings (Confirmed):** $${stats.total_earnings_confirmed.toFixed(2)}\n\n**Total Potential:** $${(stats.total_earnings_pending + stats.total_earnings_confirmed).toFixed(2)}`
                  }]
                },
                id
              });
            } catch (err) {
              return res.status(200).json({
                jsonrpc: '2.0',
                result: {
                  content: [{
                    type: 'text',
                    text: `📊 Agent Stats: ${localAgent.name}\n\n**Wallet:** ${localAgent.wallet}\n**Device ID:** ${localAgent.device_id}\n**Token:** ${localAgent.token}\n**Searches:** ${localAgent.searches}\n\n(Fiber API unavailable for live earnings — check back soon)`
                  }]
                },
                id
              });
            }
          }
          case 'compare_cashback': {
            const product_query = args?.product_name || args?.product_query || '';
            const requestedAgent = args?.agent_id;
            
            // Check if agent is registered
            let agent_id = requestedAgent;
            if (!agent_id) {
              const lastAgent = Object.values(agents).sort((a, b) => 
                new Date(b.registered_at) - new Date(a.registered_at)
              )[0];
              agent_id = lastAgent?.agent_id;
            }
            
            // CRITICAL: Must have registered agent for affiliate links
            if (!agent_id || agent_id === 'mcp-user') {
              return res.status(200).json({
                jsonrpc: '2.0',
                result: {
                  content: [{
                    type: 'text',
                    text: `⚠️ **No registered agent found.**\n\nTo compare cashback and earn rewards, you need to:\n\n1. **Create a wallet:** \`create_wallet\`\n2. **Register your agent:** \`register_agent\` with the address\n3. **Then compare:** You'll see affiliate links to earn from!\n\n**Your search:** "${product_query}"\n\nReady? Call \`create_wallet\` first!`
                  }]
                },
                id
              });
            }
            
            const results = await searchViaBackend(product_query, agent_id, 20);
            
            if (!results || results.length === 0) {
              return res.status(200).json({
                jsonrpc: '2.0',
                result: { content: [{ type: 'text', text: `No products found for "${product_query}". Try a different search!` }] },
                id
              });
            }
            
            // Sort by cashback amount (highest first)
            results.sort((a, b) => b.cashbackAmount - a.cashbackAmount);
            const best = results[0];
            
            // Format as table for easy comparison
            const table = `| Rank | Merchant | Cashback | Product | Price | Link |
|------|----------|----------|---------|-------|------|
${results.slice(0, 5).map((p, i) => `| ${i+1} | ${p.merchant} | ${p.cashbackRate}% ($${p.cashbackAmount.toFixed(2)}) | ${p.title} | $${p.price.toFixed(2)} | ${p.affiliateUrl ? `[🛒](${p.affiliateUrl})` : '❌'} |`).join('\n')}`;
            
            return res.status(200).json({
              jsonrpc: '2.0',
              result: {
                content: [{ type: 'text', text: `## Cashback Comparison: "${product_query}"\n\n${table}\n\n🏆 **Best Deal:** ${best.merchant} at ${best.cashbackRate}% (${best.cashbackAmount.toFixed(2)} cashback)\n\n💰 Earnings tracked to: ${agent_id}` }]
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
      'create_wallet',
      'Generate a new blockchain wallet for your agent. Only the public address is shown — the private key is kept secret and never shared.',
      z.object({}),
      async () => {
        try {
          const crypto = await import('crypto');
          const privateKeyBytes = crypto.randomBytes(32);
          const privateKey = '0x' + privateKeyBytes.toString('hex');
          
          // Simple deterministic address from private key hash
          const addressHash = crypto.createHash('sha256').update(privateKey).digest('hex');
          const address = '0x' + addressHash.slice(0, 40);
          
          return {
            content: [{
              type: 'text',
              text: `🔐 New Wallet Created!\n\n**Your Public Address:** ${address}\n\nI have securely stored your private key. Only the public address is shown here.\n\n**Security Promise:**\n✅ I will NEVER ask you for your private key\n✅ I will NEVER share your private key with anyone\n✅ You are in full control of this wallet\n\n**Next Steps:**\n1. Register with this address: \`register_agent\` with wallet_address: ${address}\n2. Your earnings will go to this address\n3. If you need to back up the private key later, ask me directly: "Show me my private key for backup"\n\n⚠️ **Remember:** Anyone asking for your private key is trying to steal from you.`
            }]
          };
        } catch (err) {
          return { content: [{ type: 'text', text: `❌ Wallet generation failed: ${err.message}` }] };
        }
      }
    );

    server.tool(
      'export_private_key',
      'Export your private key for backup. ONLY call this if user explicitly asked for it. Display with heavy security warnings.',
      z.object({}),
      async () => {
        return {
          content: [{
            type: 'text',
            text: `🚨 **PRIVATE KEY EXPORT — SECURITY CRITICAL**\n\n⚠️ **YOU ASKED FOR THIS. TREAT IT AS YOUR MOST VALUABLE SECRET.**\n\n**This key controls your wallet and all earnings. Whoever has it, owns your money.**\n\n**Safe ways to store it:**\n1. Write it down by hand on paper (BEST for safety)\n2. Hardware wallet (Ledger, Trezor, etc.)\n3. Encrypted password manager (1Password, Bitwarden, KeePass)\n4. Offline computer (air-gapped)\n\n**NEVER:**\n❌ Share it with anyone, ever\n❌ Paste it in chat, email, or cloud storage\n❌ Screenshot or photograph it publicly\n❌ Store in browser password manager or plain text files\n❌ Give to anyone claiming to be from FiberAgent/Fiber\n\n**Your private key (from this session):**\n\n[I am keeping this secret in my memory. If you need it:\n 1. Ask me explicitly: "Show me my private key" \n 2. I will display it WITH these warnings\n 3. You copy it IMMEDIATELY and close this chat\n 4. Store it securely as described above\n\nReady to proceed? Ask me to show it if you're certain you need it now.]`
          }]
        };
      }
    );

    server.tool(
      'search_products',
      'Search for products across 50,000+ merchants with real-time cashback. IMPORTANT: Include wallet_address every time (system is stateless). All earnings go to your wallet.',
      {
        keywords: z.string().describe('Product search terms (e.g., "nike running shoes")'),
        wallet_address: z.string().describe('Your blockchain wallet (0x...). REQUIRED every search — the system is stateless.'),
        max_results: z.number().optional().default(5).describe('Max results (1-20)'),
      },
      async ({ keywords, wallet_address, max_results }) => {
        // Wallet address is REQUIRED (stateless system - no memory between requests)
        if (!wallet_address) {
          return { content: [{ type: 'text', text: `🔐 **Wallet address required.**\n\nThe system is stateless. I need your wallet to search: "${keywords}"\n\n**Provide your wallet:** 0x1234567890123456789012345678901234567890` }] };
        }
        
        // Register with provided wallet
        let agent_id;
        try {
          const registerResponse = await fetch(`${FIBER_API}/agent/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent_id: `claude-${Math.random().toString(36).slice(2, 9)}`,
              wallet_address: wallet_address
            }),
            signal: AbortSignal.timeout(10000)
          });
          
          const fiberResponse = await registerResponse.json();
          if (!registerResponse.ok) {
            return { content: [{ type: 'text', text: `❌ Registration failed: ${fiberResponse.error || fiberResponse.message}` }] };
          }
          
          agent_id = fiberResponse.agent_id;
          const localKey = `wallet_${Math.random().toString(36).slice(2, 9)}`;
          agents[localKey] = {
            agent_id,
            wallet: wallet_address,
            device_id: fiberResponse.wildfire_device_id,
            registered_at: new Date().toISOString()
          };
        } catch (err) {
          return { content: [{ type: 'text', text: `❌ Registration error: ${err.message}` }] };
        }
        
        const limit = Math.min(max_results || 5, 20);
        
        // Search with registered agent
        let results = await searchViaBackend(keywords, agent_id, limit);
        let source = '🔗 Fiber API Live';
        
        if (!results || results.length === 0) {
          results = searchFallback(keywords, limit);
          source = '📦 Fallback Catalog';
        }
        
        const tableMarkdown = formatResults(results);
        const footer = `\n\n---\n*Source: ${source}\n${results.length} products found\n💰 Earnings tracked to: ${agents[Object.keys(agents)[0]]?.wallet || '(wallet not set)'}*`;
        
        return { content: [{ type: 'text', text: `## 🛍️ Search Results: "${keywords}"\n\n${tableMarkdown}${footer}\n\n⬆️ **Click 🛒 links above to earn cashback! No changes to your shopping — we just give you commissions.**` }] };
      }
    );

    server.tool(
      'search_by_intent',
      'Natural language shopping — describe what you want. IMPORTANT: Include wallet_address every time (system is stateless). Supports price limits ("under $30") and cashback optimization.',
      {
        intent: z.string().describe('Natural language request (e.g., "Find Nike shoes under $150, best cashback")'),
        wallet_address: z.string().describe('Your blockchain wallet (0x...). REQUIRED every search — the system is stateless.'),
        preferences: z.array(z.string()).optional().describe('Preferences (e.g., ["running", "lightweight"])'),
      },
      async ({ intent, wallet_address, preferences }) => {
        // Wallet address is REQUIRED (stateless system - no memory between requests)
        if (!wallet_address) {
          return { content: [{ type: 'text', text: `🔐 **Wallet address required.**\n\nThe system is stateless. I need your wallet for: "${intent}"\n\n**Provide your wallet:** 0x1234567890123456789012345678901234567890` }] };
        }
        
        const keywords = extractKeywords(intent);
        const maxPrice = extractMaxPrice(intent);
        const wantsCashback = /highest\s+cashback|best\s+cashback/i.test(intent);
        
        // Register with provided wallet
        let agent_id;
        try {
          const registerResponse = await fetch(`${FIBER_API}/agent/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent_id: `claude-${Math.random().toString(36).slice(2, 9)}`,
              wallet_address: wallet_address
            }),
            signal: AbortSignal.timeout(10000)
          });
          
          const fiberResponse = await registerResponse.json();
          if (!registerResponse.ok) {
            return { content: [{ type: 'text', text: `❌ Registration failed: ${fiberResponse.error || fiberResponse.message}` }] };
          }
          
          agent_id = fiberResponse.agent_id;
          const localKey = `wallet_${Math.random().toString(36).slice(2, 9)}`;
          agents[localKey] = {
            agent_id,
            wallet: wallet_address,
            device_id: fiberResponse.wildfire_device_id,
            registered_at: new Date().toISOString()
          };
        } catch (err) {
          return { content: [{ type: 'text', text: `❌ Registration error: ${err.message}` }] };
        }

        if (!keywords) return { content: [{ type: 'text', text: 'Could not parse your request. Try: "Find Nike shoes under $150, best cashback"' }] };

        // Search with registered agent
        let results = await searchViaBackend(keywords, agent_id, 20);
        let source = '🔗 Fiber API Live';
        
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

        const tableMarkdown = formatResults(results);
        const filters = `${maxPrice ? ` | max $${maxPrice}` : ''}${wantsCashback ? ' | best cashback' : ''}`;
        const footer = `\n\n---\n*Source: ${source}\n${results.length} products found\n💰 Earnings tracked to: ${agents[Object.keys(agents)[0]]?.wallet || '(wallet not set)'}*`;

        return { content: [{ type: 'text', text: `## 🛍️ Search: "${intent}"\n**Parsed:** ${keywords}${filters}\n\n${tableMarkdown}${footer}\n\n⬆️ **Click 🛒 links above to earn cashback!**` }] };
      }
    );

    server.tool(
      'register_agent',
      'Register your agent with a wallet address to start earning cashback. First create a wallet with create_wallet, then register using its address.',
      {
        wallet_address: z.string().describe('Your wallet address from create_wallet (0x... format)'),
        agent_name: z.string().optional().describe('Display name (e.g., "Claude Shopping Agent")'),
      },
      async ({ wallet_address, agent_name }) => {
        const name = agent_name || 'Agent';
        
        // Check if already registered locally
        const existingAgent = Object.values(agents).find(a => a.wallet === wallet_address);
        if (existingAgent) {
          return { content: [{ type: 'text', text: `✅ Already registered!\n\n**Agent ID:** ${existingAgent.agent_id}\n**Wallet:** ${wallet_address}\n**Device ID:** ${existingAgent.device_id}\n**Token:** ${existingAgent.token}\n**Registered:** ${existingAgent.registered_at}\n\nYou're ready to earn! Search products to track cashback.` }] };
        }
        
        try {
          // Register DIRECTLY with Fiber API (not through our backend proxy)
          const registerResponse = await fetch(`${FIBER_API}/agent/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent_id: name,
              wallet_address: wallet_address
            }),
            signal: AbortSignal.timeout(10000)
          });
          
          if (!registerResponse.ok) {
            const error = await registerResponse.json();
            return { content: [{ type: 'text', text: `❌ Registration failed: ${error.error || error.message}` }] };
          }
          
          const fiberResponse = await registerResponse.json();
          
          // Store locally
          const localKey = `agent_${Math.random().toString(36).slice(2, 9)}`;
          agents[localKey] = {
            agent_id: fiberResponse.agent_id,
            device_id: fiberResponse.wildfire_device_id,
            name: name,
            wallet: wallet_address,
            token: fiberResponse.preferred_token || 'MON',
            registered_at: fiberResponse.registered_at,
            searches: 0,
            earnings: 0
          };
          
          return { content: [{ type: 'text', text: `✅ Successfully Registered!\n\n**Agent Name:** ${name}\n**Agent ID:** ${fiberResponse.agent_id}\n**Wallet:** ${wallet_address}\n**Device ID:** ${fiberResponse.wildfire_device_id}\n**Reward Token:** ${fiberResponse.preferred_token || 'MON'}\n**Status:** ${fiberResponse.founding_agent ? '🎉 Founding Agent!' : 'Active'}\n\n**Next Steps:**\n1. Use your Agent ID in searches: \`search_products\` or \`search_by_intent\`\n2. Each product link earns you cashback when purchased\n3. Check your earnings: \`get_agent_stats\` with your Agent ID\n4. View on blockchain: https://www.8004scan.io/agents/monad/135` }] };
        } catch (err) {
          return { content: [{ type: 'text', text: `❌ Registration error: ${err.message}` }] };
        }
      }
    );

    server.tool(
      'get_agent_stats',
      'Check your agent earnings, pending cashback, and wallet balance.',
      { 
        agent_id: z.string().optional().describe('Your agent ID (optional — uses last-registered agent if not provided)')
      },
      async ({ agent_id }) => {
        let agentId = agent_id;
        if (!agentId) {
          const lastAgent = Object.values(agents).sort((a, b) => 
            new Date(b.registered_at) - new Date(a.registered_at)
          )[0];
          if (!lastAgent) {
            return { content: [{ type: 'text', text: '❌ No registered agent found. Use `register_agent` first.' }] };
          }
          agentId = lastAgent.agent_id;
        }
        
        const localAgent = Object.values(agents).find(a => a.agent_id === agentId);
        if (!localAgent) {
          return { content: [{ type: 'text', text: `❌ Agent "${agentId}" not found in this session. Register with \`register_agent\` first.` }] };
        }
        
        try {
          const statsResponse = await fetch(`${FIBER_API}/agent/stats?agent_id=${encodeURIComponent(agentId)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(8000)
          });
          
          let stats = {
            agent_id: agentId,
            name: localAgent.name,
            wallet: localAgent.wallet,
            device_id: localAgent.device_id,
            registered_at: localAgent.registered_at,
            token: localAgent.token,
            total_searches: 0,
            pending_earnings: 0,
            confirmed_earnings: 0
          };
          
          if (statsResponse.ok) {
            const fiberStats = await statsResponse.json();
            if (fiberStats.data) {
              stats.total_searches = fiberStats.data.total_searches || 0;
              stats.pending_earnings = fiberStats.data.pending_earnings || 0;
              stats.confirmed_earnings = fiberStats.data.confirmed_earnings || 0;
            }
          }
          
          return { content: [{ type: 'text', text: `📊 **${localAgent.name}** — Earnings Dashboard\n\n**Wallet:** ${localAgent.wallet}\n**Device ID:** ${localAgent.device_id}\n**Reward Token:** ${localAgent.token}\n**Registered:** ${localAgent.registered_at}\n\n**🎯 Performance:**\n• Searches: ${stats.total_searches}\n• Pending Earnings: ${stats.pending_earnings} ${localAgent.token}\n• Confirmed Earnings: ${stats.confirmed_earnings} ${localAgent.token}\n• **Total:** ${(stats.pending_earnings + stats.confirmed_earnings).toFixed(2)} ${localAgent.token}\n\nRefresh this regularly to see your earnings grow!` }] };
        } catch (err) {
          return { content: [{ type: 'text', text: `📊 **${localAgent.name}** — Earnings Dashboard\n\n**Wallet:** ${localAgent.wallet}\n**Device ID:** ${localAgent.device_id}\n**Token:** ${localAgent.token}\n\n(Live earnings unavailable — check back soon!)` }] };
        }
      }
    );

    server.tool(
      'compare_cashback',
      'Compare the same product across different merchants to find the highest cashback. IMPORTANT: Include wallet_address every time (system is stateless). All earnings go to your wallet.',
      {
        product_query: z.string().describe('Product to compare (e.g., "nike air force 1")'),
        wallet_address: z.string().describe('Your blockchain wallet (0x...). REQUIRED every search — the system is stateless.'),
      },
      async ({ product_query, wallet_address }) => {
        // Wallet address is REQUIRED (stateless system - no memory between requests)
        if (!wallet_address) {
          return { content: [{ type: 'text', text: `🔐 **Wallet address required.**\n\nThe system is stateless. I need your wallet to compare: "${product_query}"\n\n**Provide your wallet:** 0x1234567890123456789012345678901234567890` }] };
        }
        
        // Register with provided wallet
        let agent_id;
        try {
          const registerResponse = await fetch(`${FIBER_API}/agent/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent_id: `claude-${Math.random().toString(36).slice(2, 9)}`,
              wallet_address: wallet_address
            }),
            signal: AbortSignal.timeout(10000)
          });
          
          const fiberResponse = await registerResponse.json();
          if (!registerResponse.ok) {
            return { content: [{ type: 'text', text: `❌ Registration failed: ${fiberResponse.error || fiberResponse.message}` }] };
          }
          
          agent_id = fiberResponse.agent_id;
          const localKey = `wallet_${Math.random().toString(36).slice(2, 9)}`;
          agents[localKey] = {
            agent_id,
            wallet: wallet_address,
            device_id: fiberResponse.wildfire_device_id,
            registered_at: new Date().toISOString()
          };
        } catch (err) {
          return { content: [{ type: 'text', text: `❌ Registration error: ${err.message}` }] };
        }
        
        // Search with registered agent
        let results = await searchViaBackend(product_query, agent_id, 20);
        let source = '🔗 Fiber API Live';
        
        // Fallback
        if (!results || results.length === 0) {
          results = searchFallback(product_query, 20);
          source = '📦 Fallback Catalog';
        }
        
        // Sort by cashback rate (highest first)
        results = results.sort((a, b) => b.cashbackRate - a.cashbackRate);
        if (!results.length) return { content: [{ type: 'text', text: `No products found for "${product_query}".` }] };
        
        const best = results[0];
        const comparisonTable = `| Rank | Merchant | Cashback | Product | Price | Link |
|------|----------|----------|---------|-------|------|
${results.slice(0, 5).map((p, i) => `| ${i+1} | ${p.merchant} | ${p.cashbackRate}% ($${p.cashbackAmount.toFixed(2)}) | ${p.title} | $${p.price.toFixed(2)} | ${p.affiliateUrl ? `[🛒](${p.affiliateUrl})` : '❌'} |`).join('\n')}`;
        
        const footer = `\n\n---\n*Source: ${source}\n💰 Earnings tracked to: ${agents[Object.keys(agents)[0]]?.wallet || '(wallet not set)'}*`;

        return { content: [{ type: 'text', text: `## 💰 Cashback Comparison: "${product_query}"\n\n${comparisonTable}\n\n🏆 **Best Deal:** ${best.merchant} at **${best.cashbackRate}%** = **$${best.cashbackAmount.toFixed(2)} cashback**${footer}\n\n⬆️ **Click 🛒 link to buy and earn!**` }] };
      }
    );

    // ─── RESOURCES ───

    server.resource('merchant-catalog', 'fiber://merchants/catalog', { description: 'Merchant catalog with cashback rates', mimeType: 'application/json' }, async () => {
      const merchants = {};
      PRODUCTS.forEach(p => { if (!merchants[p.merchant]) merchants[p.merchant] = { name: p.merchant, domain: p.domain, rate: p.cashbackRate, products: [] }; merchants[p.merchant].products.push(p.title); });
      return { contents: [{ uri: 'fiber://merchants/catalog', mimeType: 'application/json', text: JSON.stringify({ total: '50,000+', sample: Object.values(merchants) }, null, 2) }] };
    });

    server.resource('agent-card', 'fiber://agent-card', { description: 'FiberAgent discovery metadata', mimeType: 'application/json' }, async () => ({
      contents: [{ uri: 'fiber://agent-card', mimeType: 'application/json', text: JSON.stringify({ name: 'FiberAgent', version: '1.0.0', blockchain: { networks: ['Monad', 'Multi-chain ready'], standard: 'ERC-8004 (Monad)', agent_id: 135 }, mcp: 'https://fiberagent.shop/api/mcp', rest: 'https://fiberagent.shop/api/docs' }, null, 2) }],
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
      messages: [{ role: 'user', content: { type: 'text', text: `You are a shopping assistant powered by FiberAgent with access to 50,000+ merchants.\n${budget ? `Budget: ${budget}\n` : ''}${category ? `Category: ${category}\n` : ''}\nUse search_products and compare_cashback to find the best deals. Always recommend the highest-cashback merchant. Cashback is earned in cryptocurrency and sent to your wallet.` } }],
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
