import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import { adjustCardMargins } from "../utils/uiUtils.js";

export default function PlayerSection({ playersHandElements, playerTotals, splitCount, playersHandNames }) {
  useEffect(() => {
    const adjustMargins = () => {
      if (playersHandElements[0].length > 2) {
        playersHandElements.forEach((hand, i) => {
          if (hand.length > 0) {
            adjustCardMargins(document.getElementById(playersHandNames[i]));
          }
        });
      }
    };
    requestAnimationFrame(adjustMargins);
  }, [playersHandElements, playersHandNames]);

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
        {playersHandElements.map((hand, i) => (
          <Container fluid key={i} id={playersHandNames[i]}>
            {hand}
          </Container>
        ))}
      </span>
    </>
  );
}
