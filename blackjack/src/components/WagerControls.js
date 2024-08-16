import React from "react";

export default function WagerControls() {
  return (
    <>
      <div hidden id="wagerDiv" className="mt-2">
        <img className="chip" src="./assets/1Chip.jpg" data-value="1" alt="1 point chip" />
        <img className="chip" src="./assets/5Chip.jpg" data-value="5" alt="5 point chip" />
        <img className="chip" src="./assets/10Chip.jpg" data-value="10" alt="10 point chip" />
        <img className="chip" src="./assets/20Chip.jpg" data-value="20" alt="20 point chip" />
        <img className="chip" src="./assets/50Chip.jpg" data-value="50" alt="50 point chip" />
        <div>
          <button id="wagerRst" className="btn-sm btn btn-danger align-middle ms-2 my-3">
            Reset Wager
          </button>
          <button id="allInBtn" className="btn-sm btn btn-warning align-middle ms-2 my-3">
            Max Wager
          </button>
          <button id="wagerBtn" className="btn-sm btn btn-primary align-middle ms-2 my-3">
            Place Wager
          </button>
        </div>
      </div>
    </>
  );
}
