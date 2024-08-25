import React from "react";
import { Button, ButtonGroup, Container } from "react-bootstrap";
import { delay } from "../utils/utils";

export default function GameControls({ hit, newGame, endHand, doubleDownAllowed, updateWager, playerPoints, setPlayerPoints, currentWager, splitHand, currentHand }) {
  async function doubleDown() {
    if (doubleDownAllowed) {
      const newWagers = [...currentWager];
      newWagers[currentHand] *= 2;
      const pointsLeft = playerPoints - currentWager[currentHand];
      updateWager(newWagers);
      setPlayerPoints(pointsLeft);
      await hit("player", "doubleDown");
      await delay(750);
      endHand(pointsLeft);
    }
  }

  return (
    <Container className="d-flex justify-content-center w-100 mt-2" id="gameActions">
      <ButtonGroup>
        <Button onClick={() => hit()} hidden id="hitBtn" variant="warning" size="sm" className="mx-2">
          Hit
        </Button>
        <Button onClick={() => splitHand()} hidden id="splitBtn" variant="primary" size="sm" className="mx-2">
          Split
        </Button>
        <Button onClick={() => doubleDown()} hidden id="doubleDownBtn" variant="light" size="sm" className="mx-2">
          Double
          <br />
          Down
        </Button>
        <Button onClick={() => endHand()} hidden id="standBtn" variant="danger" size="sm" className="mx-2">
          Stand
        </Button>
        <Button onClick={() => newGame()} hidden id="newGameBtn" variant="success" size="sm" className="mx-auto my-1">
          New Game
        </Button>
      </ButtonGroup>
    </Container>
  );
}
