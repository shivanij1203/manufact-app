# Candidate panel (MCP App)

An MCP App built with mcp-use. `show-candidate` opens a View with a pitch and three projects (Lemma, NeoGuard, RAISE). Clicking a project calls `get-project` and shows its detail in place, and the View reports the selected project to the model as View state. The View follows the host's light or dark theme.

Bootstrapped with [`create-mcp-use-app`](https://mcp-use.com/docs/typescript/getting-started/quickstart) using the MCP Apps template.

## Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/mcp/inspector](http://localhost:3000/mcp/inspector) with your browser to test your server.

You can start building by editing the entry file. Add tools, resources, and prompts — the server auto-reloads as you edit.

Open [http://localhost:3000/mcp](http://localhost:3000/mcp) in a browser to see the landing page. Edit `landing.tsx` to change it (Tailwind classes work with no extra setup), or delete it to use the built-in page.

Run `npm run typecheck` to refresh MCP view types and check the project with its local TypeScript compiler. Statically declared tools used by views must be assigned to exported constants.

## Learn More

To learn more about mcp-use and MCP:

- [mcp-use Documentation](https://mcp-use.com/docs/typescript/getting-started/quickstart) — guides, API reference, and tutorials

## Deploy on Manufact Cloud

```bash
npm run deploy
```

## Demo recording

`media/candidate-panel.gif` is a recording of the panel in the mcp-use Inspector: `show-candidate` runs, then the NeoGuard and RAISE chips each load their detail in place. To record it again with headless Chromium, while `npm run dev` serves the app on port 3000:

```bash
docker build -t manufact-recorder:1 -f scripts/recorder.Dockerfile scripts
# run inside a container on the dev server's network, so localhost:3000 reaches it
node scripts/record-demo.mjs http://localhost:3000/mcp/inspector out
bash scripts/make-gif.sh out media/candidate-panel.gif
```

`record-demo.mjs` switches the View to fullscreen so it stays top-aligned while it grows. `make-gif.sh` crops to the panel and anchors the trim on the frame where the NeoGuard chip turns selected.
