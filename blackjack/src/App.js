import React from "react";
import DealerSection from "./components/DealerSection.js";
import PlayerSection from "./components/PlayerSection.js";
import PointSection from "./components/PointSection.js";
import WagerControls from "./components/WagerControls.js";
import GameControls from "./components/GameControls.js";
import SettingsModal from "./components/SettingsModal.js";
import InfoModal from "./components/InfoModal.js";
import TopButtons from "./components/TopButtons.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "./styles.css";

function App() {
  document.documentElement.setAttribute("data-bs-theme", "dark");
  return (
    <>
      <TopButtons />
      <div id="main" className="container-fluid my-2">
        <div hidden id="resultsAlert" className="alert alert-info alert-dismissible fade show w-75 mx-auto px-0" role="alert">
          <div id="message" className="container text-center"></div>
        </div>
        <DealerSection />
        <PlayerSection />
        <PointSection />
        <div id="bottomDiv" className="container text-center">
          <WagerControls />
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
