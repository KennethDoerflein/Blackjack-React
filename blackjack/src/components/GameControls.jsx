import React from "react";
import { Button, ButtonGroup, Container } from "react-bootstrap";
import { isSplitAllowed, isDoubleDownAllowed } from "../utils/blackjackUtils";

export default function GameControls({
  hit,
  newGame,
  endHand,
  updateWager,
  playerPoints,
  setPlayerPoints,
  currentWager,
  splitHand,
  currentHand,
  playersHands,
  playerTotals,
  splitCount,
  splitTypeChecked,
  autoStandChecked,
  resultsAlertHidden,
  showButtons,
}) {
  async function doubleDown() {
    if (isDoubleDownAllowed(playersHands, currentHand, playerTotals[currentHand], currentWager, playerPoints)) {
      const newWagers = [...currentWager];
      const pointsLeft = playerPoints - newWagers[currentHand];
      newWagers[currentHand] *= 2;
      updateWager(newWagers);
      setPlayerPoints(pointsLeft);
      const newTotal = await hit("player", "doubleDown");
      if (!autoStandChecked || newTotal !== 21) {
        endHand();
      }
    }
  }

  function resetPoints() {
    if (playerPoints === 0) {
      setPlayerPoints(100);
      document.getElementById("bottomDiv").lastChild.remove();
    }
  }

  return (
    <Container className="d-flex justify-content-center w-100 mt-2" id="gameActions">
      <ButtonGroup>
        <Button
          onClick={() => hit()}
          hidden={playerTotals[currentHand] > 21 || playersHands[currentHand].length < 2 || !resultsAlertHidden || !showButtons}
          id="hitBtn"
          variant="warning"
          size="sm"
          className="mx-2">
          Hit
        </Button>
        <Button
          onClick={() => splitHand()}
          hidden={
            !isSplitAllowed(playersHands, currentHand, splitCount, currentWager, playerPoints, splitTypeChecked) ||
            playersHands[currentHand].length < 2 ||
            !resultsAlertHidden ||
            !showButtons
          }
          id="splitBtn"
          variant="primary"
          size="sm"
          className="mx-2">
          Split
        </Button>
        <Button
          onClick={() => doubleDown()}
          hidden={!isDoubleDownAllowed(playersHands, currentHand, playerTotals[currentHand], currentWager, playerPoints) || !resultsAlertHidden || !showButtons}
          id="doubleDownBtn"
          variant="light"
          size="sm"
          className="mx-2">
          Double
          <br />
          Down
        </Button>
        <Button
          onClick={() => endHand()}
          hidden={playerTotals[currentHand] > 21 || playersHands[currentHand].length < 2 || !resultsAlertHidden || !showButtons}
          id="standBtn"
          variant="danger"
          size="sm"
          className="mx-2">
          Stand
        </Button>
        <Button
          onClick={() => newGame()}
          hidden={playersHands[0].length === 0 || playerPoints === 0 || resultsAlertHidden || !showButtons}
          id="newGameBtn"
          variant="success"
          size="sm"
          className="mx-auto my-1">
          New Game
        </Button>
        <Button
          onClick={() => resetPoints()}
          hidden={playerPoints !== 0 || resultsAlertHidden || !showButtons}
          id="resetPointsBtn"
          variant="info"
          size="sm"
          className="mx-auto my-1">
          Reset Points
        </Button>
      </ButtonGroup>
    </Container>
  );
}
