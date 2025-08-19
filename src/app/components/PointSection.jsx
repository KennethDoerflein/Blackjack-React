import React, { useEffect, useRef } from "react";
import { Container } from "react-bootstrap";
import RollingValue from "./RollingValue.jsx";

export default React.memo(function PointSection({
  playerPoints,
  currentWager,
  currentHand,
  splitCount,
}) {
  const pointsRef = useRef(null);
  const wagerRef = useRef(null);

  return (
    <Container className="mt-2 d-flex justify-content-center">
      <Container
        className="text-center me-3 mb-2 px-2 border rounded d-flex align-items-center justify-content-center"
        id="pointsDisplay">
        <span className="pointsLabel">Points*:</span>
        <RollingValue ref={pointsRef} className="pointsValue" value={playerPoints} />
      </Container>
      <Container
        className="text-center ms-3 mb-2 px-2 border rounded d-flex align-items-center justify-content-center wagerDisplay"
        id={`wagerDisplay-${currentHand}`}>
        <span className="wagerLabel">
          {splitCount > 0 ? `Hand ${currentHand + 1}'s Wager:` : "Wager:"}
        </span>
        <RollingValue
          ref={wagerRef}
          className="wagerValue"
          value={currentWager !== undefined ? currentWager : 0}
        />
      </Container>
    </Container>
  );
});
