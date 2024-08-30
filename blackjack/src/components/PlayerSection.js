import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import { adjustCardMargins } from "../utils/uiUtils.js";

export default function PlayerSection({ playersHandElements, playerTotals, splitCount, playerHandNames }) {
  useEffect(() => {
    const adjustMargins = () => {
      if (playersHandElements[0].length > 2) {
        playersHandElements.forEach((hand, i) => {
          if (hand.length > 0) {
            adjustCardMargins(document.getElementById(playerHandNames[i]));
          }
        });
      }
    };
    requestAnimationFrame(adjustMargins);
  }, [playersHandElements, playerHandNames]);

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
            : playerTotals[0] > 0 && `(Total: ${playerTotals[0]})`}
        </h6>
      </Container>
      <span id="playersHands">
        <Container fluid id="playersHand">
          {playersHandElements[0]}
        </Container>
        <Container fluid hidden={playersHandElements[1].length === 0} id="playersSecondHand">
          {playersHandElements[1]}
        </Container>
        <Container fluid hidden={playersHandElements[2].length === 0} id="playersThirdHand">
          {playersHandElements[2]}
        </Container>
        <Container fluid hidden={playersHandElements[3].length === 0} id="playersFourthHand">
          {playersHandElements[3]}
        </Container>
      </span>
    </>
  );
}
