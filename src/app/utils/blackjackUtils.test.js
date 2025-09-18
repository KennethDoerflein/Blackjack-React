import { calculateTotal, shouldDealerHit, isSplitAllowed, isDoubleDownAllowed } from './blackjackUtils';

describe('blackjackUtils', () => {
  describe('calculateTotal', () => {
    it('should calculate the total of a hand without aces', () => {
      const hand = [{ pointValue: 10 }, { pointValue: 5 }];
      expect(calculateTotal(hand)).toBe(15);
    });

    it('should calculate the total of a hand with one ace', () => {
      const hand = [{ pointValue: 10, rank: 'king' }, { pointValue: 11, rank: 'ace' }];
      expect(calculateTotal(hand)).toBe(21);
    });

    it('should calculate the total of a hand with one ace that should be 1', () => {
      const hand = [{ pointValue: 10, rank: 'king' }, { pointValue: 10, rank: 'queen' }, { pointValue: 11, rank: 'ace' }];
      expect(calculateTotal(hand)).toBe(21);
    });

    it('should calculate the total of a hand with multiple aces', () => {
      const hand = [{ pointValue: 11, rank: 'ace' }, { pointValue: 11, rank: 'ace' }];
      expect(calculateTotal(hand)).toBe(12);
    });

    it('should calculate the total of a hand with multiple aces that should be 1', () => {
      const hand = [{ pointValue: 10, rank: 'king' }, { pointValue: 11, rank: 'ace' }, { pointValue: 11, rank: 'ace' }];
      expect(calculateTotal(hand)).toBe(12);
    });
  });

  describe('shouldDealerHit', () => {
    it('should return true if total is less than 17', () => {
      expect(shouldDealerHit(16, [], false)).toBe(true);
    });

    it('should return false if total is 17 or more', () => {
      expect(shouldDealerHit(17, [], false)).toBe(false);
      expect(shouldDealerHit(18, [], false)).toBe(false);
    });

    it('should return true on soft 17 if soft17Checked is true', () => {
      const hand = [{ pointValue: 6, rank: '6' }, { pointValue: 11, rank: 'ace' }];
      expect(shouldDealerHit(17, hand, true)).toBe(true);
    });

    it('should return false on hard 17 if soft17Checked is true', () => {
      const hand = [{ pointValue: 10, rank: '10' }, { pointValue: 7, rank: '7' }];
      expect(shouldDealerHit(17, hand, true)).toBe(false);
    });
  });

  describe('isSplitAllowed', () => {
    it('should return true if split is allowed', () => {
      const playersHands = [[{ rank: 'ace' }, { rank: 'ace' }]];
      const currentHand = 0;
      const splitCount = 0;
      const currentWager = [10];
      const playerPoints = 100;
      const splitTypeChecked = true;
      expect(isSplitAllowed(playersHands, currentHand, splitCount, currentWager, playerPoints, splitTypeChecked)).toBe(true);
    });

    it('should return false if hand has more than 2 cards', () => {
      const playersHands = [[{ rank: 'ace' }, { rank: 'ace' }, { rank: 'ace' }]];
      const currentHand = 0;
      const splitCount = 0;
      const currentWager = [10];
      const playerPoints = 100;
      const splitTypeChecked = true;
      expect(isSplitAllowed(playersHands, currentHand, splitCount, currentWager, playerPoints, splitTypeChecked)).toBe(false);
    });

    it('should return false if cards do not have the same rank', () => {
      const playersHands = [[{ rank: 'ace' }, { rank: 'king' }]];
      const currentHand = 0;
      const splitCount = 0;
      const currentWager = [10];
      const playerPoints = 100;
      const splitTypeChecked = true;
      expect(isSplitAllowed(playersHands, currentHand, splitCount, currentWager, playerPoints, splitTypeChecked)).toBe(false);
    });

    it('should return false if player does not have enough points', () => {
      const playersHands = [[{ rank: 'ace' }, { rank: 'ace' }]];
      const currentHand = 0;
      const splitCount = 0;
      const currentWager = [10];
      const playerPoints = 5;
      const splitTypeChecked = true;
      expect(isSplitAllowed(playersHands, currentHand, splitCount, currentWager, playerPoints, splitTypeChecked)).toBe(false);
    });
  });

  describe('isDoubleDownAllowed', () => {
    it('should return true if double down is allowed', () => {
      const playersHands = [[{ rank: 'ace' }, { rank: 'ace' }]];
      const currentHand = 0;
      const playerTotal = 12;
      const currentWager = [10];
      const playerPoints = 100;
      expect(isDoubleDownAllowed(playersHands, currentHand, playerTotal, currentWager, playerPoints)).toBe(true);
    });

    it('should return false if hand has more than 2 cards', () => {
      const playersHands = [[{ rank: 'ace' }, { rank: 'ace' }, { rank: 'ace' }]];
      const currentHand = 0;
      const playerTotal = 13;
      const currentWager = [10];
      const playerPoints = 100;
      expect(isDoubleDownAllowed(playersHands, currentHand, playerTotal, currentWager, playerPoints)).toBe(false);
    });

    it('should return false if player total is over 21', () => {
      const playersHands = [[{ rank: 'ace' }, { rank: 'ace' }]];
      const currentHand = 0;
      const playerTotal = 22;
      const currentWager = [10];
      const playerPoints = 100;
      expect(isDoubleDownAllowed(playersHands, currentHand, playerTotal, currentWager, playerPoints)).toBe(false);
    });

    it('should return false if player does not have enough points', () => {
      const playersHands = [[{ rank: 'ace' }, { rank: 'ace' }]];
      const currentHand = 0;
      const playerTotal = 12;
      const currentWager = [10];
      const playerPoints = 5;
      expect(isDoubleDownAllowed(playersHands, currentHand, playerTotal, currentWager, playerPoints)).toBe(false);
    });
  });
});
