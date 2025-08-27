import { readdirSync, statSync, readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const activitiesDir = join(root, "activities");
const outIndex = join(root, "public", "index.html");
const template = readFileSync(join(root, "site", "template.html"), "utf8");

// Convert a slug like "passenger-counter-app" to "Passenger Counter App".
function humaniseSlug(slug) {
  return slug
    .split(/[-_]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const items = [];

// Walk the activities folder recursively and record each leaf directory as an item.
function traverse(dir, rel = "") {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const newRel = rel ? join(rel, name) : name;
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      const children = readdirSync(abs).filter(c => statSync(join(abs, c)).isDirectory());
      if (children.length === 0) {
        processActivity(abs, newRel);
      } else {
        traverse(abs, newRel);
      }
    }
  }
}

// Build a metadata entry for a directory; derive defaults if no meta.json exists.
function processActivity(absPath, relPath) {
  const metaPath = join(absPath, "meta.json");
  let meta;
  if (existsSync(metaPath)) {
    try {
      meta = JSON.parse(readFileSync(metaPath, "utf8"));
    } catch {
      meta = null;
    }
  }
  if (!meta) {
    const parts = relPath.split(/[/\\]/);
    const slug = parts.join("-");
    const title = humaniseSlug(parts[parts.length - 1]);
    const series = parts.length > 1 ? humaniseSlug(parts[0]) : null;
    meta = { title, slug, series };
  }
  meta.relPath = relPath.replace(/\\/g, "/");
  items.push(meta);
}

traverse(activitiesDir);

// Sort alphabetically by title for stability.
items.sort((a, b) => a.title.localeCompare(b.title));

const list = items
  .map(m => {
    const series = m.series ? `<span class="meta">${m.series}</span>` : "";
    return `  <li>\n    <a href="./activities/${m.relPath}/">${m.title}</a>${series}\n  </li>`;
  })
  .join("\n");

const html = template.replace("<!--LIST-->", list);
writeFileSync(outIndex, html);
console.log("Index written:", outIndex);
