import React from "react";

export default function PointSection({ playerPoints, currentWager }) {
  return (
    <>
      <div className="container mt-2 d-flex justify-content-center">
        <div id="pointsDisplay" className="text-center me-3 mb-2 px-4 border rounded d-flex align-items-center justify-content-center">
          Points*: {playerPoints}
        </div>
        <div id="wagerDisplay" className="text-center ms-3 mb-2 px-2 border rounded d-flex align-items-center justify-content-center">
          Current Hand's Wager: {currentWager}
        </div>
      </div>
    </>
  );
}
