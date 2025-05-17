// src/gitInfo.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function getGitInfo() {
  const exec = (cmd) => {
    try {
      return execSync(cmd).toString().trim();
    } catch {
      return null;
    }
  };

  return {
    branch: exec("git rev-parse --abbrev-ref HEAD"),
    commitHash: exec("git rev-parse --short HEAD"),
  };
}

const gitInfo = getGitInfo();
const outputPath = path.join(__dirname, "generatedGitInfo.json");
fs.writeFileSync(outputPath, JSON.stringify(gitInfo, null, 2));
