import React from "react";

export default function DealerSection({ dealersHandElements }) {
  return (
    <>
      <h6 id="dealerHeader" className="container text-center my-3">
        Dealer's Cards
      </h6>
      <div id="dealersHand" className="container">
        {dealersHandElements}
      </div>
    </>
  );
}
