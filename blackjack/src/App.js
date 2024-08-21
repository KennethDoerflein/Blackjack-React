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

import { toggleHiddenElement, toggleDisabledGameButtons, delay, hideGameButtons, updateGameButtons, isDoubleDownAllowed } from "./utils/utils.js";

import { calculateTotal, addCard, flipCard, shouldDealerHit } from "./game_logic/gameFunctions.js";

import "bootstrap/dist/css/bootstrap.min.css";
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
    setDealersHand([]);
    setDealerTotal(0);
    setPlayerTotal([0, 0, 0, 0]);
    setCurrentWager([0, 0, 0, 0]);
    setPlayerPoints(100);
    setCurrentHand(0);
    setPreviousHand(-1);
    setSplitCount(0);
    setPlayersHandElements([[], [], [], []]);
    setDealersHandElements([]);
    toggleHiddenElement(document.getElementById("wagerDiv"));
  };

  const initialDeal = async () => {
    await hit("player", "init");
    await hit("dealer", "init");
    await hit("player", "init");
    await hit("dealer", "init");
    updateGameButtons(playerTotals[currentHand], playersHands, currentHand, splitCount, currentWager, playerPoints);
    document.getElementById("playersHand").classList.add("activeHand");
  };

  const updateWager = (value) => {
    const newWager = [...currentWager];
    newWager[currentHand] = parseInt(value, 10);
    setCurrentWager(newWager);
  };

  const hit = async (entity = "player", origin = "user") => {
    toggleDisabledGameButtons();
    const newPlayersHands = [...playersHands];
    if (entity !== "dealer") {
      await addCard(newPlayersHands[currentHand], playersHandElements[currentHand], entity, origin, deck, setPlayersHandElements, currentHand);
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
      updateGameButtons(playerTotals[currentHand], playersHands, currentHand, splitCount, currentWager, playerPoints);
      if (newTotals[currentHand] > 21) {
        hideGameButtons();
        await endHand();
      } else if (newTotals[currentHand] === 21) {
        //autoStandOn21();
      }
      toggleDisabledGameButtons();
    }
    await delay(1150);
  };

  const endHand = async () => {
    if (currentHand === splitCount) {
      document.getElementById("playersHand").classList.remove("activeHand");
      document.getElementById("dealersHand").classList.add("activeHand");
      hideGameButtons();
      let imgPath = `./assets/cards-1.3/${dealersHand[1].image}`;
      let reactImgElement = <img key={dealersHandElements.key} src={imgPath} alt={dealersHand[1].image} />;
      await delay(500);
      flipCard(reactImgElement, dealersHand[1], setDealersHandElements, "dealer", -1);
      if (shouldDealerHit(dealerTotal, dealersHand)) await delay(500);
      await playDealer();
      await delay(250);
      document.getElementById("dealersHand").classList.remove("activeHand");
    }
  };

  // Play the dealer's hand according to the rules
  const playDealer = async () => {
    let newDealerTotal = dealerTotal;
    while (shouldDealerHit(newDealerTotal, dealersHand)) {
      await hit("dealer", "endGame");
      newDealerTotal = await calculateTotal(dealersHand);
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
        <DealerSection dealersHandElements={dealersHandElements} />
        <PlayerSection playersHandElements={playersHandElements} playerTotals={playerTotals} />
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
          />
        </div>
        <div id="disclaimer" className="container text-center mt-3">
          <p className="small text-muted my-0 px-5">
            <strong>* Disclaimer:</strong> Points in this game have <strong>no monetary value</strong> and are for <strong>entertainment purposes only</strong>.
          </p>
        </div>
      </div>

      <SettingsModal playersHands={playersHands} currentHand={currentHand} splitCount={splitCount} currentWager={currentWager} playerPoints={playerPoints} />
      <InfoModal />
    </>
  );
}
