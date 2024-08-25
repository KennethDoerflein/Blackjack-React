import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function InfoModal({ show, handleClose, newGame }) {
  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
      <Modal.Header className="bg-primary text-white">
        <Modal.Title className="mx-auto fw-bolder">Game Rules and Button Explanations</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light text-dark">
        <p className="modal-title text-center fw-bolder">
          <u>Disclaimer</u>
        </p>
        <p>By visiting this site or playing this game, you acknowledge that:</p>
        <ul>
          <li>
            The points earned in this game are purely fictional, have no monetary value, and are for entertainment purposes only. They cannot be exchanged for any goods or
            services.
          </li>
          <li>This game does not promote any form of gambling.</li>
          <li>The game is intended for users who are 18 years of age or older.</li>
          <li>Users should play responsibly and ensure that playing does not interfere with their daily responsibilities.</li>
          <li>The game rules are subject to change, so users should check the rules regularly.</li>
          <li>By bypassing this agreement, you accept and agree to abide by these terms.</li>
        </ul>

        <hr />

        <p className="modal-title text-center fw-bolder">
          <u>Blackjack Rules</u>
        </p>
        <ol>
          <li>The goal of blackjack is to beat the dealer's hand without going over 21.</li>
          <li>Face cards are worth 10. Aces are worth 1 or 11, whichever makes a better hand.</li>
          <li>Each player starts with two cards; one of the dealer's cards is hidden until the end.</li>
          <li>To 'Hit' is to ask for another card. To 'Stand' is to hold your total and end your turn.</li>
          <li>If you go over 21, you bust, and the dealer wins regardless of the dealer's hand.</li>
          <li>If you are dealt an Ace and a 10 (or a face card), you have blackjack.</li>
          <li>
            The dealer will hit until their cards total 17 or higher. If the `soft17Switch` is checked, the dealer will also hit on a soft 17 (a hand totaling 17 with an Ace
            counted as 11).
          </li>
        </ol>

        <hr />

        <p className="modal-title text-center fw-bolder">
          <u>Button Explanations</u>
        </p>
        <ul>
          <li>
            <strong>Hit Button</strong>: Request another card from the dealer.
          </li>
          <li>
            <strong>Split Button</strong>: Split two cards of the same value into two separate hands, doubling your wager. Splitting is allowed if the game is in progress, you
            haven't already split three times, the two cards have the same point value, and you have enough points for the wager.
          </li>
          <li>
            <strong>Double Down Button</strong>: Double your initial wager and receive one more card. This is typically used when the odds are in your favor. Doubling down is
            allowed if the game is in progress, your hand has exactly two cards, the total of the hand is 21 or less, and you have enough points for the wager.
          </li>
          <li>
            <strong>Stand Button</strong>: Choose not to take any more cards and pass to the next hand or dealer. If the `standSwitch` is checked and your total is 21, the
            game will automatically move to the dealer's turn or next hand.
          </li>
          <li>
            <strong>Start/New Game Button</strong>: Starts a new game.
          </li>
          <li>
            <strong>Music Toggle</strong>: Enables or disables the game music (disabled by default).
          </li>
        </ul>
      </Modal.Body>
      <Modal.Footer className="bg-primary">
        <Button
          onClick={() => {
            newGame();
            handleClose();
          }}
          variant="warning"
          className="mx-auto">
          I Acknowledge and Accept
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
