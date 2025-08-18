import { useEffect, useState } from "react";
import { Alert, Container } from "react-bootstrap";

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
    if (!resultsAlertHidden) {
      let newPlayerPoints = playerPoints;
      let newOutcomes = [];

      for (let handIndex = 0; handIndex < playersHands.length; handIndex++) {
        // Defensive: skip invalid hands or wagers
        if (!Array.isArray(playersHands[handIndex]) || playersHands[handIndex].length === 0)
          continue;
        if (
          !Array.isArray(currentWager) ||
          typeof currentWager[handIndex] !== "number" ||
          currentWager[handIndex] < 0
        )
          continue;

        let outcome = "";
        let wagerMultiplier = 1;
        const playerTotal = playerTotals[handIndex];
        const wager = Math.max(0, currentWager[handIndex]);

        if (playerTotal > 21) {
          outcome = "Player Busted, Dealer Wins";
          wagerMultiplier = 0;
        } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
          if (playerTotal === 21 && playersHands[handIndex].length === 2) {
            outcome = "Blackjack, Player Wins";
            wagerMultiplier = 2.2;
          } else {
            outcome = dealerTotal > 21 ? "Dealer Busted, Player Wins" : "Player Wins";
            wagerMultiplier = 2;
          }
        } else if (dealerTotal > playerTotal) {
          outcome = "Dealer Wins";
          wagerMultiplier = 0;
        } else {
          outcome = "Push (Tie)";
          wagerMultiplier = 1;
        }

        // Calculate points won/lost, never allow negative points
        const pointsChange = Math.max(0, Math.ceil(wager * wagerMultiplier));
        newPlayerPoints += pointsChange;
        newOutcomes.push(splitCount > 0 ? `Hand ${handIndex + 1}: ${outcome}` : outcome);
      }

      // Prevent player points from dropping below zero
      newPlayerPoints = Math.max(0, newPlayerPoints);

      // Update the player's points and outcomes in state
      setPlayerPoints(newPlayerPoints);

      // If the player runs out of points, add the final message
      // if (newPlayerPoints === 0) {
      //   newOutcomes.push("You are out of points, thank you for playing!");
      // }

      setOutcomes(newOutcomes); // Update outcomes state so that it triggers re-render
      setCurrentWager([0]); // Reset the current wager
    }
    // eslint-disable-next-line
  }, [resultsAlertHidden]);

  return (
    <Container fluid>
      <Alert
        hidden={resultsAlertHidden}
        id="resultsAlert"
        variant="info"
        className="alert-dismissible fade show mx-auto px-1 py-2 mt-3"
        role="alert">
        <Container id="message" className="text-center">
          <h6 key={currentHand} className="my-1">
            {outcomes[currentHand]}
          </h6>
        </Container>
      </Alert>
    </Container>
  );
}
