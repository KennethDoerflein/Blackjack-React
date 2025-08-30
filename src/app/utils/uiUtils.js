import { pausableDelay } from "./utils";
import { CARD_FLIP_TIME } from "./constants";

// Animation timing constants
const FLIP_ANIMATION_DURATION = 700; // ms for flip (match CSS)
const decodedCache = new Map();

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
  const backSrc = `./assets/cards-1.3/back.png`;

  // get from cache
  const backImg = getCachedImage(backSrc) || (await preloadImage(backSrc));

  const descriptor = { id: cardId, src: backImg.src, image: card.image, className: "imgSlide" };

  if (entity === "player" && cards.length <= 1) {
    await pausableDelay(CARD_FLIP_TIME, isTabVisible, visibilityPromiseResolver);
  }

  updateHandElements(setHandElements, entity, currentHand, descriptor);

  await pausableDelay(CARD_FLIP_TIME, isTabVisible, visibilityPromiseResolver);

  if (shouldFlipCard(entity, cards)) {
    await flipCard(
      cardId,
      card,
      setHandElements,
      entity,
      currentHand,
      halfwayCallback,
      isTabVisible,
      visibilityPromiseResolver
    );
  }

  return cardId;
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
  const faceImg = getCachedImage(finalImgPath) || (await preloadImage(finalImgPath));

  // start flip immediately
  const flippedDescriptor = {
    id: cardId,
    src: faceImg.src,
    image: card.image,
    className: "imgFlip",
  };
  updateFlippedHandElements(setHandElements, entity, currentHand, flippedDescriptor);

  // halfway point (350ms of 700ms)
  await pausableDelay(FLIP_ANIMATION_DURATION / 2, isTabVisible, visibilityPromiseResolver);
  if (halfwayCallback) await halfwayCallback();

  // second half of flip
  await pausableDelay(FLIP_ANIMATION_DURATION / 2, isTabVisible, visibilityPromiseResolver);

  // final stable state
  const normalDescriptor = { id: cardId, src: faceImg.src, image: card.image, className: "" };
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

export async function preloadImage(src) {
  if (decodedCache.has(src)) return decodedCache.get(src);

  const img = new Image();
  img.src = src;

  // force decode
  await img.decode().catch(
    () =>
      new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      })
  );

  decodedCache.set(src, img); // store the decoded <img>
  return img;
}

export async function preloadDeckImages(deck) {
  const allImages = deck.cards.map((card) => `./assets/cards-1.3/${card.image}`);
  allImages.push("./assets/cards-1.3/back.png");
  await Promise.all(allImages.map(preloadImage));
}

// for lookups later
export function getCachedImage(src) {
  return decodedCache.get(src) || null;
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

  const imgWidthPx = images[1].offsetWidth;
  const overlapFactor = window.innerHeight > window.innerWidth ? 0.9 : 0.75;
  const maxImageOffsetPx = -imgWidthPx * overlapFactor;
  let marginLeftPx = -(allWidth - viewportWidth) / (cardCount - 1);
  marginLeftPx += parseFloat(window.getComputedStyle(images[1]).marginLeft) || 0;
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
