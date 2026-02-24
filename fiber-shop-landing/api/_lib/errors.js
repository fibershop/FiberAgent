/**
 * Standardized Error Responses for FiberAgent API
 * 
 * All errors follow this format:
 * {
 *   "success": false,
 *   "error": "ERROR_CODE",
 *   "message": "Human-readable message",
 *   "statusCode": 400,
 *   "timestamp": "2026-02-24T...",
 *   "retryable": true/false
 * }
 */

const ERROR_CODES = {
  // Client errors (4xx)
  INVALID_REQUEST: { status: 400, message: 'Invalid request parameters', retryable: false },
  MISSING_REQUIRED_FIELD: { status: 400, message: 'Missing required field', retryable: false },
  UNAUTHORIZED: { status: 401, message: 'Unauthorized. Invalid or missing auth token', retryable: false },
  FORBIDDEN: { status: 403, message: 'Forbidden. You do not have access to this resource', retryable: false },
  NOT_FOUND: { status: 404, message: 'Resource not found', retryable: false },
  RATE_LIMITED: { status: 429, message: 'Too many requests. Rate limit exceeded', retryable: true },
  CONFLICT: { status: 409, message: 'Conflict. Resource already exists', retryable: false },
  
  // Server errors (5xx)
  INTERNAL_ERROR: { status: 500, message: 'Internal server error', retryable: true },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service temporarily unavailable', retryable: true },
  GATEWAY_TIMEOUT: { status: 504, message: 'Request timeout. Please try again', retryable: true },
  
  // External API errors
  FIBER_API_ERROR: { status: 502, message: 'Error calling Fiber API', retryable: true },
  FIBER_API_TIMEOUT: { status: 504, message: 'Fiber API timeout', retryable: true },
  FIBER_API_UNAVAILABLE: { status: 503, message: 'Fiber API unavailable', retryable: true }
};

/**
 * Send standardized error response
 */
function sendError(res, errorCode, customMessage = null, details = {}) {
  const errorDef = ERROR_CODES[errorCode] || ERROR_CODES.INTERNAL_ERROR;
  
  const response = {
    success: false,
    error: errorCode,
    message: customMessage || errorDef.message,
    statusCode: errorDef.status,
    timestamp: new Date().toISOString(),
    retryable: errorDef.retryable,
    ...details
  };

  // Add retry hint if retryable
  if (errorDef.retryable) {
    response.hint = 'Please try again in a few moments';
  }

  // Add Retry-After header for rate limit errors
  if (errorCode === 'RATE_LIMITED' && details.retryAfter) {
    res.setHeader('Retry-After', details.retryAfter);
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(errorDef.status).json(response);
}

/**
 * Handle Fiber API errors gracefully
 */
function handleFiberApiError(error, res) {
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return sendError(res, 'FIBER_API_UNAVAILABLE', 'Cannot connect to Fiber API', {
      hint: 'Fiber API is currently unavailable. Showing demo data instead'
    });
  }

  if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
    return sendError(res, 'FIBER_API_TIMEOUT', 'Fiber API request timeout', {
      hint: 'Request took too long. Please try again'
    });
  }

  // Generic Fiber API error
  return sendError(res, 'FIBER_API_ERROR', `Fiber API error: ${error.message}`, {
    hint: 'Showing demo data as fallback'
  });
}

/**
 * Validate required fields in request
 */
function validateRequired(req, fields) {
  const missing = [];
  
  for (const field of fields) {
    if (!req.body?.[field] && !req.query?.[field]) {
      missing.push(field);
    }
  }

  return missing.length === 0 ? null : missing;
}

/**
 * Send validation error
 */
function sendValidationError(res, missingFields) {
  sendError(res, 'MISSING_REQUIRED_FIELD', 
    `Missing required fields: ${missingFields.join(', ')}`,
    { missing: missingFields }
  );
}

/**
 * Wrap async handler with error catching
 */
function asyncHandler(fn) {
  return async (req, res) => {
    try {
      return await fn(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      return sendError(res, 'INTERNAL_ERROR', error.message);
    }
  };
}

export {
  ERROR_CODES,
  sendError,
  handleFiberApiError,
  validateRequired,
  sendValidationError,
  asyncHandler
};
