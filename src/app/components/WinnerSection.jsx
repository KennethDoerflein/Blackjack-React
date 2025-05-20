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
      let newOutcomes = []; // Create a local array to store the outcomes for this effect

      for (let handIndex = 0; handIndex < playersHands.length; handIndex++) {
        if (playersHands[handIndex].length === 0) continue;

        let outcome = "";
        let wagerMultiplier = 1;

        if (playerTotals[handIndex] > 21) {
          outcome = "Player Busted, Dealer Wins";
          wagerMultiplier = 0;
        } else if (dealerTotal > 21 || playerTotals[handIndex] > dealerTotal) {
          if (playerTotals[handIndex] === 21 && playersHands[handIndex].length === 2) {
            outcome = "Blackjack, Player Wins";
          } else {
            outcome = dealerTotal > 21 ? "Dealer Busted, Player Wins" : "Player Wins";
          }
          wagerMultiplier =
            playerTotals[handIndex] === 21 && playersHands[handIndex].length === 2 ? 2.2 : 2;
        } else if (dealerTotal > playerTotals[handIndex]) {
          outcome = "Dealer Wins";
          wagerMultiplier = 0;
        } else {
          outcome = "Push (Tie)";
        }

        newPlayerPoints += Math.ceil((currentWager[handIndex] * wagerMultiplier).toFixed(2));
        newOutcomes.push(splitCount > 0 ? `Hand ${handIndex + 1}: ${outcome}` : outcome);
      }

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
