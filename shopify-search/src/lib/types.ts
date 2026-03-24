// --- Normalized domain types for the Shopify Global Catalog API ---

export interface CatalogImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface Money {
  amount: string; // normalized to decimal string (e.g. "89.00")
  currencyCode: string;
}

export interface PriceRange {
  min: Money;
  max: Money;
}

export interface ProductOption {
  name: string; // e.g. "Size", "Color"
  values: string[];
}

export interface VariantOption {
  name: string;
  value: string;
}

export interface ShopInfo {
  name: string;
  url?: string;
  paymentMethods?: string[];
  policies?: {
    privacy?: string;
    refund?: string;
    terms?: string;
    shipping?: string;
  };
}

export interface Rating {
  value: number;
  count: number;
}

export interface ProductVariant {
  id: string;
  displayName: string;
  availableForSale: boolean;
  price: Money;
  options: VariantOption[];
  shop: ShopInfo;
  variantUrl: string;
  checkoutUrl: string;
  rating?: Rating;
  secondhand?: boolean;
}

export interface UniversalProduct {
  id: string; // UPID (Universal Product ID)
  title: string;
  description: string;
  url: string;
  media: CatalogImage[];
  options: ProductOption[];
  priceRange: PriceRange;
  variants: ProductVariant[];
  // ML-inferred fields (may be absent)
  uniqueSellingPoint?: string;
  topFeatures?: string[];
  techSpecs?: string[];
  attributes?: string[];
}

// --- Search parameters ---

export interface CatalogSearchParams {
  query: string;
  context?: string;
  available_for_sale?: boolean;
  min_price?: number;
  max_price?: number;
  ships_to?: string;
  ships_from?: string;
  include_secondhand?: boolean;
  requires_selling_plan?: boolean;
  categories?: string;
  shop_ids?: string[];
  limit?: number;
  products_limit?: number;
}

// --- REST API raw response (prices as integers in smallest currency unit) ---

export interface RestVariant {
  id: string;
  displayName: string;
  availableForSale: boolean;
  price: number; // integer cents
  currency: string;
  options: VariantOption[];
  shop: ShopInfo;
  variantUrl: string;
  checkoutUrl: string;
  rating?: Rating;
  secondhand?: boolean;
}

export interface RestUniversalProduct {
  id: string;
  title: string;
  description: string;
  url: string;
  media: CatalogImage[];
  options: ProductOption[];
  priceRange: {
    min: { amount: number; currency: string };
    max: { amount: number; currency: string };
  };
  variants: RestVariant[];
  uniqueSellingPoint?: string;
  topFeatures?: string[];
  techSpecs?: string[];
  attributes?: string[];
}

// --- MCP response (prices as decimal strings) ---

export interface McpVariant {
  id: string;
  displayName: string;
  availableForSale: boolean;
  price: string; // decimal string "89.00"
  currencyCode: string;
  options: VariantOption[];
  shop: ShopInfo;
  variantUrl: string;
  checkoutUrl: string;
  rating?: Rating;
  secondhand?: boolean;
}

export interface McpUniversalProduct {
  id: string;
  title: string;
  description: string;
  url: string;
  media: CatalogImage[];
  options: ProductOption[];
  priceRange: {
    min: { amount: string; currencyCode: string };
    max: { amount: string; currencyCode: string };
  };
  variants: McpVariant[];
  uniqueSellingPoint?: string;
  topFeatures?: string[];
  techSpecs?: string[];
  attributes?: string[];
}
