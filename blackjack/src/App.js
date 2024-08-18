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

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./styles.css";

function App() {
  document.documentElement.setAttribute("data-bs-theme", "dark");
  const [deck, setDeck] = useState(new CardDeck());
  const [playerHands, setPlayerHand] = useState([], [], [], []);
  const [playerHandElements, setPlayerHandElements] = useState([], [], [], []);
  const [dealerHand, setDealerHand] = useState([]);
  const [dealerHandElements, setDealerHandElements] = useState([]);
  const [playerPoints, setPlayerPoints] = useState(100);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [playerTotals, setPlayerTotal] = useState([0, 0, 0, 0]);
  const [currentWager, setCurrentWager] = useState([0, 0, 0, 0]);
  const [currentHand, setCurrentHand] = useState(0);
  const [previousHand, setPreviousHand] = useState(0);
  const [splitCount, setSplitCount] = useState(0);

  const startGame = () => {
    setDeck(new CardDeck());
    setPlayerHand([], [], [], []);
    setDealerHand([]);
    setDealerTotal(0);
    setPlayerTotal([0, 0, 0, 0]);
    setCurrentWager([0, 0, 0, 0]);
    setPlayerPoints(100);
    setCurrentHand(0);
    setPreviousHand(-1);
    setSplitCount(0);
  };

  const updateWager = (value) => {
    setCurrentWager((prevWager) => {
      const newWager = [...prevWager];
      newWager[currentHand] = parseInt(value, 10);
      return newWager;
    });
  };

  return (
    <>
      <TopButtons />
      <div id="main" className="container-fluid my-2">
        <div hidden id="resultsAlert" className="alert alert-info alert-dismissible fade show w-75 mx-auto px-0" role="alert">
          <div id="message" className="container text-center"></div>
        </div>
        <DealerSection dealerHandElements={dealerHandElements} />
        <PlayerSection playerHandElements={playerHandElements} />
        <PointSection playerPoints={playerPoints} currentWager={currentWager[currentHand]} />
        <div id="bottomDiv" className="container text-center">
          <WagerControls playerPoints={playerPoints} setPlayerPoints={setPlayerPoints} currentWager={currentWager} updateWager={updateWager} currentHand={currentHand} />
          <GameControls />
        </div>
      </div>

      <div id="disclaimer" className="container text-center mt-3">
        <p className="small text-muted my-0 px-5">
          <strong>* Disclaimer:</strong> Points in this game have <strong>no monetary value</strong> and are for <strong>entertainment purposes only</strong>.
        </p>
      </div>
      <SettingsModal />
      <InfoModal />
    </>
  );
}

export default App;
