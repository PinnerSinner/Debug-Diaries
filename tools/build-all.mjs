import { readdirSync, statSync, cpSync, readFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const root = process.cwd();
const activitiesDir = join(root, "activities");
const outDir = join(root, "public", "activities");

for (const name of readdirSync(activitiesDir)) {
  const dir = join(activitiesDir, name);
  if (!statSync(dir).isDirectory()) continue;

  const metaPath = join(dir, "meta.json");
  if (!statSync(metaPath, { throwIfNoEntry: false })) continue;

  const meta = JSON.parse(readFileSync(metaPath, "utf8"));
  const dest = join(outDir, meta.slug);
  console.log(`Building ${meta.title} -> ${dest}`);

  if (meta.type === "vite-app" || statSync(join(dir, "package.json"), { throwIfNoEntry: false })) {
    try {
      execSync("npm ci", { cwd: dir, stdio: "inherit" });
    } catch {
      execSync("npm install", { cwd: dir, stdio: "inherit" });
    }
    try {
      execSync("npm run build", { cwd: dir, stdio: "inherit" });
      cpSync(join(dir, "dist"), dest, { recursive: true });
    } catch {
      const pub = join(dir, "public");
      if (statSync(pub, { throwIfNoEntry: false })) cpSync(pub, dest, { recursive: true });
    }
  } else {
    cpSync(dir, dest, { recursive: true });
  }
}
