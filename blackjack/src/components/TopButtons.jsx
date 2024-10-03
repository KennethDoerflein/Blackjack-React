import React from "react";
import { Button } from "react-bootstrap";

export default function TopButtons({ showInfoModal, showSettingsModal }) {
  return (
    <>
      <Button
        variant="dark"
        size="sm"
        className="px-1 py-1 position-absolute top-0 start-0"
        onClick={showInfoModal}>
        ℹ️
      </Button>
      <Button
        variant="dark"
        size="sm"
        className="px-1 py-1 position-absolute top-0 end-0"
        onClick={showSettingsModal}>
        ⚙️
      </Button>
      <audio id="backgroundMusic" loop className="container text-center">
        <source
          src="./assets/casino-funky-background-upbeat-and-uplifting-music-intro-theme-120445.mp3"
          type="audio/mpeg"
        />
      </audio>
    </>
  );
}
