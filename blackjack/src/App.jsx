import React, { useState, useEffect } from "react";
import _ from "lodash";
import { Container } from "react-bootstrap";
import DealerSection from "./components/DealerSection.jsx";
import PlayerSection from "./components/PlayerSection.jsx";
import PointSection from "./components/PointSection.jsx";
import WagerControls from "./components/WagerControls.jsx";
import GameControls from "./components/GameControls.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import InfoModal from "./components/InfoModal.jsx";
import TopButtons from "./components/TopButtons.jsx";
import WinnerSection from "./components/WinnerSection.jsx";
import CardDeck from "./CardDeck.js";

import { toggleHiddenElement, enableGameButtons, delay, disableGameButtons, hideGameButtons } from "./utils/utils.js";

import { calculateTotal, shouldDealerHit, calculateAndReturnTotals } from "./utils/blackjackUtils.js";

import { addCard, flipCard, adjustCardMargins } from "./utils/uiUtils.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

export default function App() {
  const [showInfo, setShowInfo] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const handleShowInfo = () => setShowInfo(true);
  const handleCloseInfo = () => setShowInfo(false);
  const handleShowSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);
  const [resultsAlertHidden, setResultsAlertHidden] = useState(true);

  const [soft17Checked, setSoft17Checked] = useState(true);
  const [autoStandChecked, setAutoStandChecked] = useState(false);
  const [splitTypeChecked, setSplitTypeChecked] = useState(false);

  document.documentElement.setAttribute("data-bs-theme", "dark");
  const [deck, setCardDeck] = useState(null);
  const [playersHands, setPlayerHand] = useState([[]]);
  const [playersHandElements, setPlayersHandElements] = useState([[]]);
  const [dealersHand, setDealersHand] = useState([]);
  const [dealersHandElements, setDealersHandElements] = useState([]);
  const [playerPoints, setPlayerPoints] = useState(100);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [playerTotals, setPlayerTotal] = useState([0]);
  const [currentWager, setCurrentWager] = useState([0]);
  const [currentHand, setCurrentHand] = useState(0);
  const [splitCount, setSplitCount] = useState(0);
  const [playersHandNames, setPlayersHandNames] = useState(["playersHand0"]);

  // Start a new game by shuffling the deck and resetting the UI
  const newGame = () => {
    if (playerPoints > 0) {
      document.getElementById("newGameBtn").hidden = true;
      if (deck) deck.reshuffle();
      else setCardDeck(new CardDeck());
      setPlayersHandNames(["playersHand0"]);
      setPlayerHand([[]]);
      setDealersHand([]);
      setDealerTotal(0);
      setPlayerTotal([0]);
      setCurrentWager([0]);
      setSplitCount(0);
      setPlayersHandElements([[]]);
      setDealersHandElements([]);
      if (!resultsAlertHidden) setResultsAlertHidden(true);
    }
  };

  // Deal initial cards to player and dealer
  const initialDeal = async () => {
    await hit("player", "init");
    await hit("dealer", "init");
    const newTotal = await hit("player", "init");
    await hit("dealer", "init");
    if (newTotal !== 21 || !autoStandChecked) {
      document.getElementById("playersHand0").classList.add("activeHand");
      enableGameButtons();
    }
  };

  const updateWager = (value) => {
    const newWager = [...currentWager];
    newWager[currentHand] = parseInt(value, 10);
    setCurrentWager(newWager);
  };

  // Deal a card to the player or dealer
  const hit = async (entity = "player", origin = "user", hand = currentHand, newPlayersHands = [...playersHands]) => {
    disableGameButtons();

    if (entity !== "dealer") {
      await addCard(newPlayersHands[hand], playersHandElements[hand], entity, origin, deck, setPlayersHandElements, hand);
    } else {
      await addCard(dealersHand, dealersHandElements, entity, origin, deck, setDealersHandElements);
    }

    // Calculate the new totals before updating the state
    const { newTotals, newDealerTotal } = await calculateAndReturnTotals(newPlayersHands, playerTotals, dealersHand);

    setPlayerTotal(newTotals);
    setDealerTotal(newDealerTotal);
    setPlayerHand(newPlayersHands);
    if (entity !== "dealer" && origin === "user") {
      if (newTotals[hand] > 21) {
        await delay(500);
        await endHand();
      }
      enableGameButtons();
    }
    await delay(600);
    if (entity !== "dealer") {
      return newTotals[hand];
    }
  };

  // End the current hand and proceed to the next hand or end the game
  const endHand = async () => {
    if (currentHand === splitCount) {
      hideGameButtons();
      document.getElementById(playersHandNames[currentHand]).classList.remove("activeHand");
      document.getElementById("dealersHand").classList.add("activeHand");
      let imgPath = `./assets/cards-1.3/${dealersHand[1].image}`;
      let reactImgElement = <img key={2} src={imgPath} alt={dealersHand[1].image} />;
      await delay(500);
      flipCard(reactImgElement, dealersHand[1], setDealersHandElements, "dealer", -1);
      await playDealer();
      document.getElementById("dealersHand").classList.remove("activeHand");
      setResultsAlertHidden(false);
    } else if (currentHand !== splitCount) {
      advanceHand(currentHand + 1);
    }
  };

  // Advance to the next player hand if splits occurred
  function advanceHand(newHand) {
    if (currentHand < splitCount && splitCount > 0) {
      document.getElementById(playersHandNames[newHand]).classList.add("activeHand");
      document.getElementById(playersHandNames[currentHand]).classList.remove("activeHand");
      setCurrentHand(newHand);
      if (playerTotals[newHand] !== 21 || !autoStandChecked) {
        enableGameButtons();
      }
    }
  }

  // Split the player's hand into two separate hands
  const splitHand = async () => {
    disableGameButtons();
    const newSplitCount = splitCount + 1;
    const newPlayerHandNames = [...playersHandNames, `${"playersHand" + newSplitCount}`];
    setSplitCount(newSplitCount);
    setPlayersHandNames(newPlayerHandNames);
    const newPlayersHands = [...playersHands, []];
    const newPlayerHandElements = [...playersHandElements, []];
    const newCurrentWager = [...currentWager, 0];
    newCurrentWager[newSplitCount] = newCurrentWager[currentHand];

    newPlayersHands[newSplitCount].push(newPlayersHands[currentHand].pop());
    newPlayerHandElements[newSplitCount].push({ ...newPlayerHandElements[currentHand].pop(), key: "1" });

    const newPlayerTotals = [...playerTotals, 0];
    // Calculate the new totals before updating the state
    let { newTotals } = await calculateAndReturnTotals(newPlayersHands, newPlayerTotals, dealersHand);
    setPlayerTotal(newTotals);

    setPlayerHand(newPlayersHands);
    setPlayersHandElements(newPlayerHandElements);
    setCurrentWager(newCurrentWager);
    setPlayerPoints(playerPoints - newCurrentWager[newSplitCount]);
    await delay(500);
    await hit("player", "split", currentHand, newPlayersHands);
    await hit("player", "split", newSplitCount, newPlayersHands);

    // Recalculate the new totals after hitting
    ({ newTotals } = await calculateAndReturnTotals(newPlayersHands, newPlayerTotals, dealersHand));
    setPlayerTotal(newTotals);

    enableGameButtons();
  };

  // Play the dealer's hand according to the rules
  const playDealer = async () => {
    let newDealerTotal = dealerTotal;
    await delay(550);
    while (shouldDealerHit(newDealerTotal, dealersHand, soft17Checked)) {
      await hit("dealer", "endGame");
      newDealerTotal = await calculateTotal(dealersHand);
      setDealerTotal(newDealerTotal);
    }
  };

  useEffect(() => {
    const handleViewportChange = _.throttle(() => {
      requestAnimationFrame(async () => {
        if (playersHandElements[0].length > 2) {
          playersHandElements.forEach(async (hand, i) => {
            if (hand.length > 0) {
              document.getElementById(playersHandNames[i]).classList.add("viewportResize");
              adjustCardMargins(document.getElementById(playersHandNames[i]), true);
              await delay(300);
              document.getElementById(playersHandNames[i]).classList.remove("viewportResize");
            }
          });
        }
        if (dealersHandElements.length > 2) {
          document.getElementById("dealersHand").classList.add("viewportResize");
          adjustCardMargins(document.getElementById("dealersHand"), true);
          await delay(300);
          document.getElementById("dealersHand").classList.remove("viewportResize");
        }
      });
    }, 300); // Throttle by 300ms

    window.visualViewport?.addEventListener("resize", handleViewportChange);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
    };
    // eslint-disable-next-line
  }, [playersHandElements, dealersHandElements]);

  return (
    <>
      <TopButtons showInfoModal={handleShowInfo} showSettingsModal={handleShowSettings} />
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
          resultsAlertHidden={resultsAlertHidden}
          setCurrentHand={setCurrentHand}
        />
        <DealerSection dealersHandElements={dealersHandElements} dealerTotal={dealerTotal} />
        <PlayerSection playersHandElements={playersHandElements} playerTotals={playerTotals} splitCount={splitCount} playersHandNames={playersHandNames} />
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
            showInfo={showInfo}
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
            splitTypeChecked={splitTypeChecked}
            autoStandChecked={autoStandChecked}
            resultsAlertHidden={resultsAlertHidden}
          />
        </Container>
        <Container className="text-center mt-3" id="disclaimer">
          <p className="small text-muted my-0 px-5">
            <strong>* Disclaimer:</strong> Points in this game have <strong>no monetary value</strong> and are for <strong>entertainment purposes only</strong>.
          </p>
        </Container>
      </Container>

      <SettingsModal
        currentWager={currentWager}
        show={showSettings}
        handleClose={handleCloseSettings}
        soft17Checked={soft17Checked}
        setSoft17Checked={setSoft17Checked}
        autoStandChecked={autoStandChecked}
        setAutoStandChecked={setAutoStandChecked}
        splitTypeChecked={splitTypeChecked}
        setSplitTypeChecked={setSplitTypeChecked}
        endHand={endHand}
        playerTotals={playerTotals}
        currentHand={currentHand}
        dealersHandElements={dealersHandElements}
      />
      <InfoModal newGame={newGame} show={showInfo} handleClose={handleCloseInfo} currentWager={currentWager} />
    </>
  );
}
