# Prompt Enhancer (Vanilla + OpenRouter)

A tiny, mobile-friendly, single-file web app that streams enhanced prompts using the OpenRouter API.

## Quick Start (no backend)
1. Open `index.html` in a browser.
2. Paste your **OpenRouter API key**.
3. Pick a model (free if available), type a prompt, hit **Enhance**.

> Note: Browser apps expose API keys. Prefer the proxy for production.

## Safer Setup with Proxy
Deploy `proxy.js` as a Cloudflare Worker (or Vercel Edge function) with `OPENROUTER_API_KEY` set. Route `/proxy` to the worker. In the UI, enable **Use Proxy**.

## Features
- SSE streaming for instant token updates
- Prompt quality insights (clarity score, word count, warnings) with actionable hints
- Preset library for common workflows (research briefs, QA plans, exec summaries, JSON/table formats)
- Clipboard copy, retry, clear
- Auto-fetch model list; filters free models based on pricing
- Optional `Web Search` toggle appends `:online` to the model for OpenRouter web search
- Backup/restore of local session state (prompt, history, settings) via JSON
- 100% vanilla HTML/CSS/JS, responsive
- Accessible: labeled controls, ARIA live regions, reduced motion support
- Safer: CSP meta, friendlier error messages, no HTML injection
- Persistence: remembers your prompt, model, toggles
- History: stores last 5 enhanced prompts with quick reuse/copy

## PWA
- Installable via manifest + service worker
- Offline support with Stale-While-Revalidate caching
- Custom install banner using `beforeinstallprompt`

## Customizing Behavior
- Tweak the system prompt in `enhancerSystemPrompt()` inside `index.html`.
- Adjust generation params: `temperature`, `top_p`, `max_tokens`.

## How to Test PWA
- Serve the app over HTTP(S) with a simple server (PWA requires http/https): for example `python3 -m http.server` and open `http://localhost:8000`.
- Add to home screen when prompted or via Chrome menu. The banner will appear if not installed and not dismissed in the current session.
- Toggle airplane mode and verify previously visited pages load, output/history remain accessible.

## Notes on Security
- A strict CSP is included while still allowing inline styles/scripts used by the app.
- Errors shown to users are concise; details remain in the console.
- All dynamic text is set with `textContent` to avoid XSS.

## License
MIT
# prompt-enhancer
