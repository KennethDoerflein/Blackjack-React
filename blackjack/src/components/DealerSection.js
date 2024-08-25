import React from "react";
import { Container } from "react-bootstrap";

export default function DealerSection({ dealersHandElements, dealerTotal }) {
  return (
    <>
      <Container className="text-center my-3">
        <h6 id="dealerHeader">Dealer's Cards {dealersHandElements.length >= 2 && !dealersHandElements[1].props.src.includes("back.png") ? `(Total: ${dealerTotal})` : ""}</h6>
      </Container>
      <Container id="dealersHand">{dealersHandElements}</Container>
    </>
  );
}
