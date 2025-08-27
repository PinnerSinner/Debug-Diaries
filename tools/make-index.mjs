import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const activitiesDir = join(root, "activities");
const outIndex = join(root, "public", "index.html");
const template = readFileSync(join(root, "site", "template.html"), "utf8");

const items = [];
for (const name of readdirSync(activitiesDir)) {
  const dir = join(activitiesDir, name);
  if (!statSync(dir).isDirectory()) continue;
  const metaPath = join(dir, "meta.json");
  try {
    const meta = JSON.parse(readFileSync(metaPath, "utf8"));
    items.push(meta);
  } catch {
    /* ignore */
  }
}

items.sort((a, b) => b.date.localeCompare(a.date));

const list = items.map(m => `
  <li>
    <a href="./activities/${m.slug}/" class="title">${m.title}</a>
    <span class="meta">${m.course} • ${m.date} • ${m.tags.join(", ")}</span>
    <a href="${m.scrimba_url}" class="scrimba" target="_blank" rel="noopener">Scrimba</a>
  </li>
`).join("\n");

const html = template.replace("<!--LIST-->", list);
writeFileSync(outIndex, html);
console.log("Index written:", outIndex);
