# FiberAgent Product Discovery UI - Implementation Guide

## Overview

This guide explains the new Daydream-style product discovery components built for FiberAgent chat. The system consists of two React components and an updated API backend that work together to create a premium shopping discovery experience.

## Components Created

### 1. ProductCard.jsx

**Location:** `src/components/ProductCard.jsx`

A Daydream-style product card component displaying individual products with rich information and actions.

#### Features:
- **Image Display**: Handles external URLs and emoji fallbacks
- **Price Highlight**: Large, prominent price display in accent yellow (#E5FF00)
- **Cashback Badge**: Highlighted cashback percentage and calculated amount
- **Star Ratings**: 5-star visual rating with review count
- **Merchant Info**: Styled merchant name with domain
- **Availability Badge**: In-stock/pre-order status indicator
- **Bookmark Button**: Heart icon to save products (❤️/🤍)
- **Primary CTA**: "Shop Now" button with affiliate link
- **Secondary Actions**: "More Like This" and "Compare" buttons

#### Props:
```javascript
{
  id: string,                    // Unique product ID
  title: string,                 // Product name
  price: number,                 // Price in USD
  image: string,                 // Image URL or emoji
  merchant: string,              // Merchant name
  cashback_rate: number,         // Decimal (0.05 = 5%)
  cashback_amount: number,       // Calculated amount ($)
  rating: number,                // 1-5 stars
  reviews_count: number,         // Number of reviews
  availability: string,          // 'in_stock' or 'preorder'
  affiliate_link: string,        // Shop link
  onMoreLikeThis: function,      // Callback for "More Like This"
  onCompare: function,           // Callback for compare button
  onBookmark: function,          // Callback for bookmark action
  isBookmarked: boolean,         // Initial bookmark state
}
```

#### Usage Example:
```jsx
<ProductCard
  id="product_1"
  title="Sony WH-1000XM5 Headphones"
  price={399.99}
  image="https://example.com/headphones.jpg"
  merchant="Best Buy"
  cashback_rate={0.08}
  cashback_amount={31.99}
  rating={4.8}
  reviews_count={342}
  availability="in_stock"
  affiliate_link="https://api.fiber.shop/r/w?..."
  onMoreLikeThis={(title, merchant) => console.log(title, merchant)}
  onCompare={(id, title, price, merchant) => console.log('Compare:', id)}
  onBookmark={(id, isBookmarked) => console.log('Bookmarked:', id)}
/>
```

---

### 2. FilterChips.jsx

**Location:** `src/components/FilterChips.jsx`

A dynamic filtering component with expandable filter groups, trending section, and applied filters display.

#### Features:
- **Expandable Filter Groups**: Click to expand/collapse each category
- **Dynamic Filter Counts**: Shows how many products match each filter
- **Trending Section**: Quick access buttons for trending searches
- **Applied Filters Display**: Shows active filters with remove buttons
- **Clear All Button**: Reset filters in one click
- **Smooth Animations**: Framer Motion for expand/collapse
- **Responsive Design**: Works on mobile and desktop

#### Filter Categories:
1. **Price Ranges**: Under $100, $100-500, $500-1000, Over $1000
2. **Categories**: Electronics, Fashion, Home & Garden, Sports & Outdoors, Books
3. **Ratings**: 3+, 3.5+, 4+, 4.5+ stars
4. **Availability**: In Stock, Pre-Order
5. **Cashback Rates**: 5%+, 10%+, 15%+, 20%+

#### Props:
```javascript
{
  availableFilters: {
    priceRanges: [{label, value, count}],
    categories: [{label, value, count}],
    ratings: [{label, value, count}],
    availability: [{label, value, count}],
    cashbackRates: [{label, value, count}],
  },
  onFiltersChange: function,    // Callback when filters change
  selectedFilters: object,       // Currently selected filters
  trending: array,               // Trending search terms
}
```

#### Usage Example:
```jsx
const [filters, setFilters] = useState({});

<FilterChips
  availableFilters={apiResponse.available_filters}
  selectedFilters={filters}
  trending={apiResponse.trending.searches}
  onFiltersChange={(newFilters) => {
    setFilters(newFilters);
    // Re-fetch products with new filters
    fetchProducts(newFilters);
  }}
/>
```

---

## Updated API Endpoint

### POST `/api/chat`

The chat API now accepts filter parameters and returns structured product discovery data.

#### Request Body:
```javascript
{
  message: string,              // User query (required)
  conversationHistory: array,   // Previous messages
  filters: {
    priceRanges: string[],      // ['Under $100', '$100-500', ...]
    categories: string[],        // ['Electronics', 'Fashion', ...]
    ratings: string[],           // ['4.5', '4', '3.5', '3']
    availability: string[],      // ['in_stock', 'preorder']
    cashbackRates: string[],     // ['5', '10', '15', '20']
  }
}
```

#### Response Body:
```javascript
{
  success: boolean,
  response: string,             // Claude's natural response
  products: [
    {
      id: string,
      title: string,
      price: number,
      merchant: string,
      domain: string,
      cashback_rate: number,     // Decimal (0.05 = 5%)
      cashback_amount: number,
      image_url: string,
      affiliate_link: string,
      rating: number,
      reviews_count: number,
      availability: string,      // 'in_stock' | 'preorder'
      category: string,
    }
  ],
  available_filters: {
    priceRanges: [{label, value, count}],
    categories: [{label, value, count}],
    ratings: [{label, value, count}],
    availability: [{label, value, count}],
    cashbackRates: [{label, value, count}],
  },
  trending: {
    searches: string[],
    count: number,
  }
}
```

#### API Features:
1. **Filter-Based Search**: Builds query params for Fiber API
2. **Dynamic Filter Generation**: Creates filter counts from actual results
3. **Multi-Price Support**: Parses and displays prices across multiple merchants
4. **Cashback Calculation**: Automatically calculates cashback amounts
5. **Rating System**: Adds star ratings from Fiber data or mock data
6. **Trending Support**: Returns trending searches for discovery UX

---

## Integration with ChatPage

### Step 1: Import Components

```jsx
import ProductCard from '../components/ProductCard';
import FilterChips from '../components/FilterChips';
```

### Step 2: Add State for Filters and Bookmarks

```jsx
const [filters, setFilters] = useState({});
const [bookmarks, setBookmarks] = useState(new Set());
```

### Step 3: Update API Call to Include Filters

```jsx
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    conversationHistory,
    filters,  // Add this
  })
});

const data = await res.json();

// Now data includes:
// - data.products (array)
// - data.available_filters (object)
// - data.trending (object)
```

### Step 4: Render Filter Chips (Optional - Above Products)

```jsx
{data.available_filters && (
  <FilterChips
    availableFilters={data.available_filters}
    selectedFilters={filters}
    trending={data.trending?.searches}
    onFiltersChange={(newFilters) => {
      setFilters(newFilters);
      // Optionally auto-search with new filters
    }}
  />
)}
```

### Step 5: Replace Simple Product Grid with ProductCard Components

```jsx
{message.products && (
  <div className={styles.productsGrid}>
    {message.products.map((product) => (
      <ProductCard
        key={product.id}
        {...product}
        isBookmarked={bookmarks.has(product.id)}
        onBookmark={(id, isBookmarked) => {
          const newBookmarks = new Set(bookmarks);
          if (isBookmarked) {
            newBookmarks.add(id);
          } else {
            newBookmarks.delete(id);
          }
          setBookmarks(newBookmarks);
          // Optional: Save to localStorage
          localStorage.setItem(
            'fiberagent_bookmarks',
            JSON.stringify([...newBookmarks])
          );
        }}
        onMoreLikeThis={(title, merchant) => {
          const newQuery = `Show me more ${title} products like from ${merchant}`;
          setInput(newQuery);
          handleSendMessage();
        }}
        onCompare={(id, title, price, merchant) => {
          // Launch comparison view or filter
          console.log('Compare:', { id, title, price, merchant });
        }}
      />
    ))}
  </div>
)}
```

---

## Styling

Both components use CSS Modules with:
- **Theme Colors**:
  - Accent: `#00d084` (green)
  - Secondary: `#E5FF00` (yellow)
  - Text: `#ffffff`
  - Muted: `rgba(255, 255, 255, 0.6)`

- **Effects**:
  - Glassmorphism with `backdrop-filter: blur(10px)`
  - Smooth transitions with Framer Motion
  - Hover states with scale/shadow effects

- **Responsive Breakpoints**:
  - Mobile: 640px and below
  - Tablet: 768px and below

---

## Key Features for Product Discovery

### 1. Smart Filter Aggregation
The API analyzes search results and only shows filter options that exist in the data (with counts).

### 2. Cashback Highlighting
Products prominently display:
- Percentage rate (e.g., "8%")
- Calculated amount (e.g., "$31.99")
- Visual badge with emoji for quick scanning

### 3. Trending Discovery
Quick access to popular searches without typing:
- Gaming Laptops
- Wireless Earbuds
- Smart Watches
- etc.

### 4. Bookmark System
Users can save products for later:
- Stored in localStorage
- Heart icon visual feedback
- Can be integrated with user accounts

### 5. Comparison Ready
"Compare" button sets up for price/merchant comparison across sources.

---

## Next Steps

1. **Integrate into ChatPage**: Use the examples above
2. **Add Persistence**: Save bookmarks to user account
3. **Implement Comparison**: Create comparison view for multiple products
4. **Add More Filters**: Expand filter categories based on merchant data
5. **Analytics**: Track which filters are used most
6. **A/B Testing**: Test different filter layouts and orderings

---

## Files Modified/Created

- ✅ `src/components/ProductCard.jsx` (NEW)
- ✅ `src/components/FilterChips.jsx` (NEW)
- ✅ `src/styles/ProductCard.module.css` (NEW)
- ✅ `src/styles/FilterChips.module.css` (NEW)
- ✅ `api/chat.js` (UPDATED)

Commit: `feat: Add Daydream-style product discovery UI components`
