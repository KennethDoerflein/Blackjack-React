import React, { useState, useEffect } from "react";
import appInfo from "../package.json";
import { Alert, Container } from "react-bootstrap";
import DealerSection from "./components/DealerSection.js";
import PlayerSection from "./components/PlayerSection.js";
import PointSection from "./components/PointSection.js";
import WagerControls from "./components/WagerControls.js";
import GameControls from "./components/GameControls.js";
import SettingsModal from "./components/SettingsModal.js";
import InfoModal from "./components/InfoModal.js";
import TopButtons from "./components/TopButtons.js";
import WinnerSection from "./components/WinnerSection.js";
import CardDeck from "./game_logic/CardDeck.js";

import { toggleHiddenElement, enableGameButtons, delay, disableGameButtons, hideGameButtons } from "./utils/utils.js";

import { calculateTotal, addCard, flipCard, shouldDealerHit, autoStandOn21 } from "./game_logic/gameFunctions.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

export default function App() {
  const [showInfo, setShowInfo] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const handleShowInfo = () => setShowInfo(true);
  const handleCloseInfo = () => setShowInfo(false);
  const handleShowSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);

  document.documentElement.setAttribute("data-bs-theme", "dark");
  const [deck] = useState(new CardDeck());
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

  // Start a new game by shuffling the deck and resetting the UI
  const newGame = () => {
    if (playerPoints > 0) {
      document.getElementById("newGameBtn").hidden = true;
      deck.reshuffle();
      setPlayerHand([[], [], [], []]);
      setDealersHand([]);
      setDealerTotal(0);
      setPlayerTotal([0, 0, 0, 0]);
      setCurrentWager([0, 0, 0, 0]);
      setCurrentHand(0);
      setSplitCount(0);
      setPlayersHandElements([[], [], [], []]);
      setDealersHandElements([]);
      const resultsDiv = document.getElementById("resultsAlert");
      if (!resultsDiv.hidden) toggleHiddenElement(resultsDiv);
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
    }
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
      if (newTotals[hand] > 21) {
        await delay(500);
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
      hideGameButtons();
      document.getElementById(playerHandNames[currentHand]).classList.remove("activeHand");
      document.getElementById("dealersHand").classList.add("activeHand");
      let imgPath = `./assets/cards-1.3/${dealersHand[1].image}`;
      let reactImgElement = <img key={2} src={imgPath} alt={dealersHand[1].image} />;
      await delay(500);
      flipCard(reactImgElement, dealersHand[1], setDealersHandElements, "dealer", -1);
      await playDealer();
      document.getElementById("dealersHand").classList.remove("activeHand");

      toggleHiddenElement(document.getElementById("resultsAlert"));
    } else if (currentHand !== splitCount) {
      advanceHand(currentHand + 1);
    }
  };

  // Advance to the next player hand if splits occurred
  function advanceHand(newHand) {
    if (currentHand < splitCount && splitCount > 0) {
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
    // eslint-disable-next-line
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
    await delay(500);
    await hit("player", "split", currentHand);
    await hit("player", "split", newSplitCount);

    // Calculate the new totals before updating the state
    for (let i = 0; i < newPlayersHands.length; i++) {
      newTotals[i] = await calculateTotal(newPlayersHands[i]);
    }

    setPlayerTotal(newTotals);
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
    await delay(550);
    while (shouldDealerHit(newDealerTotal, dealersHand)) {
      await hit("dealer", "endGame");
      newDealerTotal = await calculateTotal(dealersHand);
      setDealerTotal(newDealerTotal);
    }
  };

  return (
    <>
      <TopButtons showInfoModal={handleShowInfo} showSettingsModal={handleShowSettings} />
      <Container>
        <Alert className="w-75 text-center mx-auto my-1 p-1" variant="warning">
          <strong>Alpha V{appInfo.version}:</strong> This site is still under development and may contain bugs.
        </Alert>
      </Container>
      <Container fluid className="my-2" id="main">
        <WinnerSection
          playerPoints={playerPoints}
          setPlayerPoints={setPlayerPoints}
          currentWager={currentWager}
          playersHands={playersHands}
          splitCount={splitCount}
          playerTotals={playerTotals}
          dealerTotal={dealerTotal}
          setCurrentWager={setCurrentWager}
        />
        <DealerSection dealersHandElements={dealersHandElements} dealerTotal={dealerTotal} />
        <PlayerSection playersHandElements={playersHandElements} playerTotals={playerTotals} splitCount={splitCount} />
        <PointSection playerPoints={playerPoints} currentWager={currentWager[currentHand]} />
        <Container className="text-center" id="bottomDiv">
          <WagerControls
            playerPoints={playerPoints}
            setPlayerPoints={setPlayerPoints}
            currentWager={currentWager}
            updateWager={updateWager}
            currentHand={currentHand}
            initialDeal={initialDeal}
            playersHands={playersHands}
          />
          <GameControls
            hit={hit}
            newGame={newGame}
            endHand={endHand}
            updateWager={updateWager}
            playerPoints={playerPoints}
            setPlayerPoints={setPlayerPoints}
            currentWager={currentWager}
            splitHand={splitHand}
            currentHand={currentHand}
            playersHands={playersHands}
            playerTotals={playerTotals}
            splitCount={splitCount}
            dealersHandElements={dealersHandElements}
          />
        </Container>
        <Container className="text-center mt-3" id="disclaimer">
          <p className="small text-muted my-0 px-5">
            <strong>* Disclaimer:</strong> Points in this game have <strong>no monetary value</strong> and are for <strong>entertainment purposes only</strong>.
          </p>
        </Container>
      </Container>

      <SettingsModal
        playersHands={playersHands}
        currentHand={currentHand}
        splitCount={splitCount}
        currentWager={currentWager}
        playerPoints={playerPoints}
        endHand={endHand}
        playerTotals={playerTotals}
        show={showSettings}
        handleClose={handleCloseSettings}
      />
      <InfoModal newGame={newGame} show={showInfo} handleClose={handleCloseInfo} currentWager={currentWager} />
    </>
  );
}
