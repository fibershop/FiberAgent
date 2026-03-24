import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  searchCatalog,
  getProductByUpid,
  getProductByVariantId,
} from "../lib/catalog-client";
import type { UniversalProduct, ProductVariant } from "../lib/types";

const server = new McpServer({
  name: "shopify-catalog",
  version: "2.0.0",
});

function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(parseFloat(amount));
}

function formatVariant(v: ProductVariant): string {
  const opts = v.options.map((o) => `${o.name}: ${o.value}`).join(", ");
  const price = formatPrice(v.price.amount, v.price.currencyCode);
  const stock = v.availableForSale ? "In Stock" : "Out of Stock";
  const rating = v.rating
    ? ` | Rating: ${v.rating.value}/5 (${v.rating.count} reviews)`
    : "";
  const secondhand = v.secondhand ? " [Pre-owned]" : "";

  return `  - ${v.displayName} (${opts}): ${price} — ${stock}${secondhand}${rating}\n    Shop: ${v.shop.name}\n    Buy: ${v.checkoutUrl}`;
}

function formatProduct(product: UniversalProduct): string {
  const priceMin = formatPrice(
    product.priceRange.min.amount,
    product.priceRange.min.currencyCode
  );
  const priceMax = formatPrice(
    product.priceRange.max.amount,
    product.priceRange.max.currencyCode
  );
  const priceStr = priceMin === priceMax ? priceMin : `${priceMin} – ${priceMax}`;

  const lines: (string | null)[] = [
    `**${product.title}**`,
    `UPID: ${product.id}`,
    `Price: ${priceStr}`,
    `Description: ${product.description.slice(0, 200)}${product.description.length > 200 ? "..." : ""}`,
    product.uniqueSellingPoint
      ? `USP: ${product.uniqueSellingPoint}`
      : null,
    product.topFeatures?.length
      ? `Top Features: ${product.topFeatures.join(", ")}`
      : null,
    `URL: ${product.url}`,
  ];

  return lines.filter(Boolean).join("\n");
}

// --- Tool: search_global_products ---

server.tool(
  "search_global_products",
  "Search for products across all Shopify merchants globally. Returns products from the entire Shopify catalog, not a single store.",
  {
    query: z.string().describe("Search query keywords"),
    context: z
      .string()
      .describe(
        "Buyer context: demographics, mood, preferences, use case. Critical for ranking quality."
      ),
    limit: z
      .number()
      .min(1)
      .max(300)
      .optional()
      .describe("Max results to return (default 10, max 300 via MCP)"),
    available_for_sale: z
      .boolean()
      .optional()
      .describe("Filter to in-stock products only (default true)"),
    min_price: z.number().optional().describe("Minimum price filter"),
    max_price: z.number().optional().describe("Maximum price filter"),
    ships_to: z
      .string()
      .optional()
      .describe("ISO 3166 country code for shipping destination"),
    ships_from: z
      .string()
      .optional()
      .describe("ISO 3166 country code for shipping origin"),
    include_secondhand: z
      .boolean()
      .optional()
      .describe("Include pre-owned products (default false)"),
    requires_selling_plan: z
      .boolean()
      .optional()
      .describe("Only show subscription products"),
    categories: z
      .string()
      .optional()
      .describe("Shopify Standard Product Taxonomy category ID"),
    shop_ids: z
      .array(z.string())
      .optional()
      .describe(
        "Optional: narrow to specific merchant shop IDs. Omit to search all merchants."
      ),
  },
  async ({
    query,
    context,
    limit,
    available_for_sale,
    min_price,
    max_price,
    ships_to,
    ships_from,
    include_secondhand,
    requires_selling_plan,
    categories,
    shop_ids,
  }) => {
    const products = await searchCatalog({
      query,
      context,
      available_for_sale,
      min_price,
      max_price,
      ships_to,
      ships_from,
      include_secondhand,
      requires_selling_plan,
      categories,
      shop_ids,
      limit: limit ?? 10,
    });

    if (products.length === 0) {
      return {
        content: [
          { type: "text", text: `No products found for "${query}".` },
        ],
      };
    }

    const text = products.map(formatProduct).join("\n\n---\n\n");

    return {
      content: [
        {
          type: "text",
          text: `Found ${products.length} product(s) across Shopify merchants for "${query}":\n\n${text}`,
        },
      ],
    };
  }
);

// --- Tool: get_global_product_details ---

server.tool(
  "get_global_product_details",
  "Get detailed information about a specific product. Provide exactly one of upid or variant_id.",
  {
    upid: z
      .string()
      .optional()
      .describe(
        "Universal Product ID (Base62) from search results. Mutually exclusive with variant_id."
      ),
    variant_id: z
      .string()
      .optional()
      .describe(
        "Shopify variant ID. Returns the parent product with this variant ranked first. Mutually exclusive with upid."
      ),
  },
  async ({ upid, variant_id }) => {
    if ((!upid && !variant_id) || (upid && variant_id)) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Provide exactly one of upid or variant_id, not both.",
          },
        ],
      };
    }

    const product = upid
      ? await getProductByUpid(upid)
      : await getProductByVariantId(variant_id!);

    const variants = product.variants.map(formatVariant).join("\n");

    const images = product.media
      .map((m) => `  - ${m.url}${m.altText ? ` (${m.altText})` : ""}`)
      .join("\n");

    const lines: (string | null)[] = [
      `**${product.title}**`,
      `UPID: ${product.id}`,
      `URL: ${product.url}`,
      `\nDescription:\n${product.description}`,
      product.uniqueSellingPoint
        ? `\nUnique Selling Point: ${product.uniqueSellingPoint}`
        : null,
      product.topFeatures?.length
        ? `\nTop Features:\n${product.topFeatures.map((f) => `  - ${f}`).join("\n")}`
        : null,
      product.techSpecs?.length
        ? `\nTech Specs:\n${product.techSpecs.map((s) => `  - ${s}`).join("\n")}`
        : null,
      `\nVariants:\n${variants}`,
      images ? `\nImages:\n${images}` : null,
    ];

    return {
      content: [{ type: "text", text: lines.filter(Boolean).join("\n") }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("MCP server error:", error);
  process.exit(1);
});
