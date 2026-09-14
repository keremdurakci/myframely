"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type CarouselReview = {
  quote: string;
  name: string;
  date: string;
  productTitle: string;
  productSrc: string;
  productEtsy: string;
};

export default function ReviewsCarousel({ reviews }: { reviews: CarouselReview[] }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % reviews.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reviews.length]);

  function goTo(i: number) {
    setIndex(i);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  return (
    <div className="min-w-0 w-full overflow-hidden">
      <div
        className="flex min-w-0 transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {reviews.map((review) => (
          <Link
            key={review.name}
            href={review.productEtsy}
            target="_blank"
            rel="noopener noreferrer"
            className="plate-holes flex min-w-0 w-full shrink-0 flex-col items-center rounded-xl border border-chrome/40 bg-white p-6 text-center shadow-2xl"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-chrome/40 bg-surface">
              <Image src={review.productSrc} alt={review.productTitle} fill className="object-contain p-1" />
            </div>
            <p className="mt-3 text-sm text-resin">★★★★★</p>
            <p className="mt-2 text-sm italic text-ink-soft">&ldquo;{review.quote}&rdquo;</p>
            <p className="mt-3 text-[11px] uppercase tracking-wide text-ink-soft">
              {review.name} · {review.date}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-ontario">{review.productTitle}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {reviews.map((review, i) => (
          <button
            key={review.name}
            type="button"
            aria-label={`Show review ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
