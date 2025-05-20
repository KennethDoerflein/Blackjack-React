import { Button, Container, Modal } from "react-bootstrap";
import appInfo from "../../../package.json";
import gitInfo from "../../generatedGitInfo.json";

export default function InfoModal({ show, handleClose, newGame, currentWager }) {
  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
      <Modal.Header className="bg-primary text-white p-2">
        <Modal.Title className="mx-auto fw-bold" style={{ fontSize: "1.2rem" }}>
          <Container className="text-center">Game Info</Container>
          <Container className="text-center" style={{ fontSize: "0.7rem" }}>
            App Version: {appInfo.version}
            <p className="mb-0">Branch: {gitInfo.branch || "N/A"}</p>
          </Container>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-light text-dark p-2" style={{ fontSize: "0.85rem" }}>
        <section>
          <h6 className="text-center fw-bold" style={{ fontSize: "0.9rem" }}>
            <u>Disclaimer</u>
          </h6>
          <p className="mb-1">By playing, you acknowledge:</p>
          <ul className="ps-3 mb-2">
            <li>Points are fictional; no monetary value.</li>
            <li>This game doesn't promote gambling; 18+ only.</li>
            <li>Play responsibly; don't neglect duties.</li>
            <li>Rules may change; check regularly.</li>
            <li>Proceeding means acceptance of terms.</li>
          </ul>
        </section>

        <hr className="my-2" />

        <section>
          <h6 className="text-center fw-bold" style={{ fontSize: "0.9rem" }}>
            <u>Blackjack Rules</u>
          </h6>
          <ol className="ps-3 mb-2">
            <li>Beat the dealer without exceeding 21.</li>
            <li>Face cards = 10; Aces = 1 or 11.</li>
            <li>Start with 2 cards; 1 dealer card hidden.</li>
            <li>
              <strong>Hit:</strong> Ask for another card.
            </li>
            <li>
              <strong>Stand:</strong> Hold total, end turn.
            </li>
            <li>
              <strong>Bust:</strong> (&gt;21) = Loss.
            </li>
            <li>
              <strong>Blackjack:</strong> : Ace + 10/Face card.
            </li>
            <li>Dealer hits until 17+; `soft17Switch` affects strategy.</li>
          </ol>
        </section>

        <hr className="my-2" />

        <section>
          <h6 className="text-center fw-bold" style={{ fontSize: "0.9rem" }}>
            <u>Button Guide</u>
          </h6>
          <ul className="ps-3 mb-2">
            <li>
              <strong>Hit:</strong> Request another card.
            </li>
            <li>
              <strong>Split:</strong> Divide same-value cards; double wager.
            </li>
            <li>
              <strong>Double Down:</strong> Double wager; one more card.
            </li>
            <li>
              <strong>Stand:</strong> End turn
            </li>
            <li>
              <strong>New Game:</strong> Start next game.
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
          className="mx-auto"
          style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}>
          I Acknowledge and Accept
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
