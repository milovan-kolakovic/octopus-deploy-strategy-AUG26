# Octopus Deploy · LinkedIn Campaign Structure Blueprint

Self-contained single-page brief. No build step, no dependencies.

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. In Vercel, "Add New Project" and import the repo.
3. Framework Preset: **Other**. Leave build command and output directory empty.
4. Deploy. Vercel serves `index.html` at the root.

Or from the CLI, in this folder: `vercel --prod`

## Notes
- Fonts load from Google Fonts. Everything else is inline; no other external requests.
- Tabs are hash-routed, so `…/#constraint` deep-links straight to that tab.
- `Cmd/Ctrl + P` renders a clean light-background PDF via the print stylesheet.
- The `RECOMMENDATION VARIABLES` comment at the top of `index.html` is the single
  source of truth. If the strategy changes, edit it there first, then update the tabs.
