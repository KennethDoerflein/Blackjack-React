import React, { useEffect, useRef } from "react";
import { Container } from "react-bootstrap";
import RollingValue from "./RollingValue.jsx";
import { adjustCardMargins } from "../utils/uiUtils.js";
import { CARD_FLIP_TIME } from "../utils/constants.js";

export default React.memo(function DealerSection({ dealersHandElements, dealerTotal }) {
  const dealerHandRef = useRef(null);
  const dealerTotalRef = useRef(null);

  useEffect(() => {
    const adjustMargins = () => {
      if (
        (dealersHandElements.length > 2 && dealerHandRef.current) ||
        dealersHandElements.length === 0
      ) {
        adjustCardMargins(dealerHandRef.current);
      }
    };

    requestAnimationFrame(adjustMargins);
  }, [dealersHandElements]);

  useEffect(() => {
    if (dealerTotalRef.current) {
      const el = dealerTotalRef.current;
      let frameId;
      
      requestAnimationFrame(() => {
        el.classList.add("handPulse");
        const startTime = performance.now();
        
        const removePulse = (now) => {
          if (now - startTime >= 420) {
            el.classList.remove("handPulse");
          } else {
            frameId = requestAnimationFrame(removePulse);
          }
        };
        
        frameId = requestAnimationFrame(removePulse);
      });

      return () => {
        if (frameId) cancelAnimationFrame(frameId);
        el.classList.remove("handPulse");
      };
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
      <span className="dealersHandContainer">
        <Container fluid id="dealersHand" key="dealersHand" ref={dealerHandRef}>
          {dealersHandElements.map((card) => (
            <img key={card.id} src={card.src} alt={card.image} className={card.className} />
          ))}
        </Container>
      </span>
    </>
  );
});
