/**
 * GET /api/docs
 * Return OpenAPI specification
 */

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Read the OpenAPI spec from the server directory
    const specPath = path.join(process.cwd(), 'server', 'openapi.json');
    const spec = fs.readFileSync(specPath, 'utf8');
    return res.status(200).send(spec);
  } catch (err) {
    console.error('Error reading OpenAPI spec:', err);

    // Fallback: return inline OpenAPI spec
    const fallbackSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Fiber Agent API',
        description: 'AI shopping agent enabling autonomous agents to discover and shop across 50,000+ merchants',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'https://fiberagent.shop/api',
          description: 'Production API'
        }
      ],
      paths: {
        '/agent/register': {
          post: {
            summary: 'Register a new AI agent',
            tags: ['Agent Management'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['agent_id', 'wallet_address'],
                    properties: {
                      agent_id: { type: 'string' },
                      agent_name: { type: 'string' },
                      wallet_address: { type: 'string' },
                      crypto_preference: { type: 'string', enum: ['MON', 'BONK', 'USDC'] }
                    }
                  }
                }
              }
            },
            responses: {
              200: { description: 'Agent registered successfully' },
              409: { description: 'Agent already registered' }
            }
          }
        },
        '/agent/search': {
          get: {
            summary: 'Search products',
            parameters: [
              { name: 'keywords', in: 'query', required: true, schema: { type: 'string' } },
              { name: 'agent_id', in: 'query', required: true, schema: { type: 'string' } },
              { name: 'size', in: 'query', schema: { type: 'integer', default: 10 } }
            ],
            responses: { 200: { description: 'Search results' } }
          }
        },
        '/agent/{agent_id}/stats': {
          get: {
            summary: 'Get agent statistics',
            parameters: [
              { name: 'agent_id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: { 200: { description: 'Agent statistics' } }
          }
        }
      }
    };

    return res.status(200).json(fallbackSpec);
  }
}
