import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByUpid } from "@/lib/catalog-client";
import { Price, PriceRange } from "../../components/price";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: upid } = await params;

  let product;
  try {
    product = await getProductByUpid(decodeURIComponent(upid));
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  const images = product.media;
  const variants = product.variants;

  return (
    <div>
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 text-sm mb-6 inline-block"
      >
        &larr; Back to search
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div className="space-y-4">
          {images.length > 0 ? (
            <>
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={images[0].url}
                  alt={images[0].altText || product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.slice(1).map((img) => (
                    <div
                      key={img.url}
                      className="w-20 h-20 relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={img.url}
                        alt={img.altText || product.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {product.title}
            </h1>
            <p className="text-xs text-gray-400 mt-1">UPID: {product.id}</p>
          </div>

          <p className="text-2xl font-semibold text-gray-900">
            <PriceRange range={product.priceRange} />
          </p>

          {product.uniqueSellingPoint && (
            <p className="text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
              {product.uniqueSellingPoint}
            </p>
          )}

          {product.description && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-2">
                Description
              </h2>
              <p className="text-gray-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {product.topFeatures && product.topFeatures.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-2">
                Top Features
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {product.topFeatures.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {product.techSpecs && product.techSpecs.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-2">
                Tech Specs
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {product.techSpecs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Variants from different shops */}
          {variants.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-900 mb-2">
                Available From
              </h2>
              <div className="space-y-3">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="p-3 border border-gray-200 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-800">
                          {variant.displayName}
                        </span>
                        {variant.options.length > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({variant.options.map((o) => o.value).join(", ")})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Price money={variant.price} />
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            variant.availableForSale
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {variant.availableForSale ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Sold by {variant.shop.name}
                        {variant.secondhand && (
                          <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                            Pre-owned
                          </span>
                        )}
                      </span>
                      {variant.rating && (
                        <span className="text-yellow-600">
                          {"★".repeat(Math.round(variant.rating.value))}
                          {"☆".repeat(5 - Math.round(variant.rating.value))}{" "}
                          <span className="text-gray-400">
                            ({variant.rating.count})
                          </span>
                        </span>
                      )}
                    </div>
                    {variant.availableForSale && (
                      <a
                        href={variant.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Buy Now
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
