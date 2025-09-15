import { Button, Container, Modal } from "react-bootstrap";
import appInfo from "../../../package.json";
import gitInfo from "../../generatedGitInfo.json";

export default function InfoModal({ show, handleClose, newGame, currentWager }) {
  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
      <Modal.Header className="bg-primary text-white p-0">
        <Modal.Title className="mx-auto fw-bold" style={{ fontSize: "1.2rem" }}>
          <Container className="text-center">Game Info</Container>
          <Container className="text-center text-muted" style={{ fontSize: "0.6rem" }}>
            App Version: {appInfo.version}
            <p className="mb-0">Branch: {gitInfo.branch || "N/A"}</p>
          </Container>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-2" style={{ fontSize: "0.75rem" }}>
        <section>
          <h6 className="text-center fw-bold" style={{ fontSize: "0.9rem" }}>
            <u>Disclaimer & Terms</u>
          </h6>
          <p className="mb-1">By using this game, you acknowledge and agree to the following:</p>
          <ul className="ps-3 mb-2">
            <li>For entertainment only. Points have no real value.</li>
            <li>Not a gambling platform. No real gambling occurs.</li>
            <li>Players must be 21+ and confirm age by playing.</li>
            <li>Play responsibly; the developer is not liable for misuse.</li>
            <li>Rules may change without notice. Review as needed.</li>
            <li>Continuing to play indicates acceptance of these terms.</li>
          </ul>
        </section>

        <hr className="my-2" />

        <section>
          <h6 className="text-center fw-bold" style={{ fontSize: "0.9rem" }}>
            <u>How to Play</u>
          </h6>
          <ol className="ps-3 mb-2" style={{ fontSize: "0.75rem" }}>
            <li>Get a hand higher than the dealer without exceeding 21.</li>
            <li>Face cards = 10, Aces = 1 or 11.</li>
            <li>Start with 2 cards; dealer shows 1 card.</li>
            <li>
              <strong>Hit:</strong> Draw a card.
            </li>
            <li>
              <strong>Stand:</strong> Keep your hand.
            </li>
            <li>
              <strong>Bust:</strong> Over 21 loses.
            </li>
            <li>
              <strong>Blackjack:</strong> Ace + 10/face card.
            </li>
            <li>Dealer hits until 17+; optional rules may apply.</li>
          </ol>
        </section>

        <hr className="my-2" />

        <section>
          <h6 className="text-center fw-bold" style={{ fontSize: "0.9rem" }}>
            <u>Controls</u>
          </h6>
          <ul className="ps-3 mb-2" style={{ fontSize: "0.75rem" }}>
            <li>
              <strong>Hit:</strong> Draw a card.
            </li>
            <li>
              <strong>Split:</strong> Separate matching cards into 2 hands.
            </li>
            <li>
              <strong>Double Down:</strong> Double wager, draw 1 card.
            </li>
            <li>
              <strong>Stand:</strong> End turn.
            </li>
            <li>
              <strong>New Game:</strong> Start a new round.
            </li>
            <li>
              <strong>Music:</strong> Toggle on/off (default off).
            </li>
          </ul>
        </section>
      </Modal.Body>

      <Modal.Footer className="bg-primary p-2">
        <Button
          onClick={() => {
            handleClose();
            setTimeout(() => {
              if (document.getElementById("newGameBtn").hidden && currentWager[0] === 0) {
                newGame();
              }
            }, 200);
          }}
          variant="warning"
          className="mx-auto mb-0 mt-3"
          style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}>
          I Acknowledge and Accept
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
