import { useEffect, useState } from "react";
import { Alert, Container, Row, Col } from "react-bootstrap";

export default function WinnerSection({
  playersHands,
  playerTotals,
  playerPoints,
  dealerTotal,
  currentWager,
  setPlayerPoints,
  splitCount,
  setCurrentWager,
  resultsAlertHidden,
  currentHand,
}) {
  const [outcomes, setOutcomes] = useState([]);

  useEffect(() => {
    if (resultsAlertHidden) return;

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

      if (playerTotal === null) continue; // nothing to compare

      // Compute a discrete case key so we can switch on it
      let caseKey = "UNKNOWN";
      if (playerTotal > 21) caseKey = "PLAYER_BUST";
      else if (dealerTotal > 21) caseKey = "DEALER_BUST";
      else if (playerTotal === 21 && hand.length === 2) caseKey = "BLACKJACK";
      else if (playerTotal > dealerTotal) caseKey = "PLAYER_WIN";
      else if (playerTotal < dealerTotal) caseKey = "DEALER_WIN";
      else if (playerTotal === dealerTotal) caseKey = "PUSH";

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
        case "BLACKJACK":
          outcome = "Blackjack, Player Wins";
          // preserve previous behavior (unusual multiplier kept intentionally)
          wagerMultiplier = 2.2;
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
  }, [resultsAlertHidden]);

  const message = Array.isArray(outcomes) && outcomes[currentHand] ? outcomes[currentHand] : "";

  return (
    <Container className="d-flex justify-content-center">
      <Alert
        id="resultsAlert"
        variant="info"
        role="alert"
        className={`alert-dismissible fade show px-1 py-2 ${
          resultsAlertHidden ? "is-hidden" : ""
        }`}>
        <Container id="message" className="text-center">
          <h6 key={currentHand} className="my-1">
            {message}
          </h6>
        </Container>
      </Alert>
    </Container>
  );
}
