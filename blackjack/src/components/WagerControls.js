import React from "react";
import { Button, Container, Image } from "react-bootstrap";
import { animateElement } from "../utils/utils.js";

export default function WagerControls({ currentWager, updateWager, currentHand, playerPoints, setPlayerPoints, initialDeal, playersHands }) {
  const addChipValue = (e) => {
    animateElement(e.target, "chipFlip", 700);
    animateElement(document.getElementById("wagerDisplay"), "highlight", 500);

    const chipValue = parseInt(e.target.getAttribute("data-value"), 10);
    const newWager = currentWager[currentHand] + chipValue;
    if (newWager <= playerPoints && Number.isInteger(newWager)) {
      updateWager(newWager);
    } else if (newWager > playerPoints) {
      alert("Oops! You don't have enough points to place that wager. Your wager has been adjusted to your remaining points.");
      updateWager(playerPoints);
    }
  };

  const clearWager = () => {
    updateWager(0);
  };

  const placeWager = async (e) => {
    let id = e.target.id;
    let isAllIn = id === "allInBtn";
    let isWagerValid = !isNaN(currentWager[currentHand]) && currentWager[currentHand] > 0 && currentWager[currentHand] <= playerPoints;
    let updatedPoints = 0;
    if (isWagerValid || isAllIn) {
      if (isAllIn) {
        updateWager(playerPoints);
      } else {
        updatedPoints = playerPoints - currentWager[currentHand];
      }
      setPlayerPoints(updatedPoints);
      await initialDeal(updatedPoints);
    } else {
      alert("The wager must be a number and greater than 0.");
    }
  };

  return (
    <Container hidden={playersHands[0].length !== 0} id="wagerDiv" className="mt-2">
      <Image onClick={addChipValue} className="chip" src="./assets/1Chip.jpg" data-value="1" alt="1 point chip" />
      <Image onClick={addChipValue} className="chip" src="./assets/5Chip.jpg" data-value="5" alt="5 point chip" />
      <Image onClick={addChipValue} className="chip" src="./assets/10Chip.jpg" data-value="10" alt="10 point chip" />
      <Image onClick={addChipValue} className="chip" src="./assets/20Chip.jpg" data-value="20" alt="20 point chip" />
      <Image onClick={addChipValue} className="chip" src="./assets/50Chip.jpg" data-value="50" alt="50 point chip" />
      <div>
        <Button onClick={clearWager} id="wagerRst" variant="danger" size="sm" className="align-middle ms-2 my-3">
          Reset Wager
        </Button>
        <Button onClick={placeWager} id="allInBtn" variant="warning" size="sm" className="align-middle ms-2 my-3">
          Max Wager
        </Button>
        <Button onClick={placeWager} id="wagerBtn" variant="primary" size="sm" className="align-middle ms-2 my-3">
          Place Wager
        </Button>
      </div>
    </Container>
  );
}
