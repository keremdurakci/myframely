"use client";

import { useRef, type PointerEvent } from "react";

export default function TiltCard({
  children,
  className = "",
  maxTilt = 12,
  lift = 22,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  lift?: number;
  glare?: boolean;
}) {
  const innerRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch") return;
    const el = innerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - py) * maxTilt * 2}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * maxTilt * 2}deg`);
    el.style.setProperty("--tz", `${lift}px`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  }

  function reset() {
    const el = innerRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--tz", "0px");
  }

  return (
    <div
      className="tilt-card"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerUp={reset}
    >
      <div ref={innerRef} className={`tilt-card-inner ${className}`}>
        {children}
        {glare && <div className="tilt-card-glare" />}
      </div>
    </div>
  );
}
