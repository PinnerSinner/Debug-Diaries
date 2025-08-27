import { readdirSync, statSync, cpSync, readFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const root = process.cwd();
const activitiesDir = join(root, "activities");
const outDir = join(root, "public", "activities");

// Turn a slug like "passenger-counter-app" into "Passenger Counter App".
function humaniseSlug(slug) {
  return slug
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Walk the activities folder recursively and process only leaf directories.
function traverse(dir, rel = "") {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const newRel = rel ? join(rel, name) : name;
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      // If there are no nested directories, this is a leaf directory representing an activity.
      const children = readdirSync(abs).filter(c => statSync(join(abs, c)).isDirectory());
      if (children.length === 0) {
        processActivity(abs, newRel);
      } else {
        // Otherwise, keep walking deeper.
        traverse(abs, newRel);
      }
    }
  }
}

// Build or copy an individual activity.
function processActivity(dir, relPath) {
  const metaPath = join(dir, "meta.json");
  let meta;
  if (existsSync(metaPath)) {
    try {
      meta = JSON.parse(readFileSync(metaPath, "utf8"));
    } catch {
      meta = null;
    }
  }
  // If there is no meta.json, derive some reasonable defaults.
  if (!meta) {
    const parts = relPath.split(/[/\\]/);
    const slug = parts.join("-");
    const title = humaniseSlug(parts[parts.length - 1]);
    const series = parts.length > 1 ? humaniseSlug(parts[0]) : null;
    meta = {
      title,
      slug,
      series,
      type: existsSync(join(dir, "package.json")) ? "vite-app" : "static"
    };
  }
  const dest = join(outDir, relPath);
  console.log(`Building ${meta.title} -> ${dest}`);
  if (meta.type === "vite-app") {
    try {
      // Install dependencies if package files exist.
      if (existsSync(join(dir, "package-lock.json"))) {
        execSync("npm ci", { cwd: dir, stdio: "inherit" });
      } else if (existsSync(join(dir, "package.json"))) {
        execSync("npm install", { cwd: dir, stdio: "inherit" });
      }
      // Attempt to run the build script; fall back to copying public folder.
      try {
        execSync("npm run build", { cwd: dir, stdio: "inherit" });
        cpSync(join(dir, "dist"), dest, { recursive: true });
      } catch {
        const pubDir = join(dir, "public");
        if (existsSync(pubDir)) {
          cpSync(pubDir, dest, { recursive: true });
        }
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    // Static: copy everything into the output folder.
    cpSync(dir, dest, { recursive: true });
  }
}

traverse(activitiesDir);
