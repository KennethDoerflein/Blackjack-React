import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getGitInfo() {
  const exec = (cmd) => {
    try {
      return execSync(cmd).toString().trim();
    } catch {
      return null;
    }
  };

  let branch = exec("git rev-parse --abbrev-ref HEAD");
  if (branch === "HEAD") {
    // Try to get branch name from GitHub Actions environment variables
    branch =
      process.env.GITHUB_HEAD_REF ||
      (process.env.GITHUB_REF
        ? process.env.GITHUB_REF.replace(/^refs\/(heads|pull)\//, "")
        : null) ||
      "HEAD";
  }

  return {
    branch,
    commitHash: exec("git rev-parse --short HEAD"),
  };
}

const gitInfo = getGitInfo();
const outputPath = join(__dirname, "generatedGitInfo.json");
writeFileSync(outputPath, JSON.stringify(gitInfo, null, 2));
