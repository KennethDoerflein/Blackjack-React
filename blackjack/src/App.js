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

import { toggleHiddenElement, toggleDisabledElement, preloadAndGetImage, shouldFlipCard, createCardImage, delay } from "./utils/utils.js";

import { calculateTotal, addCard } from "./game_logic/gameFunctions.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./styles.css";

export default function App() {
  document.documentElement.setAttribute("data-bs-theme", "dark");
  const [deck, setDeck] = useState(new CardDeck());
  const [playerHands, setPlayerHand] = useState([[], [], [], []]);
  const [playerHandElements, setPlayerHandElements] = useState([[], [], [], []]);
  const [dealerHand, setDealerHand] = useState([]);
  const [dealerHandElements, setDealerHandElements] = useState([]);
  const [playerPoints, setPlayerPoints] = useState(100);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [playerTotals, setPlayerTotal] = useState([0, 0, 0, 0]);
  const [currentWager, setCurrentWager] = useState([0, 0, 0, 0]);
  const [currentHand, setCurrentHand] = useState(0);
  const [previousHand, setPreviousHand] = useState(0);
  const [splitCount, setSplitCount] = useState(0);

  window.onload = async () => {
    // if (!debugMode) {
    //   infoModal.show();
    // }
    newGame();
  };

  const newGame = () => {
    setDeck(new CardDeck());
    setPlayerHand([[], [], [], []]);
    setDealerHand([]);
    setDealerTotal(0);
    setPlayerTotal([0, 0, 0, 0]);
    setCurrentWager([0, 0, 0, 0]);
    setPlayerPoints(100);
    setCurrentHand(0);
    setPreviousHand(-1);
    setSplitCount(0);
    setPlayerHandElements([[], [], [], []]);
    setDealerHandElements([]);
    toggleHiddenElement(document.getElementById("wagerDiv"));
  };

  const initialDeal = async () => {
    await hit("player", "init");
    await hit("dealer", "init");
    await hit("player", "init");
    await hit("dealer", "init");
  };

  const updateWager = (value) => {
    const newWager = [...currentWager];
    newWager[currentHand] = parseInt(value, 10);
    setCurrentWager(newWager);
  };

  const hit = async (entity = "player", origin = "user") => {
    toggleDisabledElement(document.getElementById("hitBtn"));
    const newPlayerHands = [...playerHands];
    if (entity !== "dealer") {
      await addCard(newPlayerHands[currentHand], playerHandElements[currentHand], entity, origin, deck, setPlayerHandElements, currentHand);
    } else {
      await addCard(dealerHand, dealerHandElements, entity, origin, deck, setDealerHandElements);
    }

    // Calculate the new totals before updating the state
    const newTotals = [...playerTotals];
    for (let i = 0; i < newPlayerHands.length; i++) {
      newTotals[i] = await calculateTotal(newPlayerHands[i]);
    }
    const newDealerTotal = await calculateTotal(dealerHand);

    setPlayerTotal(newTotals);
    setDealerTotal(newDealerTotal);
    setPlayerHand(newPlayerHands);

    if (entity !== "dealer" && origin === "user") {
      //updateGameButtons();
      if (newTotals[currentHand] > 21) {
        //hideGameButtons();
        //await endHand();
      } else {
        //autoStandOn21();
      }
    }
    await delay(1000);
    toggleDisabledElement(document.getElementById("hitBtn"));
  };

  return (
    <>
      <TopButtons />
      <div id="main" className="container-fluid my-2">
        <div hidden id="resultsAlert" className="alert alert-info alert-dismissible fade show w-75 mx-auto px-0" role="alert">
          <div id="message" className="container text-center"></div>
        </div>
        <DealerSection dealerHandElements={dealerHandElements} />
        <PlayerSection playerHandElements={playerHandElements} playerTotals={playerTotals} />
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
          <GameControls hit={hit} />
        </div>
        <div id="disclaimer" className="container text-center mt-3">
          <p className="small text-muted my-0 px-5">
            <strong>* Disclaimer:</strong> Points in this game have <strong>no monetary value</strong> and are for <strong>entertainment purposes only</strong>.
          </p>
        </div>
      </div>

      <SettingsModal />
      <InfoModal />
    </>
  );
}
