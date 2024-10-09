import React, { useEffect } from "react";
import { Container, Carousel } from "react-bootstrap";
import { adjustCardMargins } from "../utils/uiUtils.js";

export default function PlayerSection({
  playersHandElements,
  playerTotals,
  splitCount,
  playersHandNames,
  currentHand,
  carousalInterval,
  setCurrentHand,
}) {

  const handleSelect = (selectedIndex) => {
    if (carousalInterval !== null) {
      setCurrentHand(selectedIndex);
    }
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
      <Carousel
        activeIndex={currentHand}
        onSelect={handleSelect}
        interval={carousalInterval}
        controls={false}
        indicators={false}
        className="my-3 mx-auto"
        pause={null}>
        {playersHandElements.map((hand, i) => (
          <Carousel.Item key={i}>
            <Container className="text-center my-3">
              <h6 id="playerHeader">
                Player's Hand{` ${splitCount > 0 ? i + 1 : ""}`} (Total: {playerTotals[i]})
              </h6>
            </Container>
            <span id="playersHands">
              <Container fluid key={playersHandNames[i]} id={playersHandNames[i]}>
                {hand}
              </Container>
            </span>
          </Carousel.Item>
        ))}
      </Carousel>
    </>
  );
}
