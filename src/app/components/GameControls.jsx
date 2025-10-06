import { useCallback } from "react";
import { Button, ButtonGroup, Container } from "react-bootstrap";
import { isDoubleDownAllowed, isSplitAllowed } from "../utils/blackjackUtils";

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
  resultsHidden,
  showButtons,
  disableButtons,
  newGameBtnHidden,
  setNewGameBtnHidden,
  isBusy,
  devMode,
  setIsBusy,
  showInfo,
  checkBustProbability,
  probabilityChecked,
  globalMessage,
}) {
  const doubleDown = useCallback(async () => {
    setIsBusy(true);
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
      await hit("player", "doubleDown");
      await endHand();
      setIsBusy(false);
    }
  }, [
    setIsBusy,
    playersHands,
    currentHand,
    playerTotals,
    currentWager,
    playerPoints,
    updateWager,
    setPlayerPoints,
    hit,
    endHand,
  ]);

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
  const handleCheckOdds = useCallback(() => checkBustProbability(), [checkBustProbability]);
  const handleNewGame = useCallback(() => {
    newGame();
    setNewGameBtnHidden(false);
  }, [newGame, setNewGameBtnHidden]);
  const handleResetPoints = resetPoints;

  // Helper: Compute button visibility based on game state
  const canAct =
    resultsHidden &&
    showButtons &&
    playersHands[currentHand].length >= 2 &&
    playerTotals[currentHand] <= 21;
  const canSplit =
    devMode ||
    (canAct &&
      isSplitAllowed(
        playersHands,
        currentHand,
        splitCount,
        currentWager,
        playerPoints,
        splitTypeChecked
      ));
  const canDouble =
    canAct &&
    isDoubleDownAllowed(
      playersHands,
      currentHand,
      playerTotals[currentHand],
      currentWager,
      playerPoints
    );
  const canNewGame = !resultsHidden && playersHands[0].length > 0 && playerPoints > 0;
  const canResetPoints = !resultsHidden && playerPoints === 0;

  return (
    <Container
      className={`w-100 mt-2 ${showButtons && !showInfo ? "" : "hidden"}`}
      id="gameActions">
      <ButtonGroup>
        <Button
          onClick={isBusy ? undefined : handleHit}
          hidden={!canAct}
          disabled={disableButtons}
          id="hitBtn"
          variant="warning"
          size="sm"
          className="mx-2">
          Hit
        </Button>
        <Button
          onClick={isBusy ? undefined : handleSplit}
          hidden={!canSplit}
          disabled={disableButtons}
          id="splitBtn"
          variant="primary"
          size="sm"
          className="mx-2">
          Split
        </Button>
        <Button
          onClick={isBusy ? undefined : handleDoubleDown}
          hidden={!canDouble}
          disabled={disableButtons}
          id="doubleDownBtn"
          variant="light"
          size="sm"
          className="mx-2">
          Double
          <br />
          Down
        </Button>
        <Button
          onClick={isBusy ? undefined : handleStand}
          hidden={!canAct}
          disabled={disableButtons}
          id="standBtn"
          variant="danger"
          size="sm"
          className="mx-2">
          Stand
        </Button>
        <Button
          onClick={isBusy ? undefined : handleNewGame}
          hidden={!canNewGame && !devMode}
          id="newGameBtn"
          variant="success"
          size="sm"
          className="mx-auto my-1">
          New Game
        </Button>
        <Button
          onClick={isBusy ? undefined : handleResetPoints}
          hidden={!canResetPoints}
          id="resetPointsBtn"
          variant="info"
          size="sm"
          className="mx-auto my-1">
          Reset Points
        </Button>
      </ButtonGroup>
      <Container>
        <Button
          onClick={isBusy ? undefined : handleCheckOdds}
          hidden={!canAct || playerPoints < 25}
          disabled={
            disableButtons || (globalMessage.includes("Bust probability:") && probabilityChecked)
          }
          id="checkOddsBtn"
          variant="info"
          size="sm"
          className="mx-2 my-4 py-2">
          {!probabilityChecked || globalMessage.includes("Bust probability:")
            ? "Check Odds (-25 Points)"
            : "View Odds"}
        </Button>
      </Container>
    </Container>
  );
}
