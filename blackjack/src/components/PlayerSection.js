import React from "react";

export default function PlayerSection({ playerHandElements }) {
  return (
    <>
      <h6 id="playerHeader" className="container text-center my-3">
        Player's Cards
      </h6>
      <span id="playersHands">
        <div id="playersHand" className="container">
          {playerHandElements[0]}
        </div>
        <div hidden id="playersSecondHand" className="container">
          {playerHandElements[1]}
        </div>
        <div hidden id="playersThirdHand" className="container">
          {playerHandElements[2]}
        </div>
        <div hidden id="playersFourthHand" className="container">
          {playerHandElements[3]}
        </div>
      </span>
    </>
  );
}
