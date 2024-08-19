import React from "react";

export default function TopButtons() {
  return (
    <>
      <button type="button" className="px-1 py-1 btn btn-sm btn-dark position-absolute top-0 start-0" data-bs-toggle="modal" data-bs-target="#infoModal">
        ℹ️
      </button>
      <button type="button" className="px-1 py-1 btn btn-sm btn-dark position-absolute top-0 end-0" data-bs-toggle="modal" data-bs-target="#settingsModal">
        ⚙️
      </button>
      <audio id="backgroundMusic" loop class="container text-center">
        <source src="./assets/casino-funky-background-upbeat-and-uplifting-music-intro-theme-120445.mp3" type="audio/mpeg" />
      </audio>
    </>
  );
}
