import React, { useEffect } from "react";

export default function WinnerSection({ playersHands, playerTotals, playerPoints, dealerTotal, currentWager, setPlayerPoints, splitCount, setCurrentWager }) {
  useEffect(() => {
    const resultsAlert = document.getElementById("resultsAlert");

    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.attributeName === "hidden") {
          // This used to be `displayWinner()` in App.js

          const messageDiv = document.getElementById("message");

          while (messageDiv.firstChild) {
            messageDiv.removeChild(messageDiv.firstChild);
          }
          let outcomes = [[], []];

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

            setPlayerPoints(playerPoints + Math.ceil(currentWager[handIndex] * wagerMultiplier));
            outcomes[handIndex] = splitCount > 0 ? `Hand ${handIndex + 1}: ${outcome}` : outcome;

            let winnerElement = createWinnerElement(outcomes[handIndex]);
            messageDiv.append(winnerElement);
          }

          setCurrentWager([0, 0, 0, 0]);
          if (playerPoints === 0) {
            let message = createWinnerElement("You are out of points, thank you for playing!");
            message.classList.add("mt-2", "mb-5");
            document.getElementById("bottomDiv").appendChild(message);
          }
        }
      }
    });

    observer.observe(resultsAlert, { attributes: true });

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line
  }, [playersHands, playerTotals, playerPoints, dealerTotal, currentWager, setPlayerPoints, splitCount, setCurrentWager]);

  function createWinnerElement(outcome) {
    let winner = document.createElement("h6");
    winner.classList.add("my-1");
    winner.textContent = outcome;
    return winner;
  }

  return (
    <>
      <div hidden id="resultsAlert" className="alert alert-info alert-dismissible fade show w-75 mx-auto px-0" role="alert">
        <div id="message" className="container text-center"></div>
      </div>
    </>
  );
}
