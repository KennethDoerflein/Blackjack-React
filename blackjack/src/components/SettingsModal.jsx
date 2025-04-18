import React from "react";
import appInfo from "../../package.json";
import { Modal, Button, Form, Container } from "react-bootstrap";

export default function SettingsModal({
  currentWager,
  show,
  handleClose,
  soft17Checked,
  setSoft17Checked,
  splitTypeChecked,
  setSplitTypeChecked,
  autoStandChecked,
  setAutoStandChecked,
  dealersHandElements,
  audioRef,
}) {
  const toggleMusic = () => {
    if (audioRef && audioRef.current) {
      audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
    }
  };

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
            id="soft17Switch"
            label="Dealer Hits on Soft 17"
            disabled={dealersHandElements.length > 0 || currentWager[0] > 0}
            checked={soft17Checked}
            onChange={() => setSoft17Checked(!soft17Checked)}
          />
          <Form.Check
            type="switch"
            id="splitSwitch"
            label="Split Based on Rank"
            disabled={dealersHandElements.length > 0 || currentWager[0] > 0}
            checked={splitTypeChecked}
            onChange={() => setSplitTypeChecked(!splitTypeChecked)}
          />
          <Form.Check
            type="switch"
            id="autoStandSwitch"
            label="Auto Stand on 21 (Player)"
            disabled={dealersHandElements.length > 0 || currentWager[0] > 0}
            checked={autoStandChecked}
            onChange={() => setAutoStandChecked(!autoStandChecked)}
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
