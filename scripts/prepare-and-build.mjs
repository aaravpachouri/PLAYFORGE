import { cpSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";

// Temporary bridge to the source archive supplied for PLAYFORGE 2.8.0.
// Build dependencies are installed inside the app folder so Vercel and Render
// build the same React/Vite app from the same archive.
const archiveUrl = "https://d2ol7oe51mr4n9.cloudfront.net/user_3KbtDnScA2O9o4QSX5YkGtatbM6/0f0be671-a1b1-4336-b40c-fc7914daea2d.zip";
const archivePath = "/tmp/playforge-2.8-source.zip";

execFileSync("curl", ["-fL", "--retry", "3", archiveUrl, "-o", archivePath], { stdio: "inherit" });
rmSync("app-src", { recursive: true, force: true });
mkdirSync("app-src", { recursive: true });
execFileSync("unzip", ["-oq", archivePath, "-d", "app-src"], { stdio: "inherit" });
execFileSync("npm", ["install", "--include=dev", "--no-audit", "--no-fund"], { cwd: "app-src", stdio: "inherit" });
execFileSync("npm", ["run", "build"], { cwd: "app-src", stdio: "inherit" });
rmSync("dist", { recursive: true, force: true });
cpSync("app-src/dist", "dist", { recursive: true });
console.log("PLAYFORGE Vite build copied to ./dist");
