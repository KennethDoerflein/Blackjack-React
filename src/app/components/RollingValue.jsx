import React, { useEffect, useRef, useState } from "react";

export default function RollingValue({ value, className, duration = 1200 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = Number(startRef.current ?? displayValue) || 0;
    const to = Number(value) || 0;
    if (from === to) {
      setDisplayValue(to);
      startRef.current = to;
      return;
    }

    const startTime = performance.now();
    // gentler ease-out for a calmer counting feel
    const easeOut = (t) => 1 - Math.pow(1 - t, 5);

    function step(now) {
      const elapsed = Math.min(1, (now - startTime) / duration);
      const eased = easeOut(elapsed);
      const current = Math.round(from + (to - from) * eased);
      setDisplayValue(current);
      if (elapsed < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        startRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className={className} style={{ display: "inline-block", verticalAlign: "middle" }}>
      {displayValue}
    </span>
  );
}
