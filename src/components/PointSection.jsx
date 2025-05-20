import React from "react";
import { Container } from "react-bootstrap";

export default React.memo(function PointSection({ playerPoints, currentWager }) {
  return (
    <Container className="mt-2 d-flex justify-content-center">
      <Container
        className="text-center me-3 mb-2 px-4 border rounded d-flex align-items-center justify-content-center"
        id="pointsDisplay">
        Points*: {playerPoints}
      </Container>
      <Container
        className="text-center ms-3 mb-2 px-2 border rounded d-flex align-items-center justify-content-center"
        id="wagerDisplay">
        Current Hand's Wager: {currentWager !== undefined ? currentWager : 0}
      </Container>
    </Container>
  );
});
