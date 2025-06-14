"use client";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";
import CardDeck from "./CardDeck.js";
import DealerSection from "./components/DealerSection.jsx";
import GameControls from "./components/GameControls.jsx";
import InfoModal from "./components/InfoModal.jsx";
import PlayerSection from "./components/PlayerSection.jsx";
import PointSection from "./components/PointSection.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import TopButtons from "./components/TopButtons.jsx";
import WagerControls from "./components/WagerControls.jsx";
import WinnerSection from "./components/WinnerSection.jsx";

import { delay } from "./utils/utils.js";

import {
  calculateAndReturnTotals,
  calculateTotal,
  shouldDealerHit,
} from "./utils/blackjackUtils.js";

import { addCard, adjustCardMargins, flipCard } from "./utils/uiUtils.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

export default function App() {
  const [devMode, setDevMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";
    setDevMode(isDev);
    setShowInfo(!isDev);
    setPlayerPoints(isDev ? 1000000000000 : 100);
  }, []);

  const [debugView, setDebugView] = useState("game"); // "game", "ui", "settings", "hands", "system"

  const [showSettings, setShowSettings] = useState(false);
  const handleShowInfo = () => setShowInfo(true);
  const handleCloseInfo = () => setShowInfo(false);
  const handleShowSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);
  const [resultsAlertHidden, setResultsAlertHidden] = useState(true);

  const [soft17Checked, setSoft17Checked] = useState(true);
  const [splitTypeChecked, setSplitTypeChecked] = useState(false);
  const [autoStandChecked, setAutoStandChecked] = useState(false);

  const [deck, setCardDeck] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const [showButtons, setShowButtons] = useState(true);
  const [disableButtons, setDisableButtons] = useState(false);
  const [carousalInterval, setCarousalInterval] = useState(null);
  const [carouselKey, setCarouselKey] = useState(0);
  const [newGameBtnHidden, setNewGameBtnHidden] = useState(false);

  const [isBusy, setIsBusy] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", "dark");
    if (devMode) {
      setAutoStandChecked(true);
    }
  }, [devMode]);

  // Start a new game by shuffling the deck and resetting the UI
  const newGame = async () => {
    if (playerPoints > 0 && !isBusy) {
      setIsBusy(true);
      setCurrentHand(0);
      setCarousalInterval(null);
      setCarouselKey((prevKey) => prevKey + 1);
      setNewGameBtnHidden(true); // Hide new game button via state

      if (!deck) {
        // Create a new deck and wait for images to preload
        const newDeck = new CardDeck(10);
        setCardDeck(newDeck);

        // Wait until deck loading is complete asynchronously
        await new Promise((resolve) => {
          const checkIfLoaded = setInterval(() => {
            if (!newDeck.loading) {
              clearInterval(checkIfLoaded);
              resolve();
            }
          }, 200); // Check every 200ms
        });
      } else {
        deck.reshuffle();
      }

      // Proceed to reset the game state after the deck is ready
      setLoading(false);
      setPlayersHandNames(["playersHand0"]);
      setPlayerHand([[]]);
      setDealersHand([]);
      setDealerTotal(0);
      setPlayerTotal([0]);
      setCurrentWager([0]);
      setSplitCount(0);
      setPlayersHandElements([[]]);
      setDealersHandElements([]);

      // Hide the results alert if it's showing
      if (!resultsAlertHidden) setResultsAlertHidden(true);
      setIsBusy(false);
    }
  };

  // Deal initial cards to player and dealer
  const initialDeal = async () => {
    if (isBusy) return;
    setIsBusy(true);
    await hit("player", "init");
    await delay(120);
    await hit("dealer", "init");
    await delay(120);
    await hit("player", "init");
    await delay(120);
    await hit("dealer", "init");
    //setDealerTotal(calculateTotal(dealersHand));
    setIsBusy(false);
  };

  const updateWager = (value) => {
    if (isBusy) return;
    const newWager = [...currentWager];
    newWager[currentHand] = parseInt(value, 10);
    setCurrentWager(newWager);
  };

  // Deal a card to the player or dealer
  const hit = async (
    entity = "player",
    origin = "user",
    hand = currentHand,
    newPlayersHands = [...playersHands]
  ) => {
    if ((disableButtons || isBusy) && origin === "user") return;
    if (origin === "user") setIsBusy(true);
    let halfwayTotalsUpdated = false;
    let latestTotals = playerTotals;
    // Define a callback to update totals halfway through the flip
    const halfwayCallback = async () => {
      if (!halfwayTotalsUpdated) {
        halfwayTotalsUpdated = true;
        const { newTotals, newDealerTotal } = calculateAndReturnTotals(
          newPlayersHands,
          playerTotals,
          dealersHand
        );
        setPlayerTotal(newTotals);
        setDealerTotal(newDealerTotal);
        setPlayerHand(newPlayersHands);
        latestTotals = newTotals;
        return { newTotals, newDealerTotal };
      }
    };

    if (entity !== "dealer") {
      await addCard(
        newPlayersHands[hand],
        playersHandElements[hand],
        entity,
        origin,
        deck,
        setPlayersHandElements,
        hand,
        halfwayCallback
      );
    } else {
      await addCard(
        dealersHand,
        dealersHandElements,
        entity,
        origin,
        deck,
        setDealersHandElements,
        undefined,
        halfwayCallback
      );
    }

    if (entity !== "dealer" && origin === "user") {
      // Wait for totals to update before checking for bust or auto-stand

      // Use latestTotals instead of playerTotals
      if (latestTotals[hand] > 21) {
        await delay(250); // was 500
        await endHand();
      }
    }
    // Animation delay only for pacing, not for state update
    //await delay(320); // was 600
    if (entity !== "dealer" && origin === "user") setIsBusy(false);
    if (entity !== "dealer") {
      return latestTotals[hand];
    }

    const { newTotals, newDealerTotal } = calculateAndReturnTotals(
      newPlayersHands,
      playerTotals,
      dealersHand
    );
    setPlayerTotal(newTotals);
    setDealerTotal(newDealerTotal);
    setPlayerHand(newPlayersHands);
  };

  // End the current hand and proceed to the next hand or end the game
  const endHand = async () => {
    setIsBusy(true);
    console.log("endHand");
    if (currentHand === splitCount) {
      let imgPath = `./assets/cards-1.3/${dealersHand[1].image}`;
      let reactImgElement = <img key={2} src={imgPath} alt={dealersHand[1].image} />;
      // Reduce the delay before flipping the dealer's card for a snappier feel
      await delay(220); // was 200
      await flipCard(reactImgElement, dealersHand[1], setDealersHandElements, "dealer", -1);
      await delay(250); // was 400
      await playDealer();
      setResultsAlertHidden(false);
      setCarousalInterval(1750); // was 1750
      setIsBusy(false);
    } else if (currentHand !== splitCount) {
      let newHand = currentHand + 1;
      await advanceHand(newHand);
      setIsBusy(false);
    }
  };

  // Advance to the next player hand if splits occurred
  async function advanceHand(newHand) {
    setIsBusy(true);
    if (currentHand < splitCount && splitCount > 0) {
      setCurrentHand(newHand);
      await delay(350);
    }
    setIsBusy(false);
  }

  // Split the player's hand into two separate hands
  const splitHand = async () => {
    if (isBusy) return;
    setIsBusy(true);
    const oldHand = currentHand;
    const newSplitCount = splitCount + 1;
    const newPlayerHandNames = [...playersHandNames, `${"playersHand" + newSplitCount}`];
    setSplitCount(newSplitCount);
    setPlayersHandNames(newPlayerHandNames);
    const newPlayersHands = [...playersHands, []];
    const newPlayerHandElements = [...playersHandElements, []];
    const newCurrentWager = [...currentWager, 0];
    newCurrentWager[newSplitCount] = newCurrentWager[currentHand];

    newPlayersHands[newSplitCount].push(newPlayersHands[currentHand].pop());
    newPlayerHandElements[newSplitCount].push({
      ...newPlayerHandElements[currentHand].pop(),
      key: "1",
    });

    const newPlayerTotals = [...playerTotals, 0];
    // Calculate the new totals before updating the state
    let { newTotals } = calculateAndReturnTotals(newPlayersHands, newPlayerTotals, dealersHand);
    setPlayerTotal(newTotals);

    setPlayerHand(newPlayersHands);
    setPlayersHandElements(newPlayerHandElements);
    setCurrentWager(newCurrentWager);
    setPlayerPoints(playerPoints - newCurrentWager[newSplitCount]);
    await delay(500); // was 500
    await hit("player", "split", currentHand, newPlayersHands);
    setCurrentHand(newSplitCount);
    await delay(1200); // was 1200
    await hit("player", "split", newSplitCount, newPlayersHands);
    await delay(500); // was 500
    setCurrentHand(oldHand);

    // Recalculate the new totals after hitting
    ({ newTotals } = calculateAndReturnTotals(newPlayersHands, newPlayerTotals, dealersHand));
    setPlayerTotal(newTotals);
    await delay(950); // was 750
    if (newTotals[oldHand] === 21 && autoStandChecked) {
      await endHand();
    } else {
      setIsBusy(false);
    }
  };

  // Play the dealer's hand according to the rules
  const playDealer = async () => {
    setIsBusy(true);
    await delay(220); // was 500
    let newDealerTotal = dealerTotal;
    while (shouldDealerHit(newDealerTotal, dealersHand, soft17Checked)) {
      await hit("dealer", "endGame");
      newDealerTotal = calculateTotal(dealersHand);
      setDealerTotal(newDealerTotal);
      await delay(220); // was 400
    }
    setIsBusy(false);
  };

  useEffect(() => {
    const handleViewportChange = _.throttle(() => {
      requestAnimationFrame(async () => {
        if (playersHandElements[0].length > 2) {
          playersHandElements.forEach(async (hand, i) => {
            if (hand.length > 0) {
              document.getElementById(playersHandNames[i]).classList.add("viewportResize");
              adjustCardMargins(document.getElementById(playersHandNames[i]), true);
              await delay(120); // was 300
              document.getElementById(playersHandNames[i]).classList.remove("viewportResize");
            }
          });
        }
        if (dealersHandElements.length > 2) {
          document.getElementById("dealersHand").classList.add("viewportResize");
          adjustCardMargins(document.getElementById("dealersHand"), true);
          await delay(120); // was 300
          document.getElementById("dealersHand").classList.remove("viewportResize");
        }
      });
    }, 180); // was 300ms throttle

    window.visualViewport?.addEventListener("resize", handleViewportChange);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
    };
    // eslint-disable-next-line
  }, [playersHandElements, dealersHandElements]);

  useEffect(() => {
    async function fetchData() {
      const isSplitting = splitCount > 0 && playersHands.some((hand) => hand.length < 2);
      if (
        !isBusy &&
        autoStandChecked &&
        playerTotals[currentHand] === 21 &&
        carousalInterval === null
      ) {
        setShowButtons(false);
        await delay(750);
        await endHand(); // dealers card flips before the final player hand ends
      } else if (!isBusy) {
        setShowButtons(true);
        setDisableButtons(false);
      } else if (isBusy) {
        if (playerTotals[currentHand] > 21 || dealersHandElements.length < 2 || isSplitting) {
          setShowButtons(false);
        } else {
          setDisableButtons(true);
        }
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, [currentHand, splitCount, isBusy, autoStandChecked, playerTotals, carousalInterval]);

  return (
    <>
      <TopButtons
        showInfoModal={handleShowInfo}
        showSettingsModal={handleShowSettings}
        ref={audioRef}
      />
      <Container fluid className="my-2" id="main">
        <DealerSection dealersHandElements={dealersHandElements} dealerTotal={dealerTotal} />
        <PlayerSection
          playersHandElements={playersHandElements}
          playerTotals={playerTotals}
          splitCount={splitCount}
          playersHandNames={playersHandNames}
          currentHand={currentHand}
          carousalInterval={carousalInterval}
          setCurrentHand={setCurrentHand}
          key={carouselKey}
        />
        <PointSection
          playerPoints={playerPoints}
          currentWager={currentWager[currentHand]}
          currentHand={currentHand}
        />
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
            loading={loading}
            isBusy={isBusy}
          />
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
            currentHand={currentHand}
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
            showButtons={showButtons}
            disableButtons={disableButtons}
            newGameBtnHidden={newGameBtnHidden}
            setNewGameBtnHidden={setNewGameBtnHidden}
            isBusy={isBusy}
            devMode={devMode}
            setIsBusy={setIsBusy}
          />
        </Container>
        <Container className="text-center mt-3" id="disclaimer">
          <p className="small text-muted my-0 px-5">
            <strong>* Disclaimer:</strong> Points in this game have{" "}
            <strong>no monetary value</strong> and are for{" "}
            <strong>entertainment purposes only</strong>.
          </p>
        </Container>
        {devMode && (
          <div className="text-center text-warning">
            <p>
              <strong>Developer Mode Enabled</strong>
            </p>
          </div>
        )}
        {devMode && (
          <div className="debug-controls mb-2">
            <label htmlFor="debug-select" className="me-2 text-light">
              Debug View:
            </label>
            <select
              id="debug-select"
              value={debugView}
              onChange={(e) => setDebugView(e.target.value)}
              className="form-select form-select-sm w-auto d-inline-block">
              <option value="game">Game</option>
              <option value="hands">Hands</option>
              <option value="settings">Settings</option>
              <option value="ui">UI State</option>
              <option value="system">System</option>
            </select>
          </div>
        )}

        {devMode && (
          <pre className="debug-panel bg-dark text-light p-2 rounded">
            {JSON.stringify(
              debugView === "game"
                ? {
                    playerPoints,
                    currentWager,
                    playerTotals,
                    dealerTotal,
                    currentHand,
                    splitCount,
                  }
                : debugView === "hands"
                ? {
                    playersHands,
                    playersHandElements,
                    dealersHand,
                    dealersHandElements,
                    playersHandNames,
                  }
                : debugView === "settings"
                ? {
                    soft17Checked,
                    splitTypeChecked,
                    autoStandChecked,
                  }
                : debugView === "ui"
                ? {
                    showInfo,
                    showSettings,
                    showButtons,
                    resultsAlertHidden,
                    newGameBtnHidden,
                    carousalInterval,
                    carouselKey,
                  }
                : {
                    isBusy,
                    // deck,
                    // audioRef: audioRef?.current ? "ready" : "null",
                  },
              null,
              2
            )}
          </pre>
        )}
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
        splitCount={splitCount}
        advanceHand={advanceHand}
        dealersHandElements={dealersHandElements}
        audioRef={audioRef}
      />
      <InfoModal
        newGame={newGame}
        show={showInfo}
        handleClose={handleCloseInfo}
        currentWager={currentWager}
      />
    </>
  );
}
