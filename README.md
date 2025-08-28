# Debug Diaries

Welcome to my museum of code. This repo is where I stash the experiments, prototypes and misadventures that happen while I'm teaching and learning. It's not a portfolio and it's not polished. It's a trail of what I've tried, what worked and what blew up in my face – and that's the fun of it.

## What's inside

- `activities/` – every project lives in its own folder under here. Drop your HTML, CSS and JS in a subdirectory and push. The build script will figure out whether it needs to run a build (if there's a `package.json` with a `build` script) or just copy the files as they are.
- `site/` – the public log that you see at [Debug Diaries](https://pinnersinner.github.io/Debug-Diaries/). It uses a dark cosmic palette inspired by my main site and generates cards for each activity. The cards lift when you hover and the tags are colourful pills.
- `tools/` – the Node scripts that drive the automation. `build-all.mjs` walks through `activities/` and builds or copies each folder into `public/activities/`. `make-index.mjs` reads metadata (or makes it up from the folder names) and writes the index page for the site.

## Pipeline & automation

Every push to `main` runs a GitHub Actions workflow defined in `.github/workflows/pages.yml`. It does four things:

1. Checks out the code and installs Node dependencies.
2. Runs `node tools/build-all.mjs` which either runs `npm run build` in each activity (if there's a `package.json`) or simply copies your files.
3. Runs `node tools/make-index.mjs` to build a fresh index page, deriving friendly titles from your folder names if you didn't provide a `meta.json`.
4. Uploads the resulting `public` folder and deploys it with `actions/deploy-pages@v4` to GitHub Pages.

That means you don't need to worry about manual builds or messing with GH Pages settings. Just add a folder, push, and within a few minutes it shows up on the live site.

## Adding your own projects

1. Clone the repository and switch into it.
   ```bash
   git clone https://github.com/PinnerSinner/Debug-Diaries.git
   cd Debug-Diaries
   ```
2. Create a new folder inside `activities/` with a sensible name, e.g. `passenger-counter-app`.
3. Drop your source files in. For a Vite or React app you'll want a `package.json` with a `build` script that outputs to `dist`. For a static page, just include `index.html` and assets.
4. Commit and push:
   ```bash
   git add activities/passenger-counter-app
   git commit -m "Add passenger counter app" -m "First stab at counting passengers with JavaScript."
   git push
   ```
That's it. The workflow will take it from there.

## Why this exists

I'm an instructor based in the UK working with newcomers to tech. We cover everything from basic JavaScript to cloud infrastructure. I wanted a place where I could publish all the exercises and mini-projects I do with my students without worrying about messing up a demo. This repo and its automation pipeline let me turn my classwork into a living museum. You can wander around and see how things change over time.

## Future bits

There's a wiki attached to this repo where I'll jot down deeper dives, gotchas and off-the-cuff notes. It's empty for now but watch that space. I also plan to add nicer project thumbnails and maybe a dashboard that lets you filter by language or topic. For now, enjoy the cosmic theme and the occasional joke hidden in the code.
