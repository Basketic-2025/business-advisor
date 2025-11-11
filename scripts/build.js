import { cpSync, mkdirSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dist = join(root, "dist");

function copyDir(src, dest) {
  cpSync(src, dest, { recursive: true });
}

try {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  copyDir(join(root, "web"), join(dist, "web"));
  copyDir(join(root, "public"), join(dist, "public"));
  cpSync(join(root, "service-worker.js"), join(dist, "service-worker.js"));
  console.log("Build complete.");
} catch (err) {
  console.error("Build failed:", err);
  process.exit(1);
}
