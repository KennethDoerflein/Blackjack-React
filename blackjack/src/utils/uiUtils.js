import { delay } from "./utils";

export const addCard = async (cards, div, entity, origin, deck, setHandElements, currentHand) => {
  const card = deck.getCard();
  cards.push(card);

  // Add a conditional delay for the first card to ensure uniformity
  const isFirstCard = cards.length === 1;
  const delayTime = isFirstCard ? 100 : 0;

  const imgElement = await createCardImage("./assets/cards-1.3/back.png");
  let reactImgElement = createReactImageElement(
    cards.length,
    imgElement.src,
    card.image,
    "imgSlide"
  );

  requestAnimationFrame(() => {
    updateHandElements(setHandElements, entity, currentHand, reactImgElement);
  });

  await delay(300 + delayTime);

  if (shouldFlipCard(entity, cards)) {
    await flipCard(reactImgElement, card, setHandElements, entity, currentHand);
  }
};

const createReactImageElement = (key, src, alt, className) => {
  return <img key={key} src={src} alt={alt} className={className} />;
};

const updateHandElements = (setHandElements, entity, currentHand, reactImgElement) => {
  setHandElements((prev) => {
    let newHandElements = [...prev];
    if (entity !== "dealer") {
      newHandElements[currentHand] = [...newHandElements[currentHand], reactImgElement];
    } else {
      newHandElements = [...newHandElements, reactImgElement];
    }
    return newHandElements;
  });
};

export const flipCard = async (reactImgElement, card, setHandElements, entity, currentHand) => {
  const finalImgPath = `./assets/cards-1.3/${card.image}`;
  const newSrc = await preloadAndGetImage(finalImgPath);
  const flippedReactImgElement = createReactImageElement(
    reactImgElement.key,
    newSrc,
    card.image,
    "imgFlip"
  );

  requestAnimationFrame(() => {
    updateFlippedHandElements(setHandElements, entity, currentHand, flippedReactImgElement);
  });

  const normalReactImgElement = createReactImageElement(
    reactImgElement.key,
    newSrc,
    card.image,
    ""
  );
  await delay(500);

  requestAnimationFrame(() => {
    updateFlippedHandElements(setHandElements, entity, currentHand, normalReactImgElement);
  });
};

const updateFlippedHandElements = (
  setHandElements,
  entity,
  currentHand,
  flippedReactImgElement
) => {
  setHandElements((prev) => {
    let newHandElements = [...prev];
    if (entity !== "dealer") {
      newHandElements[currentHand] = [
        ...newHandElements[currentHand].slice(0, -1),
        flippedReactImgElement,
      ];
    } else {
      newHandElements = [...newHandElements.slice(0, -1), flippedReactImgElement];
    }
    return newHandElements;
  });
};

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
