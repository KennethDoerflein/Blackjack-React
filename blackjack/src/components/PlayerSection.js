import React from "react";

export default function PlayerSection({ playersHandElements, playerTotals }) {
  return (
    <>
      <h6 id="playerHeader" className="container text-center my-3">
        {/* Temporary for debugging*/}
        Player's Cards {playerTotals[0]}
      </h6>
      <span id="playersHands">
        <div id="playersHand" className="container">
          {playersHandElements[0]}
        </div>
        <div hidden id="playersSecondHand" className="container">
          {playersHandElements[1]}
        </div>
        <div hidden id="playersThirdHand" className="container">
          {playersHandElements[2]}
        </div>
        <div hidden id="playersFourthHand" className="container">
          {playersHandElements[3]}
        </div>
      </span>
    </>
  );
}
