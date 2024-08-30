// Calculate total points for a hand
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

// Determine if the dealer should hit based on game rules
export function shouldDealerHit(total, hand, soft17Checked) {
  if (soft17Checked) {
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

// Check if splitting is allowed based on current hand and rules
export const isSplitAllowed = (playersHands, currentHand, splitCount, currentWager, playerPoints, splitTypeChecked) => {
  if (!playersHands[currentHand] || playersHands[currentHand].length < 2) {
    return false;
  }
  const isMatchingRankOrValue = splitTypeChecked
    ? playersHands[currentHand][0].rank === playersHands[currentHand][1].rank
    : playersHands[currentHand][0].pointValue === playersHands[currentHand][1].pointValue;

  return splitCount < 3 && playersHands[currentHand].length === 2 && isMatchingRankOrValue && isWagerAllowed(currentWager[currentHand], playerPoints);
};

// Check if the current wager is allowed based on player points
export function isWagerAllowed(currentWager, playerPoints) {
  return currentWager <= playerPoints;
}

// Check if doubling down is allowed based on current hand and rules
export function isDoubleDownAllowed(playersHands, currentHand, playerTotal, currentWager, playerPoints) {
  return playersHands[currentHand].length === 2 && playerTotal <= 21 && isWagerAllowed(currentWager[currentHand], playerPoints);
}
