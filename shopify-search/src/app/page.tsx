import { Suspense } from "react";
import { searchCatalog } from "@/lib/catalog-client";
import { SearchBar } from "./components/search-bar";
import { ProductCard } from "./components/product-card";

export const dynamic = "force-dynamic";

interface SearchPageParams {
  q?: string;
  min_price?: string;
  max_price?: string;
  ships_to?: string;
  available?: string;
  secondhand?: string;
  subscriptions?: string;
}

async function SearchResults({ params }: { params: SearchPageParams }) {
  const products = await searchCatalog({
    query: params.q!,
    available_for_sale: params.available !== "false",
    min_price: params.min_price ? Number(params.min_price) : undefined,
    max_price: params.max_price ? Number(params.max_price) : undefined,
    ships_to: params.ships_to || undefined,
    include_secondhand: params.secondhand === "true",
    requires_selling_plan: params.subscriptions === "true",
    limit: 10,
  });

  if (products.length === 0) {
    return (
      <p className="text-gray-500 text-center py-12">
        No products found for &ldquo;{params.q}&rdquo;. Try broadening your
        filters or using a different search term.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchPageParams>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {params.q ? (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 bg-white overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <SearchResults params={params} />
        </Suspense>
      ) : (
        <div className="text-center py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Shopify Catalog Search
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Search millions of products across all Shopify merchants. Find
            anything from any store in the Shopify ecosystem.
          </p>
        </div>
      )}
    </div>
  );
}
