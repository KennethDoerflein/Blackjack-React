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
export function updateGameButtons(playerTotal, playerHands, currentHand, splitCount, currentWager, playerPoints) {
  const canPlay = playerTotal <= 21;
  const hitBtn = document.getElementById("hitBtn");
  const standBtn = document.getElementById("standBtn");
  const doubleDownBtn = document.getElementById("doubleDownBtn");

  // Update button visibility
  hitBtn.hidden = !canPlay;
  standBtn.hidden = false;
  checkSplitButton(playerHands, currentHand, splitCount, currentWager, playerPoints);
  // doubleDownBtn.hidden = !isDoubleDownAllowed();
}

// Hide game buttons from view
export function hideGameButtons() {
  const hitBtn = document.getElementById("hitBtn");
  const standBtn = document.getElementById("standBtn");
  const splitBtn = document.getElementById("splitBtn");
  // const doubleDownBtn = document.getElementById("doubleDownBtn");
  hitBtn.hidden = true;
  standBtn.hidden = true;
  splitBtn.hidden = true;
  // doubleDownBtn.hidden = true;
}

// Check if the split button should be shown based on split switch (point value or rank)
export function checkSplitButton(playersHand, currentHand, splitCount, currentWager, playerPoints) {
  const hitBtn = document.getElementById("hitBtn");
  const splitBtn = document.getElementById("splitBtn");
  if (hitBtn && splitBtn) {
    const isSplitAllowedResult = isSplitAllowed(playersHand, currentHand, splitCount, currentWager, playerPoints);
    splitBtn.hidden = !hitBtn.hidden && isSplitAllowedResult ? false : true;
  }
}

// Check if splitting is allowed based on current hand and rules
export const isSplitAllowed = (playerHands, currentHand, splitCount, currentWager, playerPoints) => {
  const splitSwitch = document.getElementById("splitSwitch");
  if (!playerHands[currentHand] || playerHands[currentHand].length < 2) {
    return false;
  }
  const isMatchingRankOrValue = splitSwitch.checked
    ? playerHands[currentHand][0].rank === playerHands[currentHand][1].rank
    : playerHands[currentHand][0].pointValue === playerHands[currentHand][1].pointValue;
  return splitCount < 3 && playerHands[currentHand].length === 2 && isMatchingRankOrValue && isWagerAllowed(currentWager[currentHand], playerPoints);
};

// Check if the current wager is allowed based on player points
export function isWagerAllowed(currentWager, playerPoints) {
  return currentWager <= playerPoints;
}
