import { toggleDisabledElement, preloadAndGetImage, shouldFlipCard, createCardImage, delay } from "../utils/utils.js";

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

export const addCard = async (cards, div, entity, origin, deck) => {
  const card = deck.getCard();
  cards.push(card);

  const imgElement = await createCardImage("./assets/cards-1.3/back.png");

  let reactImgElement = <img key={cards.length} src={imgElement.src} alt={card.image} />;
  div.push(reactImgElement);
  if (shouldFlipCard(entity, cards)) {
    const finalImgPath = `./assets/cards-1.3/${card.image}`;
    const newSrc = await preloadAndGetImage(finalImgPath);
    reactImgElement = <img key={cards.length} src={newSrc} alt={card.image} />;
    div[div.length - 1] = reactImgElement;
  }
};
