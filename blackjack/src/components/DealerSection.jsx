import React, { useEffect, useRef } from "react";
import { Container } from "react-bootstrap";
import { adjustCardMargins } from "../utils/uiUtils.js";

export default function DealerSection({ dealersHandElements, dealerTotal }) {
  const dealerHandRef = useRef(null);
  useEffect(() => {
    if (dealersHandElements.length > 2 && dealerHandRef.current) {
      adjustCardMargins(dealerHandRef.current);
    }
  }, [dealersHandElements]);
  return (
    <>
      <Container className="text-center my-3">
        <h6 id="dealerHeader">
          Dealer's Cards{" "}
          {dealersHandElements.length >= 2 && !dealersHandElements[1].props.src.includes("back.png")
            ? `(Total: ${dealerTotal})`
            : ""}
        </h6>
      </Container>
      <Container fluid id="dealersHand" ref={dealerHandRef}>
        {dealersHandElements}
      </Container>
    </>
  );
}
