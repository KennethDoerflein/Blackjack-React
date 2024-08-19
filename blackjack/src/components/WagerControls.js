import React from "react";
import { toggleHiddenElement, toggleDisabledElement, animateElement } from "../utils/utils.js";

export default function WagerControls({ currentWager, updateWager, currentHand, playerPoints, setPlayerPoints, initialDeal }) {
  const addChipValue = (e) => {
    animateElement(e.target, "chipFlip", 700);
    animateElement(document.getElementById("wagerDisplay"), "highlight", 700);

    const chipValue = parseInt(e.target.getAttribute("data-value"), 10);
    const newWager = currentWager[currentHand] + chipValue;
    if (newWager <= playerPoints && Number.isInteger(newWager)) {
      updateWager(newWager);
    } else if (newWager > playerPoints) {
      alert("Oops! You don't have enough points to place that wager. Your wager has been adjusted to your remaining points.");
      currentWager = playerPoints;
    }
  };

  const clearWager = (e) => {
    updateWager(0);
  };

  const placeWager = (e) => {
    let id = e.target.id;
    let isAllIn = id === "allInBtn";
    let isWagerValid = !isNaN(currentWager[currentHand]) && currentWager[currentHand] > 0 && currentWager[currentHand] <= playerPoints;
    if (isWagerValid || isAllIn) {
      if (isAllIn) {
        updateWager(playerPoints);
        setPlayerPoints(0);
      } else {
        setPlayerPoints(playerPoints - currentWager[currentHand]);
      }
      toggleHiddenElement(document.getElementById("wagerDiv"));
      toggleDisabledElement(document.getElementById("soft17Switch"));
      toggleDisabledElement(document.getElementById("splitSwitch"));
      initialDeal();
      // clearDiv(messageDiv);
    } else {
      alert("The wager must be a number and greater than 0.");
    }
  };

  return (
    <>
      <div hidden id="wagerDiv" className="mt-2">
        <img onClick={addChipValue} className="chip" src="./assets/1Chip.jpg" data-value="1" alt="1 point chip" />
        <img onClick={addChipValue} className="chip" src="./assets/5Chip.jpg" data-value="5" alt="5 point chip" />
        <img onClick={addChipValue} className="chip" src="./assets/10Chip.jpg" data-value="10" alt="10 point chip" />
        <img onClick={addChipValue} className="chip" src="../assets/20Chip.jpg" data-value="20" alt="20 point chip" />
        <img onClick={addChipValue} className="chip" src="../assets/50Chip.jpg" data-value="50" alt="50 point chip" />
        <div>
          <button onClick={clearWager} id="wagerRst" className="btn-sm btn btn-danger align-middle ms-2 my-3">
            Reset Wager
          </button>
          <button onClick={placeWager} id="allInBtn" className="btn-sm btn btn-warning align-middle ms-2 my-3">
            Max Wager
          </button>
          <button onClick={placeWager} id="wagerBtn" className="btn-sm btn btn-primary align-middle ms-2 my-3">
            Place Wager
          </button>
        </div>
      </div>
    </>
  );
}
