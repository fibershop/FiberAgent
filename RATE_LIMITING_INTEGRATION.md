# Rate Limiting & Error Handling Integration Guide

**Date:** Feb 24, 2026  
**Status:** ✅ Utilities Created | ⏳ Integration in Progress  
**Effort:** 1-2 hours

---

## What We Built

### 1. Rate Limiting Utility (`api/_lib/ratelimit.js`)

Simple token bucket algorithm (in-memory for serverless):

```javascript
import { enforceRateLimit } from '../_lib/ratelimit.js';

// In your handler:
export default async function handler(req, res) {
  const agentId = req.query.agent_id;
  
  // Check rate limits (returns false if exceeded)
  if (!enforceRateLimit(agentId, res)) {
    return sendError(res, 'RATE_LIMITED', 'Too many requests');
  }
  
  // ... rest of handler
}
```

**Limits per agent:**
- 100 requests/minute
- 1000 requests/hour
- 5000 requests/day

**Headers Added:**
```
X-RateLimit-Minute-Limit: 100
X-RateLimit-Minute-Remaining: 87
X-RateLimit-Minute-Reset: 1645564800

X-RateLimit-Hour-Limit: 1000
X-RateLimit-Hour-Remaining: 987
X-RateLimit-Hour-Reset: 1645564800

X-RateLimit-Day-Limit: 5000
X-RateLimit-Day-Remaining: 4987
X-RateLimit-Day-Reset: 1645564800

Retry-After: 60  # (only if rate limited)
```

**Status:** ✅ Ready to integrate

---

### 2. Error Handling Utility (`api/_lib/errors.js`)

Standardized error responses for all API errors:

```javascript
import { sendError, handleFiberApiError } from '../_lib/errors.js';

// In your handler:
if (!keywords) {
  return sendError(res, 'MISSING_REQUIRED_FIELD', 'keywords is required');
}

// Handle Fiber API errors
try {
  const data = await fetch(...);
} catch (error) {
  return handleFiberApiError(error, res);
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "statusCode": 400,
  "timestamp": "2026-02-24T14:30:00.000Z",
  "retryable": true,
  "hint": "Helpful hint for the developer"
}
```

**Available Error Codes:**
- `MISSING_REQUIRED_FIELD` (400) — Missing required field
- `INVALID_REQUEST` (400) — Invalid request parameters
- `UNAUTHORIZED` (401) — Invalid or missing auth token
- `FORBIDDEN` (403) — No access to this resource
- `NOT_FOUND` (404) — Resource not found
- `CONFLICT` (409) — Resource already exists
- `RATE_LIMITED` (429) — Rate limit exceeded
- `INTERNAL_ERROR` (500) — Internal server error
- `FIBER_API_ERROR` (502) — Fiber API error
- `FIBER_API_TIMEOUT` (504) — Fiber API timeout
- `SERVICE_UNAVAILABLE` (503) — Service unavailable

**Status:** ✅ Ready to integrate

---

## Integration Steps

### Step 1: Add Rate Limiting to All Agent Endpoints

Files to update:
- `/api/agent/search.js`
- `/api/agent/register.js`
- `/api/agent/[id]/stats.js`
- `/api/agent/[id].js`
- `/api/agent/compare.js` (when created)
- `/api/agent/task.js`
- `/api/stats/*.js`

Pattern:
```javascript
import { enforceRateLimit } from '../_lib/ratelimit.js';
import { sendError } from '../_lib/errors.js';

export default async function handler(req, res) {
  // ... CORS, etc ...
  
  // Extract agent_id from request
  const agentId = req.query.agent_id || req.body.agent_id;
  
  // Check rate limits
  if (!enforceRateLimit(agentId, res)) {
    return sendError(res, 'RATE_LIMITED', 'Request limit exceeded', {
      retryAfter: 60
    });
  }
  
  // ... rest of handler
}
```

### Step 2: Replace Error Responses

Old:
```javascript
return res.status(400).json({
  error: 'Missing required field',
  message: 'agent_id is required'
});
```

New:
```javascript
import { sendValidationError } from '../_lib/errors.js';

return sendValidationError(res, ['agent_id']);
```

Or:
```javascript
import { sendError } from '../_lib/errors.js';

return sendError(res, 'MISSING_REQUIRED_FIELD', 'agent_id is required');
```

### Step 3: Handle Fiber API Errors

Old:
```javascript
try {
  const response = await fetch(...);
} catch (error) {
  return res.status(500).json({ error: error.message });
}
```

New:
```javascript
import { handleFiberApiError } from '../_lib/errors.js';

try {
  const response = await fetch(...);
} catch (error) {
  return handleFiberApiError(error, res);
}
```

---

## Expected Behavior After Integration

### Successful Request:
```http
GET /api/agent/search?keywords=shoes&agent_id=agent_001

HTTP/1.1 200 OK
X-RateLimit-Minute-Limit: 100
X-RateLimit-Minute-Remaining: 99
X-RateLimit-Minute-Reset: 1645564860

{ "success": true, "results": [...] }
```

### Rate Limited Request (101st request in 1 minute):
```http
GET /api/agent/search?...

HTTP/1.1 429 Too Many Requests
Retry-After: 52
X-RateLimit-Status: Exceeded minute limit

{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "Too many requests. Rate limit exceeded",
  "retryable": true,
  "hint": "Please try again in a few moments"
}
```

### Missing Parameter:
```http
GET /api/agent/search

HTTP/1.1 400 Bad Request

{
  "success": false,
  "error": "MISSING_REQUIRED_FIELD",
  "message": "Missing required fields: keywords, agent_id",
  "missing": ["keywords", "agent_id"],
  "retryable": false
}
```

### Fiber API Down:
```http
GET /api/agent/search?keywords=shoes&agent_id=agent_001

HTTP/1.1 503 Service Unavailable

{
  "success": false,
  "error": "FIBER_API_UNAVAILABLE",
  "message": "Cannot connect to Fiber API",
  "hint": "Fiber API is currently unavailable. Showing demo data instead",
  "retryable": true
}
```

---

## Production Considerations

### Current (In-Memory):
- ✅ Works great for Vercel serverless (each function isolated)
- ❌ Does NOT persist across function instances
- ❌ Each cold start resets rate limits
- ⚠️ Fine for beta, needs Redis for production scale

### Future (Redis):
```javascript
// In production, replace in-memory store with Redis:
import redis from 'redis';

const client = redis.createClient(process.env.REDIS_URL);

// Store: { agentId:minute } → count
// TTL: 60 seconds
```

---

## Testing Checklist

- [ ] Rate limiting blocks 101st request with 429
- [ ] Retry-After header present on 429
- [ ] X-RateLimit-* headers present on all successful requests
- [ ] Missing parameter returns 400 with `MISSING_REQUIRED_FIELD`
- [ ] Invalid auth token returns 401 with `UNAUTHORIZED`
- [ ] Fiber API timeout returns 504 with `FIBER_API_TIMEOUT`
- [ ] Fiber API down returns 503 with `FIBER_API_UNAVAILABLE`
- [ ] All error responses have `retryable` flag
- [ ] All error responses have timestamp

---

## Next Steps

1. **Now:** Apply rate limiting + error handling to all endpoints
2. **Test:** Verify rate limiting works, error messages are clear
3. **Document:** Add error codes to API docs
4. **Monitor:** Log rate limit violations and Fiber API errors
5. **Scale:** Switch to Redis when hitting 1000+ agents

---

## Files Created

- `/api/_lib/ratelimit.js` (115 lines) ✅
- `/api/_lib/errors.js` (130 lines) ✅

## Files To Update

- `/api/agent/search.js` ⏳
- `/api/agent/register.js` ⏳
- `/api/agent/[id]/stats.js` ⏳
- `/api/agent/[id].js` ⏳
- `/api/agent/task.js` ⏳
- `/api/stats/*.js` (3 files) ⏳

---

**Effort remaining:** ~1-2 hours to integrate into all endpoints  
**Priority:** HIGH (protects API from abuse)

Let me know when you're ready to integrate! 🚀
