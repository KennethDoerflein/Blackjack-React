// src/gitInfo.js
import { writeFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

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
const outputPath = join(__dirname, "generatedGitInfo.json");
writeFileSync(outputPath, JSON.stringify(gitInfo, null, 2));
