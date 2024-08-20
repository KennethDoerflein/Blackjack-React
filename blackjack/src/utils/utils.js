// Determine if the dealer should hit based on game rules
export function shouldDealerHit(total, hand) {
  // if (soft17Switch.checked) {
  //   return total < 17 || (total === 17 && isSoft17(hand));
  // }
  return total < 17;
}

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

// Preload an image
export function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
  });
}

// Animate the card with a given class and delay
export function animateElement(element, animationClass, delayTime) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      element.classList.add(animationClass);
    });
    requestAnimationFrame(async () => {
      await delay(delayTime);
      element.classList.remove(animationClass);
      resolve();
    });
  });
}

// Create an HTML image element
export async function createCardImage(initialSrc) {
  await preloadImage(initialSrc);
  const imgElement = document.createElement("img");
  imgElement.src = initialSrc;
  return imgElement;
}

export function shouldFlipCard(entity, cards) {
  return entity !== "dealer" || cards.length !== 2;
}

// Preload an image and return its src
export async function preloadAndGetImage(src) {
  await preloadImage(src);
  return src;
}

// Update game buttons based on current game state
export function updateGameButtons(playerTotal) {
  const canPlay = playerTotal <= 21;
  const hitBtn = document.getElementById("hitBtn");
  const standBtn = document.getElementById("standBtn");
  const splitBtn = document.getElementById("splitBtn");
  const doubleDownBtn = document.getElementById("doubleDownBtn");

  // Update button visibility
  hitBtn.hidden = !canPlay;
  standBtn.hidden = false;
  // splitBtn.hidden = !isSplitAllowed();
  // doubleDownBtn.hidden = !isDoubleDownAllowed();
}

// Hide game buttons from view
export function hideGameButtons() {
  const hitBtn = document.getElementById("hitBtn");
  const standBtn = document.getElementById("standBtn");
  // const splitBtn = document.getElementById("splitBtn");
  // const doubleDownBtn = document.getElementById("doubleDownBtn");
  hitBtn.hidden = true;
  standBtn.hidden = true;
  // splitBtn.hidden = true;
  // doubleDownBtn.hidden = true;
}
