import React, { useEffect } from "react";
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
  setCurrentHand,
}) {
  useEffect(() => {
    if (!resultsAlertHidden) {
      // This used to be `displayWinner()` in App.js

      const messageDiv = document.getElementById("message");

      while (messageDiv.firstChild) {
        messageDiv.removeChild(messageDiv.firstChild);
      }
      let outcomes = [[], []];
      let newPlayerPoints = playerPoints;

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
          wagerMultiplier = playerTotals[handIndex] === 21 && playersHands[handIndex].length === 2 ? 2.2 : 2;
        } else if (dealerTotal > playerTotals[handIndex]) {
          outcome = "Dealer Wins";
          wagerMultiplier = 0;
        } else {
          outcome = "Push (Tie)";
        }

        newPlayerPoints += Math.ceil((currentWager[handIndex] * wagerMultiplier).toFixed(2));
        outcomes[handIndex] = splitCount > 0 ? `Hand ${handIndex + 1}: ${outcome}` : outcome;

        let winnerElement = createWinnerElement(outcomes[handIndex]);
        messageDiv.append(winnerElement);
      }

      setPlayerPoints(newPlayerPoints);
      if (newPlayerPoints === 0) {
        let message = createWinnerElement("You are out of points, thank you for playing!");
        message.classList.add("mt-2", "mb-5");
        document.getElementById("bottomDiv").appendChild(message);
      }
      setCurrentWager([0]);
      setCurrentHand(0);
    }
    // eslint-disable-next-line
  }, [resultsAlertHidden]);

  function createWinnerElement(outcome) {
    let winner = document.createElement("h6");
    winner.classList.add("my-1");
    winner.textContent = outcome;
    return winner;
  }

  return (
    <Container fluid>
      <Alert hidden={resultsAlertHidden} id="resultsAlert" variant="info" className="alert-dismissible fade show w-75 mx-auto px-0 py-1" role="alert">
        <Container id="message" className="text-center"></Container>
      </Alert>
    </Container>
  );
}
