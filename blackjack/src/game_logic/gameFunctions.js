import { preloadAndGetImage, shouldFlipCard, createCardImage, delay } from "../utils/utils.js";

export const calculateTotal = async (cards) => {
  let total = 0;
  let aces = 0;
  for (let i = 0; i < cards.length; i++) {
    total += cards[i].pointValue;
    if (cards[i].rank === "ace") {
      aces++;
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
};

export const addCard = async (cards, div, entity, origin, deck, setHandElements, currentHand) => {
  const card = deck.getCard();
  cards.push(card);

  const imgElement = await createCardImage("./assets/cards-1.3/back.png");
  let reactImgElement = createReactImageElement(cards.length, imgElement.src, card.image, "imgSlide");

  updateHandElements(setHandElements, entity, currentHand, reactImgElement);
  await delay(300);

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
  const flippedReactImgElement = createReactImageElement(reactImgElement.key, newSrc, card.image, "imgFlip");

  updateFlippedHandElements(setHandElements, entity, currentHand, flippedReactImgElement);
};

const updateFlippedHandElements = (setHandElements, entity, currentHand, flippedReactImgElement) => {
  setHandElements((prev) => {
    let newHandElements = [...prev];
    if (entity !== "dealer") {
      newHandElements[currentHand] = [...newHandElements[currentHand].slice(0, -1), flippedReactImgElement];
    } else {
      newHandElements = [...newHandElements.slice(0, -1), flippedReactImgElement];
    }
    return newHandElements;
  });
};
