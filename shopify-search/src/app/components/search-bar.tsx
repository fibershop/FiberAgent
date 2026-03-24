"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");
  const [shipsTo, setShipsTo] = useState(searchParams.get("ships_to") ?? "");
  const [inStockOnly, setInStockOnly] = useState(
    searchParams.get("available") !== "false"
  );
  const [includeSecondhand, setIncludeSecondhand] = useState(
    searchParams.get("secondhand") === "true"
  );
  const [subscriptionsOnly, setSubscriptionsOnly] = useState(
    searchParams.get("subscriptions") === "true"
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/");
      return;
    }

    const params = new URLSearchParams();
    params.set("q", trimmed);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (shipsTo) params.set("ships_to", shipsTo);
    if (!inStockOnly) params.set("available", "false");
    if (includeSecondhand) params.set("secondhand", "true");
    if (subscriptionsOnly) params.set("subscriptions", "true");

    router.push(`/?${params.toString()}`);
  }

  function handleClear() {
    setQuery("");
    router.push("/");
  }

  return (
    <div className="w-full max-w-3xl space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search millions of products across Shopify..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
            aria-label="Search products"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600"
          aria-label="Toggle filters"
        >
          Filters
        </button>
      </form>

      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white border border-gray-200 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Min Price
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Max Price
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              min="0"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Ships To
            </label>
            <input
              type="text"
              value={shipsTo}
              onChange={(e) => setShipsTo(e.target.value.toUpperCase())}
              placeholder="US"
              maxLength={2}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded"
            />
            In stock only
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={includeSecondhand}
              onChange={(e) => setIncludeSecondhand(e.target.checked)}
              className="rounded"
            />
            Include pre-owned
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={subscriptionsOnly}
              onChange={(e) => setSubscriptionsOnly(e.target.checked)}
              className="rounded"
            />
            Subscriptions only
          </label>
        </div>
      )}
    </div>
  );
}
