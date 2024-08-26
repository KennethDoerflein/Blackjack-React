import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
// import { checkSplitButton } from "../utils/utils.js";

export default function SettingsModal({ playersHands, currentHand, splitCount, currentWager, playerPoints, playerTotals, endHand, show, handleClose }) {
  const toggleMusic = () => {
    const backgroundMusic = document.getElementById("backgroundMusic");
    if (backgroundMusic) {
      backgroundMusic.paused ? backgroundMusic.play() : backgroundMusic.pause();
    }
  };

  // const checkStand = () => {
  //   if (playerTotals[currentHand] === 21) {
  //     endHand();
  //   }
  // };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-3 text-muted text-decoration-underline">
          <small>Some Switches Will Be Disabled During a Game</small>
        </div>
        <Form>
          <Form.Check type="switch" id="musicSwitch" label="Music" onClick={toggleMusic} />
          {/* <Form.Check type="switch" id="standSwitch" label="Automatically Stand When You Get 21" onClick={checkStand} />
          <Form.Check defaultChecked type="switch" id="soft17Switch" label="Dealer Hits on Soft 17" disabled={currentWager[0] > 0} />
          <Form.Check
            type="switch"
            id="splitSwitch"
            label="Split Based on Rank"
            onClick={() => checkSplitButton(playersHands, currentHand, splitCount, currentWager, playerPoints)}
            disabled={currentWager[0] > 0}
          /> */}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} className="mx-auto">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
