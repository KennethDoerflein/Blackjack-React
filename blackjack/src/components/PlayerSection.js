import React from "react";
import { Container } from "react-bootstrap";

export default function PlayerSection({ playersHandElements, playerTotals, splitCount }) {
  return (
    <>
      <Container className="text-center my-3">
        <h6 id="playerHeader">
          Player's Cards{" "}
          {splitCount > 0
            ? (() => {
                let totalPerHand = "";
                for (let i = 0; i <= splitCount; i++) {
                  totalPerHand += `Hand ${i + 1}: ${playerTotals[i]}`;
                  if (i < splitCount) {
                    totalPerHand += ", ";
                  }
                }
                return `(${totalPerHand})`;
              })()
            : `(Total: ${playerTotals[0]})`}
        </h6>
      </Container>
      <span id="playersHands">
        <Container id="playersHand">{playersHandElements[0]}</Container>
        <Container hidden id="playersSecondHand">
          {playersHandElements[1]}
        </Container>
        <Container hidden id="playersThirdHand">
          {playersHandElements[2]}
        </Container>
        <Container hidden id="playersFourthHand">
          {playersHandElements[3]}
        </Container>
      </span>
    </>
  );
}
