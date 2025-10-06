"use client";

import React, { useEffect, useState } from "react";
import { Button, Container, Form, Modal } from "react-bootstrap";
import appInfo from "../../../package.json";
import gitInfo from "../../generatedGitInfo.json";

const THEMES = [
  { id: "classic", label: "Classic" },
  { id: "neon", label: "Liquid Glass" },
  { id: "ocean", label: "Ocean" },
  { id: "retro", label: "Retro" },
  { id: "forest", label: "Forest" },
];

export default function SettingsModal({
  currentWager,
  show,
  handleClose,
  soft17Checked,
  setSoft17Checked,
  splitTypeChecked,
  setSplitTypeChecked,
  dealersHandElements,
  audioRef,
}) {
  const toggleMusic = () => {
    if (audioRef && audioRef.current) {
      audioRef.current.paused ? audioRef.current.play() : audioRef.current.pause();
    }
  };

  const [theme, setTheme] = useState("classic");

  useEffect(() => {
    // initialize from localStorage or document attribute
    try {
      const stored = localStorage.getItem("bj_theme");
      const docTheme = document.documentElement.getAttribute("data-theme");
      const initial = stored || docTheme || "classic";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch (e) {
      // ignore (SSR safe)
    }
  }, []);

  const pickTheme = (id) => {
    try {
      localStorage.setItem("bj_theme", id);
      document.documentElement.setAttribute("data-theme", id);
    } catch (e) {}
    setTheme(id);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-3 text-muted text-decoration-underline">
          <small>Some Switches Will Be Disabled During a Game</small>
        </div>
        <Form>
          <Form.Check type="switch" id="musicSwitch" label="Music" onClick={toggleMusic} />
          <Form.Check
            type="switch"
            id="soft17Switch"
            label="Dealer Hits on Soft 17"
            disabled={dealersHandElements.length > 0 || currentWager[0] > 0}
            checked={soft17Checked}
            onChange={() => setSoft17Checked(!soft17Checked)}
          />
          <Form.Check
            type="switch"
            id="splitSwitch"
            label="Consider Rank For Split"
            disabled={dealersHandElements.length > 0 || currentWager[0] > 0}
            checked={splitTypeChecked}
            onChange={() => setSplitTypeChecked(!splitTypeChecked)}
          />
        </Form>

        <div className="mt-3">
          <div className="text-center mb-2">Theme</div>
          <div className="theme-swatch-container" role="list">
            {THEMES.map((t) => (
              <div key={t.id} role="listitem" className="theme-swatch-wrap">
                <div
                  title={t.label}
                  onClick={() => pickTheme(t.id)}
                  className={`theme-swatch theme-swatch--${t.id} ${
                    theme === t.id ? "selected" : ""
                  }`}
                  aria-label={t.label}
                />
                <div className="theme-swatch-label">{t.label.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="warning" onClick={handleClose} className="mx-auto fw-bolder">
          Close
        </Button>
      </Modal.Footer>
      <Container className="text-center pb-2">
        App Version: {appInfo.version} <p className="mb-0">Branch: {gitInfo.branch || "N/A"}</p>
        <p>Commit: {gitInfo.commitHash || "N/A"}</p>
      </Container>
    </Modal>
  );
}
