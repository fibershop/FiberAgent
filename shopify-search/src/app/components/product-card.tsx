import Image from "next/image";
import Link from "next/link";
import type { UniversalProduct } from "@/lib/types";
import { PriceRange } from "./price";

export function ProductCard({ product }: { product: UniversalProduct }) {
  const image = product.media[0];
  const shopNames = [
    ...new Set(product.variants.map((v) => v.shop.name)),
  ];
  const topRating = product.variants.reduce<{ value: number; count: number } | null>(
    (best, v) => {
      if (!v.rating) return best;
      if (!best || v.rating.count > best.count) return v.rating;
      return best;
    },
    null
  );

  return (
    <Link
      href={`/products/${encodeURIComponent(product.id)}`}
      className="group block rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square relative bg-gray-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText || product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
        <p className="mt-1 text-sm font-semibold text-gray-800">
          <PriceRange range={product.priceRange} />
        </p>
        {shopNames.length > 0 && (
          <p className="mt-1 text-xs text-gray-500 truncate">
            {shopNames.length === 1
              ? shopNames[0]
              : `${shopNames[0]} +${shopNames.length - 1} more`}
          </p>
        )}
        {topRating && (
          <p className="mt-1 text-xs text-yellow-600">
            {"★".repeat(Math.round(topRating.value))}
            {"☆".repeat(5 - Math.round(topRating.value))}{" "}
            <span className="text-gray-400">({topRating.count})</span>
          </p>
        )}
        {product.variants.some((v) => v.secondhand) && (
          <span className="mt-1 inline-block text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
            Pre-owned available
          </span>
        )}
        {product.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  );
}
