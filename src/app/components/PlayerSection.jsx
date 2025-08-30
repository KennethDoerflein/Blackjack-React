import React, { useEffect, useRef } from "react";
import { Carousel, Container } from "react-bootstrap";
import RollingValue from "./RollingValue.jsx";
import { adjustCardMargins } from "../utils/uiUtils.js";
import { CARD_FLIP_TIME } from "../utils/constants.js";

export default React.memo(function PlayerSection({
  playersHandElements,
  playerTotals,
  splitCount,
  playersHandNames,
  currentHand,
  carousalInterval,
  setCurrentHand,
}) {
  const handRefs = useRef([]);
  const totalRefs = useRef([]);

  const handleSelect = (selectedIndex) => {
    if (carousalInterval !== null) {
      setCurrentHand(selectedIndex);
    }
  };

  useEffect(() => {
    const adjustMargins = () => {
      if (playersHandElements[0].length > 2 || playersHandElements.length === 0) {
        playersHandElements.forEach((hand, i) => {
          if (hand.length > 0 && handRefs.current[i]) {
            adjustCardMargins(handRefs.current[i]);
          }
        });
      }
    };
    requestAnimationFrame(adjustMargins);
  }, [playersHandElements, playersHandNames]);

  useEffect(() => {
    if (totalRefs.current[currentHand]) {
      const el = totalRefs.current[currentHand];
      el.classList.add("handPulse");
      const t = setTimeout(() => el.classList.remove("handPulse"), 420);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [playerTotals[currentHand]]);

  return (
    <Carousel
      activeIndex={currentHand}
      onSelect={handleSelect}
      interval={carousalInterval}
      controls={false}
      indicators={false}
      className="mb-2 mt-4 mx-auto"
      pause={null}>
      {playersHandElements.map((hand, i) => (
        <Carousel.Item key={`player-hand-${i}`}>
          <Container className="text-center my-3">
            <div className="handHeader">
              <h6 id="playerHeader" style={{ margin: 0 }}>
                Player's Hand{` ${splitCount > 0 ? i + 1 : ""}`}
              </h6>
              <div ref={(r) => (totalRefs.current[i] = r)} className="handTotal">
                Total: &nbsp;
                <RollingValue ref={totalRefs} duration={CARD_FLIP_TIME} value={playerTotals[i]} />
              </div>
            </div>
          </Container>
          <span className="playersHands" id={`playersHands-${i}`}>
            <Container
              fluid
              key={playersHandNames[i]}
              id={playersHandNames[i]}
              ref={(el) => (handRefs.current[i] = el)}>
              {hand.map((card) => (
                <img key={card.id} src={card.src} alt={card.image} className={card.className} />
              ))}
            </Container>
          </span>
        </Carousel.Item>
      ))}
    </Carousel>
  );
});
