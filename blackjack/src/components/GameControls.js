import React from "react";

export default function GameControls() {
  return (
    <>
      <div id="gameActions" className="d-flex justify-content-center w-100 mt-2">
        <button hidden id="hitBtn" type="button" className="btn-sm btn btn-warning mx-2">
          Hit
        </button>
        <button hidden id="splitBtn" type="button" className="btn-sm btn btn-primary mx-2">
          Split
        </button>
        <button hidden id="doubleDownBtn" type="button" className="btn-sm btn btn-light mx-2">
          Double
          <br />
          Down
        </button>
        <button hidden id="standBtn" type="button" className="btn-sm btn btn-danger mx-2">
          Stand
        </button>
        <button hidden id="newGameBtn" type="button" className="btn-sm btn btn-success mx-auto my-1">
          New Game
        </button>
      </div>
    </>
  );
}
