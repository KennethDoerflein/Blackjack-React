import React, { useEffect, useState } from "react";
import { Container, Carousel } from "react-bootstrap";
import { adjustCardMargins } from "../utils/uiUtils.js";

export default function PlayerSection({ playersHandElements, playerTotals, splitCount, playersHandNames, currentHand, carousalInterval }) {
  const [index, setIndex] = useState(currentHand); // Keep track of the current hand in Carousel

  // Sync the Carousel index with the current hand when it changes
  useEffect(() => {
    setIndex(currentHand);
  }, [currentHand, carousalInterval]);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex); // Update Carousel index
    //setCurrentHand(selectedIndex); // Update the active hand in parent state
  };

  useEffect(() => {
    const adjustMargins = () => {
      if (playersHandElements[0].length > 2) {
        playersHandElements.forEach((hand, i) => {
          if (hand.length > 0) {
            adjustCardMargins(document.getElementById(playersHandNames[i]));
          }
        });
      }
    };
    requestAnimationFrame(adjustMargins);
  }, [playersHandElements, playersHandNames]);

  return (
    <>
      <Carousel activeIndex={index} onSelect={handleSelect} interval={carousalInterval} controls={false} indicators={false} className="my-3 mx-auto">
        {playersHandElements.map((hand, i) => (
          <Carousel.Item key={i + hand}>
            <Container className="text-center my-3">
              <h6 id="playerHeader">
                Player's Hand{` ${splitCount > 0 ? i + 1 : ""}`} (Total: {playerTotals[i]})
              </h6>
            </Container>
            <span id="playersHands">
              <Container fluid key={i} id={playersHandNames[i]}>
                {hand}
              </Container>
            </span>
          </Carousel.Item>
        ))}
      </Carousel>
    </>
  );
}
