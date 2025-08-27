import { pausableDelay } from "./utils";
import { CARD_FLIP_TIME } from "./constants";

// Animation timing constants
const FLIP_ANIMATION_DURATION = 700; // ms for flip (match CSS)

export const addCard = async (
  cards,
  div,
  entity,
  origin,
  deck,
  setHandElements,
  currentHand,
  halfwayCallback,
  isTabVisible,
  visibilityPromiseResolver,
  uniqueCardId
) => {
  const card = deck.getCard();
  cards.push(card);

  const cardId = `card-${uniqueCardId}`;

  let descriptor;
  let src = `./assets/cards-1.3/back.png`;
  descriptor = {
    id: cardId,
    src,
    image: card.image,
    className: "imgSlide",
  };

  // Update hand elements for both dealer and player
  updateHandElements(setHandElements, entity, currentHand, descriptor);

  await pausableDelay(CARD_FLIP_TIME, isTabVisible, visibilityPromiseResolver);

  if (shouldFlipCard(entity, cards)) {
    await flipCard(
      descriptor.id,
      card,
      setHandElements,
      entity,
      currentHand,
      halfwayCallback,
      isTabVisible,
      visibilityPromiseResolver
    );
  }

  return descriptor.id;
};

const updateHandElements = (setHandElements, entity, currentHand, descriptor) => {
  setHandElements((prev) => {
    if (entity !== "dealer") {
      // prev is array of hands: [ [cards], [cards], ... ]
      const newHands = prev.map((h) => h.slice());
      // ensure hand exists
      if (!newHands[currentHand]) newHands[currentHand] = [];
      newHands[currentHand] = [...newHands[currentHand], descriptor];
      return newHands;
    } else {
      // dealersHandElements is a flat array
      return [...prev, descriptor];
    }
  });
};

export const flipCard = async (
  cardId,
  card,
  setHandElements,
  entity,
  currentHand,
  halfwayCallback,
  isTabVisible,
  visibilityPromiseResolver
) => {
  const finalImgPath = `./assets/cards-1.3/${card.image}`;
  const newSrc = await preloadAndGetImage(finalImgPath);

  // first stage of flip (class 'imgFlip' should drive the CSS 3D flip)
  const flippedDescriptor = { id: cardId, src: newSrc, image: card.image, className: "imgFlip" };
  updateFlippedHandElements(setHandElements, entity, currentHand, flippedDescriptor);

  // Call halfwayCallback at 350ms (halfway through 700ms flip)
  if (halfwayCallback) {
    await pausableDelay(CARD_FLIP_TIME / 2, isTabVisible, visibilityPromiseResolver);
    await halfwayCallback();
  } else {
    // wait half the animation so timing stays consistent
    await pausableDelay(CARD_FLIP_TIME / 2, isTabVisible, visibilityPromiseResolver);
  }

  await pausableDelay(FLIP_ANIMATION_DURATION, isTabVisible, visibilityPromiseResolver);

  // final stable state (no flip class)
  const normalDescriptor = { id: cardId, src: newSrc, image: card.image, className: "" };
  updateFlippedHandElements(setHandElements, entity, currentHand, normalDescriptor);
};

const updateFlippedHandElements = (setHandElements, entity, currentHand, descriptor) => {
  setHandElements((prev) => {
    if (entity !== "dealer") {
      const newHands = prev.map((h) => h.slice());
      newHands[currentHand] = newHands[currentHand].map((c) =>
        c.id === descriptor.id ? descriptor : c
      );
      return newHands;
    } else {
      return prev.map((c) => (c.id === descriptor.id ? descriptor : c));
    }
  });
};

// Animate the card with a given class and delay
export function animateElement(element, animationClass, delayTime) {
  return new Promise((resolve) => {
    // Remove any lingering animation class before starting
    element.classList.remove(animationClass);
    // Force reflow to restart animation if needed
    void element.offsetWidth;
    element.classList.add(animationClass);
    setTimeout(() => {
      element.classList.remove(animationClass);
      resolve();
    }, delayTime);
  });
}

// Create an HTML image element for preloading
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

// Preload an image
export function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = resolve;
  });
}

// Calculate and adjust card margins to avoid overflow
export async function adjustCardMargins(div, resize = false) {
  const images = div.querySelectorAll("img");
  if (images.length === 0) return;
  if (images[images.length - 1].className !== "imgSlide" && !resize) return;
  await Promise.all(
    Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) resolve();
        else img.onload = resolve;
      });
    })
  );

  const viewportWidth = getViewportWidth();
  const cardCount = images.length;
  let allWidth = 0;

  images.forEach((img, index) => {
    const computedStyle = window.getComputedStyle(img);
    const marginLeft = parseFloat(computedStyle.marginLeft) || 0;
    const marginRight = parseFloat(computedStyle.marginRight) || 0;
    allWidth += marginLeft + marginRight + img.offsetWidth;
    if (index === cardCount - 3) {
      allWidth += marginLeft + marginRight + img.offsetWidth || 0;
    }
  });

  const imgWidthPx = images[1] ? images[1].offsetWidth : images[0].offsetWidth;
  const overlapFactor = window.innerHeight > window.innerWidth ? 0.9 : 0.75;
  const maxImageOffsetPx = -imgWidthPx * overlapFactor;
  let marginLeftPx = -(allWidth - viewportWidth) / (cardCount - 1);
  marginLeftPx += parseFloat(window.getComputedStyle(images[1] || images[0]).marginLeft) || 0;
  marginLeftPx = marginLeftPx > 0 ? 0 : marginLeftPx;

  const finalMarginPx = Math.max(marginLeftPx, maxImageOffsetPx);

  images.forEach((img, index) => {
    if (index !== 0) {
      img.style.marginLeft = `${finalMarginPx}px`;
    }
  });
}

function getViewportWidth() {
  return window.innerWidth < 1000 ? window.innerWidth : window.innerWidth * 0.5;
}
