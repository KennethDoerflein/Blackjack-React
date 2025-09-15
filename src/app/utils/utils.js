export function toggleHiddenElement(element) {
  if (element) {
    element.hidden = !element.hidden;
  }
}

export function toggleDisabledElement(element) {
  if (element) {
    element.disabled = !element.disabled;
  }
}

// Create a delay in milliseconds using requestAnimationFrame for smoother timing
export function delay(ms) {
  return new Promise((resolve) => {
    const start = performance.now();
    function tick(now) {
      if (now - start >= ms) {
        resolve();
      } else {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  });
}

export const pausableDelay = (duration, isTabVisible, visibilityPromiseResolver) => {
  return new Promise(async (resolve) => {
    if (!isTabVisible) {
      await new Promise((resolveVisible) => {
        // Use the resolver ref's .current property
        visibilityPromiseResolver.current = resolveVisible;
      });
    }
    const start = performance.now();
    function tick(now) {
      if (now - start >= duration) {
        resolve();
      } else {
        requestAnimationFrame(tick);
      }
    }
    requestAnimationFrame(tick);
  });
};
