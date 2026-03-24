import { getAccessToken } from "./auth";
import type {
  CatalogSearchParams,
  UniversalProduct,
  RestUniversalProduct,
  RestVariant,
  Money,
} from "./types";

const BASE_URL = "https://discover.shopifyapps.com/global/v2";

// --- Price normalization (REST returns integer cents, we normalize to decimal strings) ---

function centsToMoney(amount: number, currency: string): Money {
  return {
    amount: (amount / 100).toFixed(2),
    currencyCode: currency,
  };
}

function normalizeRestProduct(raw: RestUniversalProduct): UniversalProduct {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    url: raw.url,
    media: raw.media,
    options: raw.options,
    priceRange: {
      min: centsToMoney(raw.priceRange.min.amount, raw.priceRange.min.currency),
      max: centsToMoney(raw.priceRange.max.amount, raw.priceRange.max.currency),
    },
    variants: raw.variants.map((v: RestVariant) => ({
      id: v.id,
      displayName: v.displayName,
      availableForSale: v.availableForSale,
      price: centsToMoney(v.price, v.currency),
      options: v.options,
      shop: v.shop,
      variantUrl: v.variantUrl,
      checkoutUrl: v.checkoutUrl,
      rating: v.rating,
      secondhand: v.secondhand,
    })),
    uniqueSellingPoint: raw.uniqueSellingPoint,
    topFeatures: raw.topFeatures,
    techSpecs: raw.techSpecs,
    attributes: raw.attributes,
  };
}

// --- API fetch helper with auth ---

async function catalogFetch<T>(url: string): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Catalog API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

// --- Public API ---

export async function searchCatalog(
  params: CatalogSearchParams
): Promise<UniversalProduct[]> {
  const url = new URL(`${BASE_URL}/search`);

  url.searchParams.set("query", params.query);

  if (params.available_for_sale !== undefined) {
    url.searchParams.set(
      "available_for_sale",
      String(params.available_for_sale)
    );
  }
  if (params.min_price !== undefined) {
    url.searchParams.set("min_price", String(params.min_price));
  }
  if (params.max_price !== undefined) {
    url.searchParams.set("max_price", String(params.max_price));
  }
  if (params.ships_to) {
    url.searchParams.set("ships_to", params.ships_to);
  }
  if (params.ships_from) {
    url.searchParams.set("ships_from", params.ships_from);
  }
  if (params.include_secondhand !== undefined) {
    url.searchParams.set(
      "include_secondhand",
      String(params.include_secondhand)
    );
  }
  if (params.requires_selling_plan !== undefined) {
    url.searchParams.set(
      "requires_selling_plan",
      String(params.requires_selling_plan)
    );
  }
  if (params.categories) {
    url.searchParams.set("categories", params.categories);
  }
  if (params.shop_ids?.length) {
    url.searchParams.set("shop_ids", params.shop_ids.join(","));
  }
  if (params.limit !== undefined) {
    url.searchParams.set("limit", String(Math.min(params.limit, 10)));
  }
  if (params.products_limit !== undefined) {
    url.searchParams.set(
      "products_limit",
      String(Math.min(params.products_limit, 10))
    );
  }

  const data = await catalogFetch<RestUniversalProduct[]>(url.toString());
  return data.map(normalizeRestProduct);
}

export async function getProductByUpid(
  upid: string
): Promise<UniversalProduct> {
  const data = await catalogFetch<RestUniversalProduct>(
    `${BASE_URL}/p/${encodeURIComponent(upid)}`
  );
  return normalizeRestProduct(data);
}

export async function getProductByVariantId(
  variantId: string
): Promise<UniversalProduct> {
  const url = new URL(`${BASE_URL}/p`);
  url.searchParams.set("variant_id", variantId);
  const data = await catalogFetch<RestUniversalProduct>(url.toString());
  return normalizeRestProduct(data);
}
