import React from "react";

export default function PointSection() {
  return (
    <>
      <div className="container mt-2 d-flex justify-content-center">
        <div id="pointsDisplay" className="text-center me-3 mb-2 px-4 border rounded d-flex align-items-center justify-content-center">
          Points*: ----
        </div>
        <div id="wagerDisplay" className="text-center ms-3 mb-2 px-2 border rounded d-flex align-items-center justify-content-center">
          Current Hand's Wager: --
        </div>
      </div>
    </>
  );
}
