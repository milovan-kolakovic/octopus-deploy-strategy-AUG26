# Octopus Deploy · LinkedIn Campaign Structure Blueprint

Password-gated single-page brief. The report is AES-256-GCM encrypted inside
`index.html` and decrypted in the browser only when the correct password is entered.
Nothing about the strategy is readable in the page source without it.

The password is **not** stored in this repo. Get it from Milovan.

## Deploy to Vercel
1. Push this repo (keep it **Private**).
2. Vercel → Add New Project → import the repo.
3. Framework Preset: **Other**. Leave build command and output directory empty.
4. Deploy. Vercel serves `index.html` at the root.

`index.html` is fully built and committed — Vercel runs no build step.

## Changing the password or the content
```
node build.js <new-password>
```
Rebuilds `index.html` from `src/head.html` + `src/report.html`. Commit the result.
The password is passed on the command line and never stored in the repo.

Edit `src/report.html` to change the report itself, then rebuild.

## Security, honestly
The gate is real encryption, not a JavaScript `if` statement — the content genuinely
is not in the page until the password decrypts it. But the password is short and the
ciphertext ships to the browser, so a determined attacker with the file could brute
force it offline. Treat it as a strong deterrent against casual forwarding.

For an actual access control, also turn on **Vercel → Project Settings →
Deployment Protection → Password Protection**. That stops the file being served at all.

## Notes
- Fonts load from Google Fonts. Everything else is inline; no other external requests.
- Tabs are hash-routed, so `…/#audience` deep-links straight to that tab (after unlock).
- Unlock persists for the browser tab session, so a reload does not re-prompt.
- `Cmd/Ctrl + P` renders a clean light-background PDF once unlocked.
- The recommendation variables block at the top of `src/report.html` is the single
  source of truth. Change strategy there first, then update the tabs.
