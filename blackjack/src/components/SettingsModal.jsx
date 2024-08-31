import React, { useEffect } from "react";
import appInfo from "../../package.json";
import { Modal, Button, Form, Container } from "react-bootstrap";
import { disableGameButtons } from "../utils/utils.js";

export default function SettingsModal({
  currentWager,
  show,
  handleClose,
  soft17Checked,
  setSoft17Checked,
  autoStandChecked,
  setAutoStandChecked,
  splitTypeChecked,
  setSplitTypeChecked,
  endHand,
  playerTotals,
  currentHand,
  dealersHandElements,
}) {
  const toggleMusic = () => {
    const backgroundMusic = document.getElementById("backgroundMusic");
    if (backgroundMusic) {
      backgroundMusic.paused ? backgroundMusic.play() : backgroundMusic.pause();
    }
  };

  // Use useEffect to watch for changes in currentHand with a delay
  useEffect(() => {
    if (dealersHandElements.length >= 2 && dealersHandElements[1].props.src.includes("back.png")) {
      if (autoStandChecked && playerTotals[currentHand] === 21) {
        disableGameButtons();
        setTimeout(() => {
          endHand();
        }, 500);
      }
    }
    // eslint-disable-next-line
  }, [currentHand, playerTotals, autoStandChecked]);

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
          <Form.Check
            type="switch"
            id="standSwitch"
            label="Automatically Stand When You Get 21"
            checked={autoStandChecked}
            onChange={() => setAutoStandChecked(!autoStandChecked)}
          />
          <Form.Check
            type="switch"
            id="soft17Switch"
            label="Dealer Hits on Soft 17"
            disabled={(dealersHandElements.length > 0 || playerTotals[0] > 0) && currentWager[0] > 0}
            checked={soft17Checked}
            onChange={() => setSoft17Checked(!soft17Checked)}
          />
          <Form.Check
            type="switch"
            id="splitSwitch"
            label="Split Based on Rank"
            disabled={(dealersHandElements.length > 0 || playerTotals[0] > 0) && currentWager[0] > 0}
            checked={splitTypeChecked}
            onChange={() => setSplitTypeChecked(!splitTypeChecked)}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} className="mx-auto">
          Close
        </Button>
      </Modal.Footer>
      <Container className="text-center pb-2">App Version: {appInfo.version}</Container>
    </Modal>
  );
}
