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
import MessageSection from "./components/MessageSection.jsx";

import { addCard, adjustCardMargins, flipCard, preloadDeckImages } from "./utils/uiUtils.js";
import { pausableDelay } from "./utils/utils.js";
import {
  CARD_FLIP_TIME,
  CARD_PULSE_TIME,
  CARD_SLIDE_TIME,
  BLACKJACK_PAUSE_TIME,
  UI_TRANSITION_DELAY,
  DEALER_DECISION_PAUSE,
} from "./utils/constants.js";

import {
  calculateAndReturnTotals,
  calculateTotal,
  shouldDealerHit,
} from "./utils/blackjackUtils.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

export default function App() {
  const [devMode, setDevMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";
    setDevMode(isDev);
    setShowInfo(!isDev);
    setPlayerPoints(isDev ? 100000 : 100);
    newGame();
  }, []);

  const [debugView, setDebugView] = useState("ui"); // "game", "ui", "settings", "hands", "system"

  const [showSettings, setShowSettings] = useState(false);
  const handleShowInfo = () => setShowInfo(true);
  const handleCloseInfo = () => setShowInfo(false);
  const handleShowSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);
  const [resultsHidden, setResultsHidden] = useState(true);

  const [soft17Checked, setSoft17Checked] = useState(true);
  const [splitTypeChecked, setSplitTypeChecked] = useState(true);

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

  const [globalMessage, setGlobalMessage] = useState("");

  const audioRef = useRef(null);

  const cardIdCounter = useRef(0);

  const [isTabVisible, setIsTabVisible] = useState(true);
  const visibilityPromiseResolver = useRef(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabVisible(false);
      } else {
        setIsTabVisible(true);
        // If there's a pending promise, resolve it
        if (visibilityPromiseResolver.current) {
          visibilityPromiseResolver.current();
          visibilityPromiseResolver.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", "dark");
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
        const newDeck = new CardDeck(10);
        setCardDeck(newDeck);
        await preloadDeckImages(newDeck);
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
      if (!resultsHidden) setResultsHidden(true);
      setIsBusy(false);
    }
  };

  // Deal initial cards
  const initialDeal = async () => {
    if (isBusy) return;
    setGlobalMessage("Dealing initial cards...");
    setIsBusy(true);

    await hit("player", "init");
    await pausableDelay(UI_TRANSITION_DELAY, isTabVisible, visibilityPromiseResolver);

    await hit("dealer", "init");
    await pausableDelay(UI_TRANSITION_DELAY, isTabVisible, visibilityPromiseResolver);

    await hit("player", "init");
    await pausableDelay(UI_TRANSITION_DELAY, isTabVisible, visibilityPromiseResolver);

    await hit("dealer", "init");
    setIsBusy(false);
    setGlobalMessage("Player's turn");
  };

  const updateWager = (value) => {
    if (!resultsHidden) return true; // Prevent actions after round over
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
    if (!resultsHidden) return true; // Prevent actions after round over
    if ((disableButtons || isBusy) && origin === "user") return;
    if (origin === "user") setIsBusy(true);
    cardIdCounter.current += 1; // Increment the counter
    const uniqueCardId = cardIdCounter.current; // Get the new ID
    let halfwayTotalsUpdated = false;
    let latestTotals = playerTotals;
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

    const isPlayer = entity !== "dealer";
    const targetHand = isPlayer ? newPlayersHands[hand] : dealersHand;
    const targetHandElements = isPlayer ? playersHandElements[hand] : dealersHandElements;
    const setTargetHandElements = isPlayer ? setPlayersHandElements : setDealersHandElements;
    const handIndex = isPlayer ? hand : undefined;

    await addCard(
      targetHand,
      targetHandElements,
      entity,
      origin,
      deck,
      setTargetHandElements,
      handIndex,
      halfwayCallback,
      isTabVisible,
      visibilityPromiseResolver,
      uniqueCardId
    );
    if (!resultsHidden) return true; // Prevent actions after round over

    if (isPlayer && origin === "user") {
      if (latestTotals[hand] > 21) {
        await pausableDelay(CARD_PULSE_TIME, isTabVisible, visibilityPromiseResolver);
        await endHand();
      }
      setIsBusy(false);
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

  // End hand
  const endHand = async () => {
    if (!resultsHidden) return true; // Prevent actions after round over
    setIsBusy(true);
    if (currentHand === splitCount) {
      setGlobalMessage("Dealer's turn");

      const holeDescriptor = dealersHandElements[1];
      if (holeDescriptor) {
        await pausableDelay(CARD_FLIP_TIME, isTabVisible, visibilityPromiseResolver);
        await flipCard(
          holeDescriptor.id, // use descriptor id
          dealersHand[1], // card object (deck card)
          setDealersHandElements, // state setter
          "dealer",
          -1,
          null, // no halfway callback here
          isTabVisible,
          visibilityPromiseResolver
        );
      }
      if (!shouldDealerHit(dealerTotal, dealersHand, soft17Checked)) {
        await pausableDelay(CARD_FLIP_TIME * 0.5, isTabVisible, visibilityPromiseResolver);
      }
      await playDealer();
      setResultsHidden(false);
      setGlobalMessage("");
      setCarousalInterval(BLACKJACK_PAUSE_TIME);
      setIsBusy(false);
    } else if (currentHand !== splitCount) {
      let newHand = currentHand + 1;
      await advanceHand(newHand);
      setIsBusy(false);
    }
  };

  async function advanceHand(newHand) {
    if (!resultsHidden) return true; // Prevent actions after round over
    setIsBusy(true);
    if (currentHand < splitCount && splitCount > 0) {
      await pausableDelay(CARD_SLIDE_TIME, isTabVisible, visibilityPromiseResolver);
      setCurrentHand(newHand);
      await pausableDelay(CARD_SLIDE_TIME, isTabVisible, visibilityPromiseResolver);
    }
    setIsBusy(false);
  }

  const splitHand = async () => {
    if (!resultsHidden) return true; // Prevent actions after round over
    if (isBusy) return;
    setGlobalMessage("Splitting hand...");
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
    let { newTotals } = calculateAndReturnTotals(newPlayersHands, newPlayerTotals, dealersHand);
    setPlayerTotal(newTotals);

    setPlayerHand(newPlayersHands);
    setPlayersHandElements(newPlayerHandElements);
    setCurrentWager(newCurrentWager);
    setPlayerPoints(playerPoints - newCurrentWager[newSplitCount]);

    // Wait for the card to visually move to the new hand's position.
    const CARD_SPLIT_DELAY = CARD_SLIDE_TIME + CARD_FLIP_TIME;
    await pausableDelay(CARD_SLIDE_TIME * 1.25, isTabVisible, visibilityPromiseResolver);

    // Deal the second card to the first hand and wait for it to land.
    await hit("player", "split", currentHand, newPlayersHands);
    await pausableDelay(CARD_FLIP_TIME, isTabVisible, visibilityPromiseResolver);
    // Switch focus to the second hand, deal a card, and wait for it to land.
    setCurrentHand(newSplitCount);
    await pausableDelay(CARD_SPLIT_DELAY, isTabVisible, visibilityPromiseResolver);
    await hit("player", "split", newSplitCount, newPlayersHands);
    await pausableDelay(CARD_SPLIT_DELAY, isTabVisible, visibilityPromiseResolver);

    // Switch focus back to the original hand to continue play.
    setCurrentHand(oldHand);

    ({ newTotals } = calculateAndReturnTotals(newPlayersHands, newPlayerTotals, dealersHand));
    setPlayerTotal(newTotals);
    await pausableDelay(CARD_SPLIT_DELAY, isTabVisible, visibilityPromiseResolver);

    setGlobalMessage("Player's turn");
    setIsBusy(false);
  };

  const playDealer = async () => {
    if (!resultsHidden) return true; // Prevent actions after round over
    setIsBusy(true);
    await pausableDelay(DEALER_DECISION_PAUSE, isTabVisible, visibilityPromiseResolver);
    let newDealerTotal = dealerTotal;
    while (shouldDealerHit(newDealerTotal, dealersHand, soft17Checked)) {
      await hit("dealer", "endGame");
      newDealerTotal = calculateTotal(dealersHand);
      setDealerTotal(newDealerTotal);
      await pausableDelay(CARD_SLIDE_TIME, isTabVisible, visibilityPromiseResolver);
    }
    setIsBusy(false);
  };

  useEffect(() => {
    const handleViewportChange = _.throttle(() => {
      requestAnimationFrame(async () => {
        if (playersHandElements[0].length > 2) {
          playersHandElements.forEach(async (hand, i) => {
            if (hand.length > 0) {
              document.getElementById(`playersHand${i}`).classList.add("viewportResize");
              adjustCardMargins(document.getElementById(`playersHand${i}`), true);
              await pausableDelay(CARD_SLIDE_TIME, isTabVisible, visibilityPromiseResolver);
              document.getElementById(`playersHand${i}`).classList.remove("viewportResize");
            }
          });
        }
        if (dealersHandElements.length > 2) {
          document.getElementById("dealersHand").classList.add("viewportResize");
          adjustCardMargins(document.getElementById("dealersHand"), true);
          await pausableDelay(CARD_SLIDE_TIME, isTabVisible, visibilityPromiseResolver);
          document.getElementById("dealersHand").classList.remove("viewportResize");
        }
      });
    }, CARD_SLIDE_TIME);

    window.visualViewport?.addEventListener("resize", handleViewportChange);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
    };
  }, [playersHandElements, dealersHandElements, playersHandNames]);

  useEffect(() => {
    const handleButtonVisibility = async () => {
      const isSplitting = splitCount > 0 && playersHands.some((hand) => hand.length < 2);

      if (isBusy) {
        const shouldHideButtons =
          playerTotals[currentHand] > 21 || dealersHandElements.length < 2 || isSplitting;
        setShowButtons(!shouldHideButtons);
        setDisableButtons(true);
      } else {
        setShowButtons(true);
        setDisableButtons(false);
      }
    };

    handleButtonVisibility();
    // eslint-disable-next-line
  }, [currentHand, splitCount, isBusy, playerTotals, carousalInterval]);

  const debugDataMap = {
    game: {
      playerPoints,
      currentWager,
      playerTotals,
      dealerTotal,
      currentHand,
      splitCount,
    },
    hands: {
      playersHands,
      playersHandElements,
      dealersHand,
      dealersHandElements,
      playersHandNames,
    },
    settings: {
      soft17Checked,
      splitTypeChecked,
    },
    ui: {
      showInfo,
      showSettings,
      showButtons,
      resultsHidden,
      newGameBtnHidden,
      carousalInterval,
      carouselKey,
    },
    system: {
      isBusy,
      // deck,
      // audioRef: audioRef?.current ? "ready" : "null",
    },
  };

  return (
    <>
      <Container fluid className="my-2" id="main">
        <TopButtons
          showInfoModal={handleShowInfo}
          showSettingsModal={handleShowSettings}
          ref={audioRef}
        />
        <DealerSection dealersHandElements={dealersHandElements} dealerTotal={dealerTotal} />
        <MessageSection
          playerPoints={playerPoints}
          setPlayerPoints={setPlayerPoints}
          currentWager={currentWager}
          playersHands={playersHands}
          splitCount={splitCount}
          playerTotals={playerTotals}
          dealerTotal={dealerTotal}
          setCurrentWager={setCurrentWager}
          resultsHidden={resultsHidden}
          currentHand={currentHand}
          isBusy={isBusy}
          globalMessage={globalMessage}
          setGlobalMessage={setGlobalMessage}
        />
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
          splitCount={splitCount}
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
            resultsHidden={resultsHidden}
            showButtons={showButtons}
            disableButtons={disableButtons}
            newGameBtnHidden={newGameBtnHidden}
            setNewGameBtnHidden={setNewGameBtnHidden}
            isBusy={isBusy}
            devMode={devMode}
            setIsBusy={setIsBusy}
            showInfo={showInfo}
          />
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
            {JSON.stringify(debugDataMap[debugView] || {}, null, 2)}
          </pre>
        )}
      </Container>

      <Container className="text-center mt-4" id="disclaimer">
        <p className="small text-muted my-0 px-5">
          <strong>* Disclaimer:</strong> Points in this game have <strong>no monetary value</strong>{" "}
          and are for <strong>entertainment purposes only</strong>.
        </p>
      </Container>

      <SettingsModal
        currentWager={currentWager}
        show={showSettings}
        handleClose={handleCloseSettings}
        soft17Checked={soft17Checked}
        setSoft17Checked={setSoft17Checked}
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
