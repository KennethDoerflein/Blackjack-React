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

// Create a delay in milliseconds
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const pausableDelay = (duration, isTabVisible, visibilityPromiseResolver) => {
  return new Promise(async (resolve) => {
    if (!isTabVisible) {
      await new Promise((resolveVisible) => {
        // Use the resolver ref's .current property
        visibilityPromiseResolver.current = resolveVisible;
      });
    }
    setTimeout(resolve, duration);
  });
};
