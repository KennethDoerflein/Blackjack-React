import { motion, useAnimationControls } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image as BSImage, Button, Container, Spinner } from "react-bootstrap";
import { animateElement } from "../utils/uiUtils.js";

const chipNames = ["1Chip", "5Chip", "10Chip", "20Chip", "50Chip"];

const preloadImages = (imageArray) => {
  const promises = imageArray.map((image) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = `./assets/${image}.jpg`;
      img.onload = resolve;
    });
  });
  return Promise.all(promises);
};

export default function WagerControls({
  currentWager,
  updateWager,
  currentHand,
  playerPoints,
  setPlayerPoints,
  initialDeal,
  playersHands,
  showInfo,
  loading,
  isBusy,
}) {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const wagerDisplayRef = useRef(null);
  const chipControls = [1, 5, 10, 20, 50].map(() => useAnimationControls());

  useEffect(() => {
    preloadImages(chipNames).then(() => setImagesLoaded(true));
  }, []);

  const addChipValue = useCallback(
    (e) => {
      if (isBusy) return;
      const idx = [1, 5, 10, 20, 50].indexOf(parseInt(e.target.getAttribute("data-value"), 10));
      if (idx !== -1) {
        chipControls[idx].start({ rotateX: [180, 0], rotateY: [360, 0], transition: { duration: 0.7, ease: "linear" } });
      }
      // Highlight the wager box for the current hand
      const wagerBox = document.getElementById(`wagerDisplay-${currentHand}`);
      if (wagerBox) {
        wagerBox.classList.add("highlight");
        setTimeout(() => wagerBox.classList.remove("highlight"), 500);
      }
      const chipValue = parseInt(e.target.getAttribute("data-value"), 10);
      const newWager = currentWager[currentHand] + chipValue;
      if (newWager <= playerPoints && Number.isInteger(newWager)) {
        updateWager(newWager);
      } else if (newWager > playerPoints) {
        updateWager(playerPoints);
      }
    },
    [currentWager, currentHand, playerPoints, updateWager, isBusy, chipControls]
  );

  const clearWager = useCallback(() => {
    if (isBusy) return;
    updateWager(0);
  }, [updateWager, isBusy]);

  const placeWager = useCallback(
    async (e) => {
      if (isBusy) return;
      let id = e.target.id;
      let isAllIn = id === "allInBtn";
      let isWagerValid =
        !isNaN(currentWager[currentHand]) &&
        currentWager[currentHand] > 0 &&
        currentWager[currentHand] <= playerPoints;
      let updatedPoints = 0;
      if (isWagerValid || isAllIn) {
        if (isAllIn) {
          updateWager(playerPoints);
        } else {
          updatedPoints = playerPoints - currentWager[currentHand];
        }
        setPlayerPoints(updatedPoints);
        await initialDeal(updatedPoints);
      } else {
        alert("The wager must be a number and greater than 0.");
      }
    },
    [currentWager, currentHand, playerPoints, setPlayerPoints, updateWager, initialDeal, isBusy]
  );

  if (!imagesLoaded || loading) {
    return (
      <div className="mt-2 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status" variant="primary" />
        <span className="ms-2">Loading assets...</span>
      </div>
    );
  }

  return (
    <Container hidden={playersHands[0].length !== 0 || showInfo} id="wagerDiv" className="mt-2">
      {[1, 5, 10, 20, 50].map((val, idx) => (
        <motion.div
          key={val}
          animate={chipControls[idx]}
          initial={{ rotateX: 0, rotateY: 0 }}
          whileTap={{ scale: 1.2, rotate: 12 }}
          whileHover={{ scale: 1.08 }}
          style={{ display: "inline-block", margin: "0 4px", perspective: 600 }}
        >
          <BSImage
            onClick={isBusy ? undefined : addChipValue}
            className="chip"
            src={`./assets/${val}Chip.jpg`}
            data-value={val}
            alt={`${val} point chip`}
            style={{ backfaceVisibility: "visible" }}
          />
        </motion.div>
      ))}
      <div>
        <Button
          onClick={isBusy ? undefined : clearWager}
          id="wagerRst"
          variant="danger"
          size="sm"
          className="align-middle ms-2 my-3">
          Reset Wager
        </Button>
        <Button
          onClick={isBusy ? undefined : placeWager}
          id="allInBtn"
          variant="warning"
          size="sm"
          className="align-middle ms-2 my-3">
          Max Wager
        </Button>
        <Button
          onClick={isBusy ? undefined : placeWager}
          id="wagerBtn"
          variant="primary"
          size="sm"
          className="align-middle ms-2 my-3">
          Place Wager
        </Button>
      </div>
    </Container>
  );
}
