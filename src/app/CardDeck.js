class Card {
  constructor(rank, suit, pointValue, image) {
    this.rank = rank;
    this.suit = suit;
    this.pointValue = pointValue;
    this.image = image; // https://code.google.com/archive/p/vector-playing-cards/
  }
}

class CardDeck {
  constructor(decks = 6) {
    this.RANKS = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];
    this.SUITS = ["spades", "hearts", "diamonds", "clubs"];
    this.POINT_VALUES = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
    this.numberOfDecks = decks;
    this.loading = true;

    this.cards = this.createDeck();
    this.dealtCards = [];
    this.initialDeckSize = this.cards.length;
    this.preloadImages().then(() => {
      this.casinoShuffle().then(() => {
        this.loading = false;
      });
    });
  }

  createDeck() {
    let deck = [];
    for (let i = 0; i < this.numberOfDecks; i++) {
      deck = deck.concat(
        this.RANKS.flatMap((rank) =>
          this.SUITS.map((suit) => {
            let pointValue = this.POINT_VALUES[this.RANKS.indexOf(rank)];
            let image = `${rank}_of_${suit}.png`;
            return new Card(rank, suit, pointValue, image);
          })
        )
      );
    }
    return deck;
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

  getRandomInt(min, max) {
    const range = max - min + 1;
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    return min + (randomArray[0] % range);
  }

  casinoShuffle() {
    return this.durstenfeldShuffle()
      .then(() => this.overhandShuffle())
      .then(() => this.riffleShuffle())
      .then(() => this.stripShuffle())
      .then(() => this.cutDeck());
  }

  durstenfeldShuffle() {
    return new Promise((resolve) => {
      const array = this.cards;
      const n = array.length;
      for (let i = n - 1; i > 0; i--) {
        const j = this.getRandomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
      }
      resolve();
    });
  }

  overhandShuffle() {
    return new Promise((resolve) => {
      let tempDeck = [];
      let maxIterations = 100;
      let iterations = 0;

      while (this.cards.length > 0 && iterations < maxIterations) {
        const chunkSize = this.getRandomInt(1, Math.min(10, this.cards.length));
        const chunk = this.cards.splice(0, chunkSize);

        if (this.getRandomInt(1, 101) <= 50) {
          tempDeck = tempDeck.concat(chunk);
        } else {
          tempDeck = chunk.concat(tempDeck);
        }
        iterations++;
      }

      this.cards = tempDeck;
      resolve();
    });
  }

  riffleShuffle() {
    return new Promise((resolve) => {
      const half = Math.floor(this.cards.length / 2);
      let leftHalf = this.cards.slice(0, half);
      let rightHalf = this.cards.slice(half);

      let shuffledDeck = [];
      while (leftHalf.length > 0 && rightHalf.length > 0) {
        if (this.getRandomInt(1, 101) <= 50) {
          shuffledDeck.push(leftHalf.shift());
        } else {
          shuffledDeck.push(rightHalf.shift());
        }
      }

      this.cards = shuffledDeck.concat(leftHalf).concat(rightHalf);
      resolve();
    });
  }

  stripShuffle() {
    return new Promise((resolve) => {
      let topIndex = this.getRandomInt(0, this.cards.length / 2);
      let bottomIndex = this.getRandomInt(this.cards.length / 2, this.cards.length);

      let topPortion = this.cards.slice(0, topIndex);
      let middlePortion = this.cards.slice(topIndex, bottomIndex);
      let bottomPortion = this.cards.slice(bottomIndex);

      this.cards = bottomPortion.concat(middlePortion).concat(topPortion);
      resolve();
    });
  }

  cutDeck() {
    return new Promise((resolve) => {
      const cutIndex = this.getRandomInt(this.cards.length / 4, (3 * this.cards.length) / 4);
      const cutPart = this.cards.splice(0, cutIndex);
      this.cards = this.cards.concat(cutPart);
      resolve();
    });
  }

  async reshuffle() {
    // Reshuffle when 75% of the deck has been dealt
    const threshold = this.initialDeckSize * 0.75;
    if (this.dealtCards.length >= threshold) {
      this.loading = true;
      this.cards = this.cards.concat(this.dealtCards);
      this.dealtCards = [];
      this.casinoShuffle().then(() => {
        this.loading = false;
      });
    }
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
