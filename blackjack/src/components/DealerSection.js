import React from "react";

export default function DealerSection({ dealersHandElements, dealerTotal }) {
  return (
    <>
      <h6 id="dealerHeader" className="container text-center my-3">
        Dealer's Cards {dealersHandElements.length >= 2 && !dealersHandElements[1].props.src.includes("back.png") ? `(Total: ${dealerTotal})` : ""}
      </h6>
      <div id="dealersHand" className="container">
        {dealersHandElements}
      </div>
    </>
  );
}
