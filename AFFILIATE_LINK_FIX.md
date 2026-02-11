# Affiliate Link Fix - How to Use wild.link Correctly

## Problem
The Fiber API returns affiliate links like:
```
https://wild.link/e?d=altrarunning.com&u=...
```

The `u=...` parameter is a **placeholder** that needs to be replaced with your agent ID.

## Solution
When you get affiliate links from Fiber API, replace the `u=...` with your actual `agent_id`:

```javascript
// Original link from Fiber
const fiberLink = "https://wild.link/e?d=altrarunning.com&u=...";

// Your agent ID (from registration)
const agentId = "agent_8bb7482da03354dc2cc620f6";

// Properly constructed link
const properLink = fiberLink.replace('u=...', `u=${agentId}`);
// Result: "https://wild.link/e?d=altrarunning.com&u=agent_8bb7482da03354dc2cc620f6"
```

## Parameters Explained

- **`d`** = merchant domain (e.g., `altrarunning.com`)
  - The merchant you're linking to
  - Used by Wildfire to route the commission

- **`u`** = unique identifier (your agent ID)
  - **Critical for tracking commissions**
  - Tells Fiber which agent referred the customer
  - Without this, you won't get paid!

## Usage in React

### In DemoPage.js (Search Results)
```javascript
const affiliateLink = merchant.affiliate_link 
  ? merchant.affiliate_link.replace('u=...', `u=${selectedAgent}`)
  : '#';

<a href={affiliateLink} target="_blank" rel="noopener noreferrer">
  Shop & Earn 🔗
</a>
```

### In AgentApiDemo.js (Product Details)
```javascript
const handleSelectProduct = (product) => {
  const affiliateLink = product.affiliate_link 
    ? product.affiliate_link.replace('u=...', `u=${agentId}`)
    : product.affiliate_link;
  
  setSelectedProduct({ ...product, affiliate_link: affiliateLink });
};
```

## Flow

1. **Agent registers** with FiberAgent
   - Receives `agent_id` (e.g., `agent_abc123`)

2. **Agent searches** for products
   - Gets back merchants with affiliate_link containing `u=...`

3. **Agent replaces placeholder** with their agent_id
   - `u=...` → `u=agent_abc123`

4. **Agent shares link** with their users
   - Users click the properly formatted link
   - Wildfire tracks the referral

5. **Commission paid** in 1-90 days
   - Because the `u=` parameter identified the referring agent

## Testing

To test if your affiliate link works:

1. Register an agent (you'll get an `agent_id`)
2. Search for products
3. Take the affiliate_link and manually replace `u=...` with your agent_id
4. Click the link - you should land on the merchant's site
5. Make a test purchase to verify tracking works

## Key Takeaway

**Without replacing `u=...` with your agent_id, your affiliate link won't work and you won't earn commissions.**

This is the critical post-processing step Fiber requires.
