import React from "react";
import { Button, ButtonGroup, Container } from "react-bootstrap";
import { isSplitAllowed, isDoubleDownAllowed } from "../utils/utils";

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

  return (
    <Container className="d-flex justify-content-center w-100 mt-2" id="gameActions">
      <ButtonGroup>
        <Button
          onClick={() => hit()}
          hidden={playerTotals[currentHand] > 21 || playersHands[currentHand].length < 2 || !document.getElementById("resultsAlert").hidden}
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
            !document.getElementById("resultsAlert").hidden
          }
          id="splitBtn"
          variant="primary"
          size="sm"
          className="mx-2">
          Split
        </Button>
        <Button
          onClick={() => doubleDown()}
          hidden={!isDoubleDownAllowed(playersHands, currentHand, playerTotals[currentHand], currentWager, playerPoints) || !document.getElementById("resultsAlert").hidden}
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
          hidden={playerTotals[currentHand] > 21 || playersHands[currentHand].length < 2 || !document.getElementById("resultsAlert").hidden}
          id="standBtn"
          variant="danger"
          size="sm"
          className="mx-2">
          Stand
        </Button>
        <Button
          onClick={() => newGame()}
          hidden={playersHands[0].length === 0 || playerPoints === 0 || document.getElementById("resultsAlert").hidden}
          id="newGameBtn"
          variant="success"
          size="sm"
          className="mx-auto my-1">
          New Game
        </Button>
      </ButtonGroup>
    </Container>
  );
}
