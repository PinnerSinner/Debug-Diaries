# Debug Diaries

Welcome to my museum of coding misadventures. This repo is where I park everything I'm working on — from tiny JavaScript demos to bigger experiments with infrastructure. It's not a polished portfolio; it's a trail of what I've learned and how I've learned it.

## What you'll find

- `activities/` — folders for each project or exercise. When I build something new, I drop the source files in a new folder and push. No need to fuss about naming conventions; the build scripts turn folder names into titles automatically.
- `site/` — the template that powers the public log. It uses a dark cosmic palette inspired by Marcoverse and generates cards for each activity. The cards lift on hover and the tags are colourful pills.
- `tools/` — the scripts behind the scenes. `build-all.mjs` figures out whether to run a build (if there's a `package.json` with a `build` script) or just copy static files. `make-index.mjs` reads metadata (or derives it) and builds the index page.

## How it works

1. Clone the repo:
   ```bash
   git clone https://github.com/PinnerSinner/Debug-Diaries.git
   cd Debug-Diaries
   ```
2. Add a new project by creating a folder inside `activities/` and dropping in your files. For a static page you just need `index.html`; for a Node/Vite project include a `package.json` with a `build` script.
3. Commit and push. The GitHub Actions pipeline (`.github/workflows/pages.yml`) will install dependencies, run builds where needed, copy static files, regenerate the index and publish everything to GitHub Pages.

Your changes will be live at [pinnersinner.github.io/Debug-Diaries](https://pinnersinner.github.io/Debug-Diaries) within a few minutes.

## Pipeline nerd talk

- The workflow runs on every push to `main`.
- `build-all.mjs` walks the `activities` tree, running `npm run build` if it finds one, or copying files directly if it doesn't.
- `make-index.mjs` generates `public/index.html` by injecting a list of all activities into the template in `site/template.html`.
- The resulting `public` folder is uploaded and deployed via the `actions/deploy-pages@v4` action.

## Style and mood

I like my projects to look like they belong on Marcoverse: dark backgrounds, bright accents, generous rounded corners and a bit of playful movement. Links are coloured rather than underlined to stand out against the dark canvas. Headings are big, body text is easy on the eyes and cards have a frosted glass effect.

Take a wander through the live site and drop me a note if something's broken. Nothing here is sacred; it's all a work in progress.
