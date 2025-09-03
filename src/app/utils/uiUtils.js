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

  await new Promise((r) =>
    requestAnimationFrame(() => {
      updateHandElements(setHandElements, entity, currentHand, descriptor);
      r();
    })
  );

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
  requestAnimationFrame(() =>
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
    })
  );
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
  await new Promise((r) =>
    requestAnimationFrame(() => {
      updateFlippedHandElements(setHandElements, entity, currentHand, flippedDescriptor);
      r();
    })
  );

  // halfway point (222ms of 444ms)
  await pausableDelay(FLIP_ANIMATION_DURATION / 2, isTabVisible, visibilityPromiseResolver);
  if (halfwayCallback) await halfwayCallback();

  // second half of flip
  await pausableDelay(FLIP_ANIMATION_DURATION / 2, isTabVisible, visibilityPromiseResolver);

  // final stable state
  const normalDescriptor = { id: cardId, src: faceImg.src, image: card.image, className: "" };
  await new Promise((r) =>
    requestAnimationFrame(() => {
      updateFlippedHandElements(setHandElements, entity, currentHand, normalDescriptor);
      r();
    })
  );
};

const updateFlippedHandElements = (setHandElements, entity, currentHand, descriptor) => {
  requestAnimationFrame(() =>
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
    })
  );
};

// Animate the card with a given class and delay
export function animateElement(element, animationClass, delayTime) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      // Remove any lingering animation class before starting
      element.classList.remove(animationClass);
      // Force reflow to restart animation if needed
      void element.offsetWidth;
      requestAnimationFrame(() => {
        element.classList.add(animationClass);
        setTimeout(() => {
          element.classList.remove(animationClass);
          resolve();
        }, delayTime);
      });
    });
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
  const cardCount = images.length;
  if (images.length < 2 || resize) {
    requestAnimationFrame(() => {
      div.style.width = "fit-content";
      div.style.justifyContent = cardCount < 2 ? "center" : "flex-start";
    });
    if (!resize && images.length < 2) return;
  }
  await Promise.all(
    Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) resolve();
        else img.onload = resolve;
      });
    })
  );

  const containerPadding =
    parseFloat(window.getComputedStyle(div).paddingLeft) +
    parseFloat(window.getComputedStyle(div).paddingRight);

  const viewportWidth = getViewportWidth() - containerPadding;
  const cardWidth =
    images[1].offsetWidth + (parseFloat(window.getComputedStyle(images[1]).marginRight) || 0);

  let allWidth = cardWidth * cardCount;
  allWidth -= parseFloat(window.getComputedStyle(images[1]).marginRight) || 0; // last card doesn't have margin right
  allWidth = Math.ceil(allWidth);

  const classSelector = allWidth < viewportWidth && cardCount === 3 ? "imgFlip" : "imgSlide";
  if (images.length > 0 && images[images.length - 1].className !== classSelector && !resize) return;

  const overlapFactor = window.innerHeight > window.innerWidth ? 0.9 : 0.75;
  const maxImageOffsetPx = -cardWidth * overlapFactor;
  let marginLeftPx = -(allWidth - viewportWidth) / (cardCount - 1);
  marginLeftPx = marginLeftPx > 0 ? 0 : marginLeftPx;

  const finalMarginPx = Math.max(marginLeftPx, maxImageOffsetPx);

  if (!resize) {
    if (finalMarginPx === 0) {
      requestAnimationFrame(() => {
        div.style.width = `${allWidth + containerPadding}px`;
        div.style.justifyContent = "flex-start";
      });
    } else if (allWidth > viewportWidth && finalMarginPx < 0) {
      requestAnimationFrame(() => {
        div.style.width = `${viewportWidth + containerPadding}px`;
        div.style.justifyContent = "flex-start";
      });
    }
  }

  requestAnimationFrame(() => {
    if (finalMarginPx === parseFloat(window.getComputedStyle(images[1]).marginLeft)) return;
    images.forEach((img, index) => {
      if (index !== 0) {
        img.style.marginLeft = `${finalMarginPx}px`;
        // Force Safari to respect the margin by triggering layout
        void img.offsetWidth;
      }
    });
  });
}

function getViewportWidth() {
  return window.innerWidth < 1000 ? window.innerWidth * 0.85 : window.innerWidth * 0.4;
}
