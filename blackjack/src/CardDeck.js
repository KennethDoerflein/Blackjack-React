class Card {
  constructor(rank, suit, pointValue, image) {
    this.rank = rank;
    this.suit = suit;
    this.pointValue = pointValue;
    // https://code.google.com/archive/p/vector-playing-cards/
    this.image = image;
  }
}

class CardDeck {
  constructor() {
    this.RANKS = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];
    this.SUITS = ["spades", "hearts", "diamonds", "clubs"];
    this.POINT_VALUES = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];

    this.cards = this.createDeck();
    this.dealtCards = [];
    this.preloadImages().then(() => {
      this.shuffle();
    });
  }

  createDeck() {
    return this.RANKS.flatMap((rank) =>
      this.SUITS.map((suit) => {
        let pointValue = this.POINT_VALUES[this.RANKS.indexOf(rank)];
        let image = `${rank}_of_${suit}.png`;
        return new Card(rank, suit, pointValue, image);
      })
    );
  }

  preloadImages() {
    let images = this.cards.map((card) => `./assets/cards-1.3/${card.image}`);

    let promises = images.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
      });
    });

    return Promise.all(promises);
  }

  shuffle() {
    const array = this.cards;
    const n = array.length;

    for (let i = n - 1; i > 0; i--) {
      const j = this.getRandomInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    this.overhandShuffle();
    this.riffleShuffle();
  }

  overhandShuffle() {
    let tempDeck = [];

    while (this.cards.length > 0) {
      const chunkSize = this.getRandomInt(1, this.cards.length);

      const chunk = this.cards.splice(0, chunkSize);

      if (Math.random() < 0.5) {
        tempDeck = tempDeck.concat(chunk);
      } else {
        tempDeck = chunk.concat(tempDeck);
      }
    }

    this.cards = tempDeck;
  }

  riffleShuffle() {
    const half = Math.floor(this.cards.length / 2);
    let leftHalf = this.cards.slice(0, half);
    let rightHalf = this.cards.slice(half);

    let shuffledDeck = [];
    while (leftHalf.length > 0 && rightHalf.length > 0) {
      if (Math.random() < 0.5) {
        shuffledDeck.push(leftHalf.shift());
      } else {
        shuffledDeck.push(rightHalf.shift());
      }
    }

    this.cards = shuffledDeck.concat(leftHalf).concat(rightHalf);
  }

  getRandomInt(min, max) {
    const range = max - min + 1;
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    return min + (randomArray[0] % range);
  }

  reshuffle() {
    this.cards = this.cards.concat(this.dealtCards);
    this.dealtCards = [];
    this.shuffle();
  }

  getCard() {
    if (this.cards.length === 0) {
      return null;
    }
    const card = this.cards.pop();
    this.dealtCards.push(card);
    return card;
  }
}

export default CardDeck;
