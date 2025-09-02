import { useState, useEffect, useRef } from "react";

const useFpsMonitor = () => {
  const [fps, setFps] = useState(0);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useEffect(() => {
    let animationFrameId;

    const measure = (now) => {
      // Calculate time since last frame
      const delta = now - lastTimeRef.current;

      // Update FPS once per second
      if (delta > 1000) {
        const currentFps = (frameCountRef.current * 1000) / delta;
        setFps(Math.round(currentFps));
        lastTimeRef.current = now;
        frameCountRef.current = 0;
      }

      frameCountRef.current++;
      animationFrameId = requestAnimationFrame(measure);
    };

    animationFrameId = requestAnimationFrame(measure);

    return () => {
      // Cleanup on unmount
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return fps;
};

// --- In your component ---
export function FpsDisplay() {
  const fps = useFpsMonitor();

  // Low FPS can be considered as dropping frames
  const isDroppingFrames = fps > 0 && fps < 45;

  return <div style={{ color: isDroppingFrames ? "red" : "green" }}>FPS: {fps}</div>;
}
