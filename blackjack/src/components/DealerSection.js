import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import { adjustCardMargins } from "../game_logic/gameFunctions.js";

export default function DealerSection({ dealersHandElements, dealerTotal }) {
  useEffect(() => {
    if (dealersHandElements.length > 2) {
      adjustCardMargins(document.getElementById("dealersHand"));
    }
  }, [dealersHandElements]);
  return (
    <>
      <Container className="text-center my-3">
        <h6 id="dealerHeader">Dealer's Cards {dealersHandElements.length >= 2 && !dealersHandElements[1].props.src.includes("back.png") ? `(Total: ${dealerTotal})` : ""}</h6>
      </Container>
      <Container fluid id="dealersHand">
        {dealersHandElements}
      </Container>
    </>
  );
}
