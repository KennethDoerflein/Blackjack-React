import React, { useState } from "react";
import DealerSection from "./components/DealerSection.js";
import PlayerSection from "./components/PlayerSection.js";
import PointSection from "./components/PointSection.js";
import WagerControls from "./components/WagerControls.js";
import GameControls from "./components/GameControls.js";
import SettingsModal from "./components/SettingsModal.js";
import InfoModal from "./components/InfoModal.js";
import TopButtons from "./components/TopButtons.js";

import CardDeck from "./game_logic/CardDeck.js";

import { toggleHiddenElement, toggleDisabledElement, delay, hideGameButtons, updateGameButtons } from "./utils/utils.js";

import { calculateTotal, addCard, flipCard, shouldDealerHit } from "./game_logic/gameFunctions.js";

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
    updateGameButtons(playerTotals[currentHand], playerHands, currentHand, splitCount, currentWager, playerPoints);
    document.getElementById("playersHand").classList.add("activeHand");
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
      updateGameButtons(newTotals[currentHand]);
      if (newTotals[currentHand] > 21) {
        hideGameButtons();
        await endHand();
      } else if (newTotals[currentHand] === 21) {
        //autoStandOn21();
      }
    }
    await delay(1000);
    toggleDisabledElement(document.getElementById("hitBtn"));
  };

  const endHand = async () => {
    if (currentHand === splitCount) {
      document.getElementById("playersHand").classList.remove("activeHand");
      document.getElementById("dealersHand").classList.add("activeHand");
      hideGameButtons();
      let imgPath = `./assets/cards-1.3/${dealerHand[1].image}`;
      let reactImgElement = <img key={1} src={imgPath} alt={dealerHand[1].image} />;
      await delay(500);
      flipCard(reactImgElement, dealerHand[1], setDealerHandElements, "dealer", -1);
      if (shouldDealerHit(dealerTotal, dealerHand)) await delay(500);
      await playDealer();
      await delay(250);
      document.getElementById("dealersHand").classList.remove("activeHand");
    }
  };

  // Play the dealer's hand according to the rules
  const playDealer = async () => {
    let newDealerTotal = dealerTotal;
    while (shouldDealerHit(newDealerTotal, dealerHand)) {
      await hit("dealer", "endGame");
      newDealerTotal = await calculateTotal(dealerHand);
      setDealerTotal(newDealerTotal);
    }
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
          <GameControls hit={hit} newGame={newGame} endHand={endHand} />
        </div>
        <div id="disclaimer" className="container text-center mt-3">
          <p className="small text-muted my-0 px-5">
            <strong>* Disclaimer:</strong> Points in this game have <strong>no monetary value</strong> and are for <strong>entertainment purposes only</strong>.
          </p>
        </div>
      </div>

      <SettingsModal playerHands={playerHands} currentHand={currentHand} splitCount={splitCount} currentWager={currentWager} playerPoints={playerPoints} />
      <InfoModal />
    </>
  );
}
