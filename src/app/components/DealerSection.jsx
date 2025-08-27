import React, { useEffect, useRef } from "react";
import { Container } from "react-bootstrap";
import RollingValue from "./RollingValue.jsx";
import { adjustCardMargins } from "../utils/uiUtils.js";
import { CARD_FLIP_TIME } from "../utils/constants.js";

export default React.memo(function DealerSection({ dealersHandElements, dealerTotal }) {
  const dealerHandRef = useRef(null);
  const dealerTotalRef = useRef(null);

  useEffect(() => {
    if (dealersHandElements.length > 2 && dealerHandRef.current) {
      adjustCardMargins(dealerHandRef.current);
    }
  }, [dealersHandElements]);

  useEffect(() => {
    if (dealerTotalRef.current) {
      const el = dealerTotalRef.current;
      el.classList.add("handPulse");
      const t = setTimeout(() => el.classList.remove("handPulse"), 420);
      return () => clearTimeout(t);
    }
  }, [dealerTotal]);

  // Check if second card is still hidden (back.png)
  const secondCard = dealersHandElements[1];
  const secondCardIsHidden =
    secondCard && typeof secondCard.src === "string" && secondCard.src.includes("back.png");

  return (
    <>
      <Container className="text-center my-3">
        <div className="handHeader">
          <h6 id="dealerHeader" style={{ margin: 0 }}>
            Dealer's Cards
          </h6>
          {!secondCardIsHidden && secondCard ? (
            <div ref={dealerTotalRef} className="handTotal">
              Total: &nbsp;
              <RollingValue ref={dealerTotalRef} duration={CARD_FLIP_TIME} value={dealerTotal} />
            </div>
          ) : null}
        </div>
      </Container>
      <Container fluid id="dealersHand" ref={dealerHandRef}>
        {dealersHandElements.map((card, idx) => {
          // For the dealer's face-down card (index 1), override alt text but keep same src
          const altText = idx === 1 && card.src.includes("back.png") ? "Hidden Card" : card.image;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={card.id} src={card.src} alt={altText} className={card.className} />
          );
        })}
      </Container>
    </>
  );
});
