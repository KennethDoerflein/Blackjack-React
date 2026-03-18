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
    // Use a Set to get unique image paths, preventing duplicate loads for multiple decks.
    const uniqueImagePaths = [
      ...new Set(this.cards.map((card) => `./assets/cards-1.3/${card.image}`)),
    ];

    const promises = uniqueImagePaths.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
      });
    });
    return Promise.all(promises);
  }

  getRandomInt(min, max) {
    min = Math.floor(min);
    max = Math.floor(max);
    if (min >= max) return min;

    const range = max - min + 1;
    const randomArray = new Uint32Array(1);
    window.crypto.getRandomValues(randomArray);
    return min + (randomArray[0] % range);
  }

  async casinoShuffle() {
    await this.durstenfeldShuffle();
    await this.overhandShuffle();
    await this.riffleShuffle();
    await this.stripShuffle();
    return await this.cutDeck();
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
      if (!this.cards || this.cards.length <= 1) {
        resolve();
        return;
      }

      let tempDeck = [];

      while (this.cards.length > 0) {
        // Ensure chunkSize is at least 1 and no more than 10 or the remaining cards.
        const chunkSize = this.getRandomInt(1, Math.min(10, this.cards.length));
        const chunk = this.cards.splice(0, chunkSize);

        // Randomly prepend or append the chunk to build the new deck.
        if (this.getRandomInt(1, 100) <= 50) {
          tempDeck = tempDeck.concat(chunk);
        } else {
          tempDeck = chunk.concat(tempDeck);
        }
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
        shuffledDeck.push(this.getRandomInt(1, 101) <= 50 ? leftHalf.shift() : rightHalf.shift());
      }

      this.cards = shuffledDeck.concat(leftHalf).concat(rightHalf);
      resolve();
    });
  }

  stripShuffle() {
    return new Promise((resolve) => {
      if (!this.cards || this.cards.length < 2) {
        resolve();
        return;
      }

      const topIndex = this.getRandomInt(0, Math.floor(this.cards.length / 2));
      const bottomIndex = this.getRandomInt(Math.floor(this.cards.length / 2), this.cards.length);

      const topPortion = this.cards.slice(0, topIndex);
      const middlePortion = this.cards.slice(topIndex, bottomIndex);
      const bottomPortion = this.cards.slice(bottomIndex);

      this.cards = bottomPortion.concat(middlePortion).concat(topPortion);
      resolve();
    });
  }

  cutDeck() {
    return new Promise((resolve) => {
      if (!this.cards || this.cards.length < 2) {
        resolve();
        return;
      }

      const cutPointMin = Math.floor(this.cards.length / 4);
      const cutPointMax = Math.floor((3 * this.cards.length) / 4);
      const cutIndex = this.getRandomInt(cutPointMin, cutPointMax);

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
