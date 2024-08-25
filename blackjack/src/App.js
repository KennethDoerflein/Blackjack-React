import React, { useState, useEffect } from "react";
import DealerSection from "./components/DealerSection.js";
import PlayerSection from "./components/PlayerSection.js";
import PointSection from "./components/PointSection.js";
import WagerControls from "./components/WagerControls.js";
import GameControls from "./components/GameControls.js";
import SettingsModal from "./components/SettingsModal.js";
import InfoModal from "./components/InfoModal.js";
import TopButtons from "./components/TopButtons.js";

import CardDeck from "./game_logic/CardDeck.js";

import {
  toggleHiddenElement,
  toggleDisabledElement,
  enableGameButtons,
  delay,
  hideGameButtons,
  updateGameButtons,
  isDoubleDownAllowed,
  disableGameButtons,
} from "./utils/utils.js";

import { calculateTotal, addCard, flipCard, shouldDealerHit, autoStandOn21 } from "./game_logic/gameFunctions.js";

import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "bootstrap";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./styles.css";

export default function App() {
  document.documentElement.setAttribute("data-bs-theme", "dark");
  const [deck, setDeck] = useState(new CardDeck());
  const [playersHands, setPlayerHand] = useState([[], [], [], []]);
  const [playersHandElements, setPlayersHandElements] = useState([[], [], [], []]);
  const [dealersHand, setDealersHand] = useState([]);
  const [dealersHandElements, setDealersHandElements] = useState([]);
  const [playerPoints, setPlayerPoints] = useState(100);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [playerTotals, setPlayerTotal] = useState([0, 0, 0, 0]);
  const [currentWager, setCurrentWager] = useState([0, 0, 0, 0]);
  const [currentHand, setCurrentHand] = useState(0);
  const [splitCount, setSplitCount] = useState(0);
  const playerHandNames = ["playersHand", "playersSecondHand", "playersThirdHand", "playersFourthHand"];

  // Start the game and show the info modal
  window.onload = async () => {
    const infoModal = new Modal(document.getElementById("infoModal"), {
      keyboard: false,
    });
    infoModal.show();
    newGame();
  };

  // Start a new game by shuffling the deck and resetting the UI
  const newGame = () => {
    if (playerPoints > 0) {
      document.getElementById("newGameBtn").hidden = true;
      setDeck(new CardDeck());
      setPlayerHand([[], [], [], []]);
      setDealersHand([]);
      setDealerTotal(0);
      setPlayerTotal([0, 0, 0, 0]);
      setCurrentWager([0, 0, 0, 0]);
      setCurrentHand(0);
      setSplitCount(0);
      setPlayersHandElements([[], [], [], []]);
      setDealersHandElements([]);
      toggleHiddenElement(document.getElementById("wagerDiv"));
      const resultsDiv = document.getElementById("resultsAlert");
      if (!resultsDiv.hidden) toggleHiddenElement(resultsDiv);
      for (let i = 1; i <= splitCount; i++) {
        toggleHiddenElement(document.getElementById(playerHandNames[i]));
      }
    }
  };

  // Deal initial cards to player and dealer
  const initialDeal = async (updatedPoints) => {
    await hit("player", "init");
    await hit("dealer", "init");
    const newTotal = await hit("player", "init");
    await hit("dealer", "init");
    document.getElementById("playersHand").classList.add("activeHand");
    enableGameButtons();
    if (autoStandOn21(newTotal)) {
      await delay(500);
      await endHand();
    } else updateGameButtons(playerTotals[currentHand], playersHands, currentHand, splitCount, currentWager, updatedPoints);
  };

  const updateWager = (value) => {
    const newWager = [...currentWager];
    newWager[currentHand] = parseInt(value, 10);
    setCurrentWager(newWager);
  };

  // Deal a card to the player or dealer
  const hit = async (entity = "player", origin = "user", hand = currentHand) => {
    disableGameButtons();
    const newPlayersHands = [...playersHands];
    if (entity !== "dealer") {
      await addCard(newPlayersHands[hand], playersHandElements[hand], entity, origin, deck, setPlayersHandElements, hand);
    } else {
      await addCard(dealersHand, dealersHandElements, entity, origin, deck, setDealersHandElements);
    }

    // Calculate the new totals before updating the state
    const newTotals = [...playerTotals];
    for (let i = 0; i < newPlayersHands.length; i++) {
      newTotals[i] = await calculateTotal(newPlayersHands[i]);
    }
    const newDealerTotal = await calculateTotal(dealersHand);

    setPlayerTotal(newTotals);
    setDealerTotal(newDealerTotal);
    setPlayerHand(newPlayersHands);
    if (entity !== "dealer" && origin === "user") {
      updateGameButtons(newTotals[hand], newPlayersHands, hand, splitCount, currentWager, playerPoints);
      if (newTotals[hand] > 21) {
        hideGameButtons();
        await delay(750);
        await endHand();
      } else if (autoStandOn21(newTotals[hand]) && origin !== "doubleDown" && origin !== "split" && dealersHandElements.length > 2) {
        await delay(500);
        await endHand();
      }
      enableGameButtons();
    }
    await delay(725);
    if (entity !== "dealer") {
      return newTotals[hand];
    }
  };

  // End the current hand and proceed to the next hand or end the game
  const endHand = async (pointsLeft = playerPoints) => {
    if (currentHand === splitCount) {
      document.getElementById(playerHandNames[currentHand]).classList.remove("activeHand");
      document.getElementById("dealersHand").classList.add("activeHand");
      hideGameButtons();
      let imgPath = `./assets/cards-1.3/${dealersHand[1].image}`;
      let reactImgElement = <img key={2} src={imgPath} alt={dealersHand[1].image} />;
      await delay(800);
      flipCard(reactImgElement, dealersHand[1], setDealersHandElements, "dealer", -1);
      await playDealer();
      document.getElementById("dealersHand").classList.remove("activeHand");
      if (pointsLeft > 0) toggleHiddenElement(document.getElementById("newGameBtn"));

      toggleDisabledElement(document.getElementById("soft17Switch"));
      toggleDisabledElement(document.getElementById("splitSwitch"));
      displayWinner();
    } else if (currentHand !== splitCount) {
      advanceHand(currentHand + 1);
    }
  };

  // Advance to the next player hand if splits occurred
  function advanceHand(newHand) {
    if (currentHand < splitCount && splitCount > 0) {
      updateGameButtons(playerTotals[newHand], playersHands, newHand, splitCount, currentWager, playerPoints);
      document.getElementById(playerHandNames[newHand]).classList.add("activeHand");
      document.getElementById(playerHandNames[currentHand]).classList.remove("activeHand");
      setCurrentHand(newHand);
      if (!autoStandOn21(playerTotals[newHand])) {
        enableGameButtons();
      }
    }
  }

  // Use useEffect to watch for changes in currentHand with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (autoStandOn21(playerTotals[currentHand])) {
        endHand();
      }
    }, 1000); // Adjust the delay time as needed

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [currentHand]);

  // Split the player's hand into two separate hands
  const splitHand = async () => {
    disableGameButtons();
    const newSplitCount = splitCount + 1;
    setSplitCount(newSplitCount);
    const newPlayersHands = [...playersHands];
    const newPlayerHandElements = [...playersHandElements];
    const newCurrentWager = [...currentWager];
    newCurrentWager[newSplitCount] = newCurrentWager[currentHand];

    newPlayersHands[newSplitCount].push(newPlayersHands[currentHand].pop());
    newPlayerHandElements[newSplitCount].push({ ...newPlayerHandElements[currentHand].pop(), key: "1" });

    // Calculate the new totals before updating the state
    const newTotals = [...playerTotals];
    for (let i = 0; i < newPlayersHands.length; i++) {
      newTotals[i] = await calculateTotal(newPlayersHands[i]);
    }

    setPlayerTotal(newTotals);
    setPlayerHand(newPlayersHands);
    setPlayersHandElements(newPlayerHandElements);
    setCurrentWager(newCurrentWager);
    setPlayerPoints(playerPoints - newCurrentWager[newSplitCount]);
    document.getElementById(playerHandNames[newSplitCount]).toggleAttribute("hidden");
    await delay(750);
    await hit("player", "split", currentHand);
    await hit("player", "split", newSplitCount);

    // Calculate the new totals before updating the state
    for (let i = 0; i < newPlayersHands.length; i++) {
      newTotals[i] = await calculateTotal(newPlayersHands[i]);
    }

    setPlayerTotal(newTotals);
    updateGameButtons(newTotals[currentHand], newPlayersHands, currentHand, newSplitCount, currentWager, playerPoints);
    if (autoStandOn21(newTotals[currentHand])) {
      await delay(500);
      endHand();
    } else {
      enableGameButtons();
    }
  };

  // Play the dealer's hand according to the rules
  const playDealer = async () => {
    let newDealerTotal = dealerTotal;
    while (shouldDealerHit(newDealerTotal, dealersHand)) {
      await delay(550);
      await hit("dealer", "endGame");
      newDealerTotal = await calculateTotal(dealersHand);
      setDealerTotal(newDealerTotal);
    }
  };

  // Display the outcome of the game and update player points
  function displayWinner() {
    let outcomes = [[], []];

    for (let handIndex = 0; handIndex < playersHands.length; handIndex++) {
      if (playersHands[handIndex].length === 0) continue;

      let outcome = "";
      let wagerMultiplier = 1;
      if (playerTotals[handIndex] > 21) {
        outcome = "Player Busted, Dealer Wins";
        wagerMultiplier = 0;
      } else if (dealerTotal > 21 || playerTotals[handIndex] > dealerTotal) {
        if (playerTotals[handIndex] === 21 && playersHands[handIndex].length === 2) {
          outcome = "Blackjack, Player Wins";
        } else {
          outcome = dealerTotal > 21 ? "Dealer Busted, Player Wins" : "Player Wins";
        }
        wagerMultiplier = playerTotals[handIndex] === 21 && playersHands[handIndex].length === 2 ? 2.2 : 2;
      } else if (dealerTotal > playerTotals[handIndex]) {
        outcome = "Dealer Wins";
        wagerMultiplier = 0;
      } else {
        outcome = "Push (Tie)";
      }

      setPlayerPoints(playerPoints + Math.ceil(currentWager[handIndex] * wagerMultiplier));
      outcomes[handIndex] = splitCount > 0 ? `Hand ${handIndex + 1}: ${outcome}` : outcome;

      let winnerElement = createWinnerElement(outcomes[handIndex]);
      document.getElementById("message").append(winnerElement);
    }

    setCurrentWager([0, 0, 0, 0]);
    if (playerPoints === 0) {
      let message = createWinnerElement("You are out of points, thank you for playing!");
      message.classList.add("mt-2", "mb-5");
      document.getElementById("bottomDiv").appendChild(message);
    }
    toggleHiddenElement(document.getElementById("resultsAlert"));
  }

  // Create and return a winner element with the outcome text
  function createWinnerElement(outcome) {
    let winner = document.createElement("h6");
    winner.classList.add("my-1");
    winner.textContent = outcome;
    return winner;
  }

  return (
    <>
      <TopButtons />
      <div id="main" className="container-fluid my-2">
        <div hidden id="resultsAlert" className="alert alert-info alert-dismissible fade show w-75 mx-auto px-0" role="alert">
          <div id="message" className="container text-center"></div>
        </div>
        <DealerSection dealersHandElements={dealersHandElements} dealerTotal={dealerTotal} />
        <PlayerSection playersHandElements={playersHandElements} playerTotals={playerTotals} splitCount={splitCount} />
        <PointSection playerPoints={playerPoints} currentWager={currentWager[currentHand]} />
        <div id="bottomDiv" className="container text-center">
          <WagerControls
            playerPoints={playerPoints}
            setPlayerPoints={setPlayerPoints}
            currentWager={currentWager}
            updateWager={updateWager}
            currentHand={currentHand}
            initialDeal={initialDeal}
          />
          <GameControls
            hit={hit}
            newGame={newGame}
            endHand={endHand}
            doubleDownAllowed={isDoubleDownAllowed(playersHands, currentHand, playerTotals[currentHand], currentWager, playerPoints)}
            updateWager={updateWager}
            playerPoints={playerPoints}
            setPlayerPoints={setPlayerPoints}
            currentHandWager={currentWager[currentHand]}
            splitHand={splitHand}
          />
        </div>
        <div id="disclaimer" className="container text-center mt-3">
          <p className="small text-muted my-0 px-5">
            <strong>* Disclaimer:</strong> Points in this game have <strong>no monetary value</strong> and are for <strong>entertainment purposes only</strong>.
          </p>
        </div>
      </div>

      <SettingsModal
        playersHands={playersHands}
        currentHand={currentHand}
        splitCount={splitCount}
        currentWager={currentWager}
        playerPoints={playerPoints}
        endHand={endHand}
        playerTotals={playerTotals}
      />
      <InfoModal />
    </>
  );
}
