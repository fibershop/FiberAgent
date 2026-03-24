import type { Money, PriceRange as PriceRangeType } from "@/lib/types";

export function Price({ money }: { money: Money }) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));

  return <span>{formatted}</span>;
}

export function PriceRange({ range }: { range: PriceRangeType }) {
  const minFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: range.min.currencyCode,
  }).format(parseFloat(range.min.amount));

  const maxFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: range.max.currencyCode,
  }).format(parseFloat(range.max.amount));

  if (minFormatted === maxFormatted) {
    return <span>{minFormatted}</span>;
  }

  return (
    <span>
      {minFormatted} &ndash; {maxFormatted}
    </span>
  );
}
