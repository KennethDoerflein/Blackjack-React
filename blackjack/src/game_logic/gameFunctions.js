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

// Determine if the dealer should hit based on game rules
export function shouldDealerHit(total, hand) {
  const soft17Switch = document.getElementById("soft17Switch");
  if (soft17Switch && soft17Switch.checked) {
    return total < 17 || (total === 17 && isSoft17(hand));
  }
  return total < 17;
}

// Check if a hand is a soft 17 (total 17 with an Ace counted as 11)
function isSoft17(cards) {
  const totalWithoutAces = calculateTotalWithoutAces(cards);
  const numAces = countAces(cards);
  return totalWithoutAces === 6 && numAces > 0;
}

// Calculate total points for a hand, excluding reduction of Aces to 1
function calculateTotalWithoutAces(cards) {
  let total = 0;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].rank !== "ace") {
      total += cards[i].pointValue;
    }
  }
  return total;
}

// Count the number of Aces in a hand
function countAces(cards) {
  return cards.filter((card) => card.rank === "ace").length;
}

// Return true if player’s total is 21 and auto stand is on
export function autoStandOn21(currentHandTotal) {
  const standSwitch = document.getElementById("standSwitch");
  return currentHandTotal === 21 && standSwitch && standSwitch.checked;
}
