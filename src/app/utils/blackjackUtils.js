// Calculate total points for a hand
export const calculateTotal = (cards) => {
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

// Determine if the dealer should hit based on game rules
export function shouldDealerHit(total, hand, soft17Checked) {
  if (soft17Checked) {
    return total < 17 || (total === 17 && isSoft17(hand));
  }
  return total < 17;
}

// Check if a hand is a soft 17 (total 17 with an Ace counted as 11)
function isSoft17(cards) {
  if (calculateTotal(cards) !== 17) return false;
  // calculateHardTotal counts every Ace as 1. If that sum is 7, 
  // then one Ace can be 11 (7 - 1 + 11 = 17), making it a soft hand.
  return calculateHardTotal(cards) === 7;
}

// Sum the hand with every Ace valued at 1 (the true "hard" total)
function calculateHardTotal(cards) {
  return cards.reduce((sum, card) => sum + (card.rank === "ace" ? 1 : card.pointValue), 0);
}


// Check if splitting is allowed based on current hand and rules

export const isSplitAllowed = (
  playersHands,
  currentHand,
  splitCount,
  currentWager,
  playerPoints,
  splitTypeChecked
) => {
  if (!playersHands[currentHand] || playersHands[currentHand].length < 2) {
    return false;
  }
  const cardA = playersHands[currentHand][0];
  const cardB = playersHands[currentHand][1];
  const isMatchingRankOrValue = splitTypeChecked
    ? cardA.rank === cardB.rank // strict rank match
    : cardA.pointValue === cardB.pointValue; // value match

  return (
    playersHands[currentHand].length === 2 &&
    isMatchingRankOrValue &&
    isWagerAllowed(currentWager[currentHand], playerPoints)
  );
};

// Check if the current wager is allowed based on player points
export function isWagerAllowed(currentWager, playerPoints) {
  return currentWager <= playerPoints;
}

// Check if doubling down is allowed based on current hand and rules
export function isDoubleDownAllowed(
  playersHands,
  currentHand,
  playerTotal,
  currentWager,
  playerPoints
) {
  return (
    playersHands[currentHand].length === 2 &&
    playerTotal <= 21 &&
    isWagerAllowed(currentWager[currentHand], playerPoints)
  );
}

// Calculate total points for all hands and return them
export function calculateAndReturnTotals(newPlayersHands, playerTotals, dealersHand) {
  const newTotals = [...playerTotals];
  for (let i = 0; i < newPlayersHands.length; i++) {
    newTotals[i] = calculateTotal(newPlayersHands[i]);
  }
  const newDealerTotal = calculateTotal(dealersHand);
  return { newTotals, newDealerTotal };
}

// Calculate the probability of busting on the next card
export function calculateBustProbability(
  playerHand,
  remainingCards,
  pointValues,
  ranks,
  dealerHand
) {
  if (!remainingCards || !playerHand) return 0;

  // Create a mutable copy of remainingCards to adjust for the dealer's visible card.
  const adjustedRemainingCards = { ...remainingCards };

  // Account for the dealer's visible card (upcard).
  if (dealerHand && dealerHand.length > 0) {
    const dealerUpCard = dealerHand[0];
    if (adjustedRemainingCards[dealerUpCard.rank] > 0) {
      adjustedRemainingCards[dealerUpCard.rank]--;
    }
  }

  let bustCards = 0;
  const totalRemainingCards = Object.values(adjustedRemainingCards).reduce(
    (sum, count) => sum + count,
    0
  );

  if (totalRemainingCards === 0) return 0;

  for (const rank in adjustedRemainingCards) {
    const count = adjustedRemainingCards[rank];
    if (count > 0) {
      const cardPointValue = pointValues[ranks.indexOf(rank)];
      const testCard = { rank: rank, pointValue: cardPointValue };
      const newHand = [...playerHand, testCard];

      if (calculateTotal(newHand) > 21) {
        bustCards += count;
      }
    }
  }

  return (bustCards / totalRemainingCards) * 100;
}
