import React, { useEffect, useRef, useState } from "react";

export default function RollingValue({ value, className, duration = 1200 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const isDecimal = String(value).includes(".");

  useEffect(() => {
    const from = Number(startRef.current ?? displayValue) || 0;
    const to = Number(value) || 0;
    if (from === to) {
      setDisplayValue(to);
      startRef.current = to;
      return;
    }

    // Clear any previous animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    const startTime = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 5);

    function step(now) {
      const elapsed = Math.min(1, (now - startTime) / duration);
      const eased = easeOut(elapsed);
      const current = from + (to - from) * eased;

      // Use a more nuanced approach for small value changes and decimals
      const roundedValue = isDecimal ? current.toFixed(2) : Math.round(current);
      setDisplayValue(roundedValue);

      if (elapsed < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        // Ensure the final value is exactly the target value
        setDisplayValue(to);
        startRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span className={className} style={{ display: "inline-block", verticalAlign: "middle" }}>
      {displayValue}
    </span>
  );
}
