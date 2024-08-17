import React from "react";
import chip1 from "../assets/1Chip.jpg";
import chip5 from "../assets/5Chip.jpg";
import chip10 from "../assets/10Chip.jpg";
import chip20 from "../assets/20Chip.jpg";
import chip50 from "../assets/50Chip.jpg";

export default function WagerControls({ currentWager, updateWager, currentHand, playerPoints, setPlayerPoints }) {
  const addChipValue = (e) => {
    const chipValue = parseInt(e.target.getAttribute("data-value"), 10);
    updateWager(currentWager[currentHand] + chipValue);
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
      // disableSettingsButtons();
      // updatePoints();
      // toggleWagerElements();
      // initialDeal();
      // clearDiv(messageDiv);
    } else {
      alert("The wager must be a number and greater than 0.");
    }
  };

  return (
    <>
      <div hidden id="wagerDiv" className="mt-2">
        <img onClick={addChipValue} className="chip" src={chip1} data-value="1" alt="1 point chip" />
        <img onClick={addChipValue} className="chip" src={chip5} data-value="5" alt="5 point chip" />
        <img onClick={addChipValue} className="chip" src={chip10} data-value="10" alt="10 point chip" />
        <img onClick={addChipValue} className="chip" src={chip20} data-value="20" alt="20 point chip" />
        <img onClick={addChipValue} className="chip" src={chip50} data-value="50" alt="50 point chip" />
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
