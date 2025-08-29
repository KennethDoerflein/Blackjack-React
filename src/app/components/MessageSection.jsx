import { useEffect, useState } from "react";
import { Alert, Container } from "react-bootstrap";

export default function MessageSection({
  playersHands,
  playerTotals,
  playerPoints,
  dealerTotal,
  currentWager,
  setPlayerPoints,
  splitCount,
  setCurrentWager,
  resultsHidden,
  currentHand,
  isBusy,
  globalMessage,
}) {
  const [outcomes, setOutcomes] = useState([]);

  useEffect(() => {
    if (resultsHidden) return;

    // Defensive copies / fallbacks
    const hands = Array.isArray(playersHands) ? playersHands : [];
    const totals = Array.isArray(playerTotals) ? playerTotals : [];
    const wagers = Array.isArray(currentWager) ? currentWager : [];

    let newPlayerPoints = typeof playerPoints === "number" ? playerPoints : 0;
    const newOutcomes = [];

    for (let handIndex = 0; handIndex < hands.length; handIndex++) {
      const hand = hands[handIndex];

      // Skip invalid hand structures
      if (!Array.isArray(hand) || hand.length === 0) continue;

      const playerTotal = typeof totals[handIndex] === "number" ? totals[handIndex] : null;
      const rawWager = typeof wagers[handIndex] === "number" ? wagers[handIndex] : 0;
      const wager = Math.max(0, rawWager);

      if (playerTotal === null) continue;

      let caseKey = "UNKNOWN";
      const isPlayerBlackjack = playerTotal === 21 && hand.length === 2;
      const isDealerBlackjack = dealerTotal === 21 && dealerCards.length === 2;

      if (isPlayerBlackjack && isDealerBlackjack) {
        caseKey = "BLACKJACK_PUSH";
      } else if (isPlayerBlackjack) {
        caseKey = "PLAYER_BLACKJACK";
      } else if (isDealerBlackjack) {
        caseKey = "DEALER_BLACKJACK";
      } else if (playerTotal > 21) {
        caseKey = "PLAYER_BUST";
      } else if (dealerTotal > 21) {
        caseKey = "DEALER_BUST";
      } else if (playerTotal > dealerTotal) {
        caseKey = "PLAYER_WIN";
      } else if (playerTotal < dealerTotal) {
        caseKey = "DEALER_WIN";
      } else if (playerTotal === dealerTotal) {
        caseKey = "PUSH";
      }

      let outcome = "Result Unknown";
      let wagerMultiplier = 1;

      switch (caseKey) {
        case "PLAYER_BUST":
          outcome = "Player Busted, Dealer Wins";
          wagerMultiplier = 0;
          break;
        case "DEALER_BUST":
          outcome = "Dealer Busted, Player Wins";
          wagerMultiplier = 2;
          break;
        case "PLAYER_BLACKJACK":
          outcome = "Blackjack, Player Wins";
          wagerMultiplier = 2.2;
          break;
        case "DEALER_BLACKJACK":
          outcome = "Dealer Blackjack, Dealer Wins";
          wagerMultiplier = 0;
          break;
        case "BLACKJACK_PUSH":
          outcome = "Blackjack Push (Tie)";
          wagerMultiplier = 1;
          break;
        case "PLAYER_WIN":
          outcome = "Player Wins";
          wagerMultiplier = 2;
          break;
        case "DEALER_WIN":
          outcome = "Dealer Wins";
          wagerMultiplier = 0;
          break;
        case "PUSH":
          outcome = "Push (Tie)";
          wagerMultiplier = 1;
          break;
        default:
          outcome = "Result Unknown";
          wagerMultiplier = 0;
      }

      const pointsChange = Math.max(0, Math.ceil(wager * wagerMultiplier));
      newPlayerPoints += pointsChange;

      newOutcomes.push(splitCount > 0 ? `Hand ${handIndex + 1}: ${outcome}` : outcome);
    }

    // Enforce non-negative points
    newPlayerPoints = Math.max(0, newPlayerPoints);

    // Only call setters if they're functions
    if (typeof setPlayerPoints === "function") setPlayerPoints(newPlayerPoints);
    setOutcomes(newOutcomes);
    if (typeof setCurrentWager === "function") setCurrentWager([0]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultsHidden]);

  let message = globalMessage;
  if (currentWager[0] === 0 && playersHands[0].length === 0) {
    message = "Waiting for wager ...";
  } else if (currentWager[0] > 0 && playersHands[0].length === 0) {
    message = "Place wager to begin";
  } else if (Array.isArray(outcomes) && outcomes[currentHand] && message === "") {
    message = outcomes[currentHand];
  }

  return (
    <Container id="messageAlert" role="alert" className="p-2 mt-4  align-items-center">
      <h6 id="message" key={message} className="m-0 text-center">
        {message}
      </h6>
    </Container>
  );
}
