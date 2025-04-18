import React, { useCallback } from "react";
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
  resultsAlertHidden,
  showButtons,
  newGameBtnHidden,
  setNewGameBtnHidden,
  setShowButtons,
}) {
  const doubleDown = useCallback(async () => {
    if (typeof setShowButtons === "function") setShowButtons(false);
    if (
      isDoubleDownAllowed(
        playersHands,
        currentHand,
        playerTotals[currentHand],
        currentWager,
        playerPoints
      )
    ) {
      const newWagers = [...currentWager];
      const pointsLeft = playerPoints - newWagers[currentHand];
      newWagers[currentHand] *= 2;
      updateWager(newWagers);
      setPlayerPoints(pointsLeft);
      const newTotal = await hit("player", "doubleDown");
      await endHand();
      if (typeof setShowButtons === "function" && currentHand < splitCount) {
        setShowButtons(true);
      }
    }
  }, [setShowButtons, playersHands, currentHand, playerTotals, currentWager, playerPoints, updateWager, setPlayerPoints, hit, endHand, splitCount]);

  const resetPoints = useCallback(() => {
    if (playerPoints === 0) {
      setPlayerPoints(100);
    }
  }, [playerPoints, setPlayerPoints]);

  // Memoize handlers to avoid unnecessary re-renders
  const handleHit = useCallback(() => hit(), [hit]);
  const handleSplit = useCallback(() => splitHand(), [splitHand]);
  const handleDoubleDown = doubleDown;
  const handleStand = useCallback(() => endHand(), [endHand]);
  const handleNewGame = useCallback(() => {
    newGame();
    setNewGameBtnHidden(false);
  }, [newGame, setNewGameBtnHidden]);
  const handleResetPoints = resetPoints;

  // Helper: Compute button visibility based on game state
  const canAct =
    resultsAlertHidden &&
    showButtons &&
    playersHands[currentHand].length >= 2 &&
    playerTotals[currentHand] <= 21;
  const canSplit =
    canAct &&
    isSplitAllowed(
      playersHands,
      currentHand,
      splitCount,
      currentWager,
      playerPoints,
      splitTypeChecked
    );
  const canDouble =
    canAct &&
    isDoubleDownAllowed(
      playersHands,
      currentHand,
      playerTotals[currentHand],
      currentWager,
      playerPoints
    );
  const canNewGame = !resultsAlertHidden && (playersHands[0].length > 0 && playerPoints > 0);
  const canResetPoints = !resultsAlertHidden && playerPoints === 0;

  return (
    <Container className="d-flex justify-content-center w-100 mt-2" id="gameActions">
      <ButtonGroup>
        <Button
          onClick={handleHit}
          hidden={!canAct}
          id="hitBtn"
          variant="warning"
          size="sm"
          className="mx-2">
          Hit
        </Button>
        <Button
          onClick={handleSplit}
          hidden={!canSplit}
          id="splitBtn"
          variant="primary"
          size="sm"
          className="mx-2">
          Split
        </Button>
        <Button
          onClick={handleDoubleDown}
          hidden={!canDouble}
          id="doubleDownBtn"
          variant="light"
          size="sm"
          className="mx-2">
          Double
          <br />
          Down
        </Button>
        <Button
          onClick={handleStand}
          hidden={!canAct}
          id="standBtn"
          variant="danger"
          size="sm"
          className="mx-2">
          Stand
        </Button>
        <Button
          onClick={handleNewGame}
          hidden={!canNewGame}
          id="newGameBtn"
          variant="success"
          size="sm"
          className="mx-auto my-1">
          New Game
        </Button>
        <Button
          onClick={handleResetPoints}
          hidden={!canResetPoints}
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
