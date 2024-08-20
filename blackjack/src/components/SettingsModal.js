import React from "react";
import { checkSplitButton } from "../utils/utils.js";

export default function SettingsModal({ playerHands, currentHand, splitCount, currentWager, playerPoints }) {
  function toggleMusic() {
    const musicSwitch = document.getElementById("musicSwitch");
    const backgroundMusic = document.getElementById("backgroundMusic");
    if (musicSwitch.checked) {
      backgroundMusic.play();
    } else {
      backgroundMusic.pause();
    }
  }

  return (
    <>
      <div className="modal fade" id="settingsModal" tabIndex="-1" aria-labelledby="settingsModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="settingsModalLabel">
                Settings
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="text-center mb-3 text-muted text-decoration-underline">
                <small>Some Switches Will Be Disabled During a Game</small>
              </div>
              <div className="form-check form-switch">
                <input onClick={toggleMusic} className="form-check-input" type="checkbox" role="switch" id="musicSwitch" />
                <label className="form-check-label" htmlFor="musicSwitch">
                  Music
                </label>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id="standSwitch" />
                <label className="form-check-label" htmlFor="standSwitch">
                  Automatically Stand When You Get 21
                </label>
              </div>
              <div className="form-check form-switch">
                <input defaultChecked className="form-check-input" type="checkbox" role="switch" id="soft17Switch" />
                <label className="form-check-label" htmlFor="soft17Switch">
                  Dealer Hits on Soft 17
                </label>
              </div>
              <div className="form-check form-switch">
                <input
                  onClick={() => checkSplitButton(playerHands, currentHand, splitCount, currentWager, playerPoints)}
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="splitSwitch"
                />

                <label className="form-check-label" htmlFor="splitSwitch">
                  Split Based on Suit
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="mx-auto btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
