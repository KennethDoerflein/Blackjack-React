import React, { useEffect, useRef } from "react";
import { Container } from "react-bootstrap";
import RollingValue from "./RollingValue.jsx";
import { adjustCardMargins } from "../utils/uiUtils.js";

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
  // Only show dealer's total when the dealer's face-down (second) card is revealed.
  const secondCard = dealersHandElements && dealersHandElements[1];
  const secondCardIsHidden = !!(
    secondCard &&
    secondCard.props &&
    typeof secondCard.props.src === "string" &&
    secondCard.props.src.includes("back.png")
  );
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
              <RollingValue value={dealerTotal} />
            </div>
          ) : null}
        </div>
      </Container>
      <Container fluid id="dealersHand" ref={dealerHandRef}>
        {dealersHandElements.map((el, idx) => {
          // For the dealer's face-down card (index 1), sanitize the element but preserve key to avoid layout shifts.
          if (
            idx === 1 &&
            el &&
            el.props &&
            typeof el.props.src === "string" &&
            el.props.src.includes("back.png")
          ) {
            // Clone element and replace alt text to avoid exposing card identity. Use a stable key (index-based fallback).
            return React.cloneElement(el, {
              alt: "Hidden Card",
              src: el.props.src,
              className: el.props.className,
              key: el.key ?? `dealer-${idx}`,
            });
          }
          return el;
        })}
      </Container>
    </>
  );
});
