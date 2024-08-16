import React from "react";

export default function PlayerSection() {
  return (
    <>
      <h6 id="playerHeader" className="container text-center my-3">
        Player's Cards
      </h6>
      <span id="playersHands">
        <div id="playersHand" className="container"></div>
        <div hidden id="playersSecondHand" className="container"></div>
        <div hidden id="playersThirdHand" className="container"></div>
        <div hidden id="playersFourthHand" className="container"></div>
      </span>
    </>
  );
}
