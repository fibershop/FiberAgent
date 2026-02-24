/**
 * Rate Limiting Utilities for FiberAgent API
 * 
 * Simple token bucket algorithm (in-memory for serverless)
 * In production, use Redis for distributed rate limiting
 * 
 * Limits per agent:
 * - 100 requests/minute
 * - 1000 requests/hour
 * - 5000 requests/day
 */

// In-memory rate limit store (maps agent_id → {count, resetTime})
// In production, migrate to Redis
const rateLimitStore = {};

// Configuration
const LIMITS = {
  minute: { requests: 100, windowMs: 60 * 1000 },
  hour: { requests: 1000, windowMs: 60 * 60 * 1000 },
  day: { requests: 5000, windowMs: 24 * 60 * 60 * 1000 }
};

/**
 * Check if agent has exceeded rate limits
 * Returns: { allowed: boolean, remaining: number, resetTime: timestamp, limitType: string }
 */
function checkRateLimit(agentId) {
  const now = Date.now();
  
  if (!rateLimitStore[agentId]) {
    rateLimitStore[agentId] = {
      minute: { count: 0, resetTime: now + LIMITS.minute.windowMs },
      hour: { count: 0, resetTime: now + LIMITS.hour.windowMs },
      day: { count: 0, resetTime: now + LIMITS.day.windowMs }
    };
  }

  const agent = rateLimitStore[agentId];

  // Check and reset windows as needed
  if (now >= agent.minute.resetTime) {
    agent.minute = { count: 0, resetTime: now + LIMITS.minute.windowMs };
  }
  if (now >= agent.hour.resetTime) {
    agent.hour = { count: 0, resetTime: now + LIMITS.hour.windowMs };
  }
  if (now >= agent.day.resetTime) {
    agent.day = { count: 0, resetTime: now + LIMITS.day.windowMs };
  }

  // Check all limits
  const minuteRemaining = LIMITS.minute.requests - agent.minute.count;
  const hourRemaining = LIMITS.hour.requests - agent.hour.count;
  const dayRemaining = LIMITS.day.requests - agent.day.count;

  // If any limit exceeded, return that one
  if (minuteRemaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: agent.minute.resetTime,
      limitType: 'minute',
      limit: LIMITS.minute.requests
    };
  }
  if (hourRemaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: agent.hour.resetTime,
      limitType: 'hour',
      limit: LIMITS.hour.requests
    };
  }
  if (dayRemaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: agent.day.resetTime,
      limitType: 'day',
      limit: LIMITS.day.requests
    };
  }

  // Not exceeded, increment counters
  agent.minute.count++;
  agent.hour.count++;
  agent.day.count++;

  return {
    allowed: true,
    remaining: {
      minute: minuteRemaining - 1,
      hour: hourRemaining - 1,
      day: dayRemaining - 1
    },
    resetTime: Math.min(
      agent.minute.resetTime,
      agent.hour.resetTime,
      agent.day.resetTime
    ),
    limitType: null
  };
}

/**
 * Middleware to enforce rate limiting
 * Usage: if (!enforceRateLimit(agentId, res)) return;
 */
function enforceRateLimit(agentId, res) {
  const check = checkRateLimit(agentId);

  // Add rate limit headers to response
  res.setHeader('X-RateLimit-Minute-Limit', LIMITS.minute.requests);
  res.setHeader('X-RateLimit-Minute-Remaining', Math.max(0, check.remaining?.minute || 0));
  res.setHeader('X-RateLimit-Minute-Reset', Math.ceil(check.resetTime / 1000));

  res.setHeader('X-RateLimit-Hour-Limit', LIMITS.hour.requests);
  res.setHeader('X-RateLimit-Hour-Remaining', Math.max(0, check.remaining?.hour || 0));
  res.setHeader('X-RateLimit-Hour-Reset', Math.ceil(check.resetTime / 1000));

  res.setHeader('X-RateLimit-Day-Limit', LIMITS.day.requests);
  res.setHeader('X-RateLimit-Day-Remaining', Math.max(0, check.remaining?.day || 0));
  res.setHeader('X-RateLimit-Day-Reset', Math.ceil(check.resetTime / 1000));

  if (!check.allowed) {
    const retryAfter = Math.ceil((check.resetTime - Date.now()) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.setHeader('X-RateLimit-Status', `Exceeded ${check.limitType} limit`);
    
    return false; // Rate limit exceeded
  }

  return true; // Rate limit OK
}

/**
 * Get rate limit info for an agent (without incrementing)
 */
function getRateLimitInfo(agentId) {
  const check = checkRateLimit(agentId);
  return {
    minute: {
      limit: LIMITS.minute.requests,
      remaining: check.remaining?.minute || 0,
      resetTime: check.resetTime
    },
    hour: {
      limit: LIMITS.hour.requests,
      remaining: check.remaining?.hour || 0,
      resetTime: check.resetTime
    },
    day: {
      limit: LIMITS.day.requests,
      remaining: check.remaining?.day || 0,
      resetTime: check.resetTime
    }
  };
}

/**
 * Reset rate limits for an agent (admin only)
 */
function resetRateLimit(agentId) {
  const now = Date.now();
  rateLimitStore[agentId] = {
    minute: { count: 0, resetTime: now + LIMITS.minute.windowMs },
    hour: { count: 0, resetTime: now + LIMITS.hour.windowMs },
    day: { count: 0, resetTime: now + LIMITS.day.windowMs }
  };
}

export {
  checkRateLimit,
  enforceRateLimit,
  getRateLimitInfo,
  resetRateLimit,
  LIMITS
};
