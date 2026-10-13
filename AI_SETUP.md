# PLAYFORGE AI Companion setup

Coach Nexus is a multi-turn chat companion focused on fitness, exercise planning, balanced nutrition, recovery, hydration, sleep routines and habit-building. It uses the model configured for the app server, and is not limited to summarising PLAYFORGE logs. It should redirect unrelated requests toward those areas and provides general educational guidance rather than diagnosis or treatment. Use the personal-context toggle only when you want your profile and recent logs included.

The React app does **not** call a language-model service directly. It sends chat messages to the same-origin `/api/chat` endpoint in `server.mjs`, which talks to a configured provider. Provider credentials stay on the server and are never put in a `VITE_` variable or bundled into browser code.

## Option A — local AI with Ollama (default; no API key)

1. Install Ollama from <https://ollama.com/> if it isn't installed.
2. Open a separate terminal and check models:

   ```powershell
   ollama list
   ```

3. If `llama3.2:latest` is missing, download it once:

   ```powershell
   ollama pull llama3.2:latest
   ```

4. Make sure Ollama is running. You can test a prompt in a terminal with:

   ```powershell
   ollama run llama3.2:latest
   ```

5. In the PLAYFORGE project root, copy `.env.example` to `.env` if you want to customise the default values. The default configuration is:

   ```dotenv
   AI_PROVIDER=ollama
   AI_MODEL=llama3.2:latest
   OLLAMA_BASE_URL=http://127.0.0.1:11434
   ```

6. Start the app with `npm run dev`. The top bar should show **AI READY** if Ollama and the selected model are available.

If Ollama is running but you're using a different installed model, change `AI_MODEL` in `.env` to the exact name shown by `ollama list`, then restart `npm run dev`.

## Option B — an OpenAI-compatible hosted model

This also supports providers that expose an OpenAI-compatible `/chat/completions` endpoint. Hosted model use may incur charges and sends your chat prompts to that provider.

1. Copy `.env.example` to `.env`.
2. Set `AI_PROVIDER=openai-compatible`.
3. Set `AI_BASE_URL` to the provider's API root (for example, `https://api.openai.com/v1`, or the compatible base URL in your provider's dashboard).
4. Set `AI_MODEL` to a model name supported by that provider.
5. Set `AI_API_KEY` to your secret key. **Never put the key in `src/`, `index.html`, a `VITE_` variable, GitHub, or a public screenshot.**
6. Restart `npm run dev` and check the AI status badge or Settings page.

Example only (replace the model and key with values from your provider):

```dotenv
AI_PROVIDER=openai-compatible
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_API_KEY=your-secret-key-here
```

## Chat privacy controls

- By default, the chat sends your messages and conversation history to the configured model; it does **not** include your stored profile or habit logs.
- The **Include my PLAYFORGE data** checkbox opts in to sending a small summary of your profile and last seven days of recorded activity, habit counts, sleep, energy and mood. Free-text notes are not included.
- With local Ollama, prompts go to the local model endpoint configured on your computer. With a hosted provider, prompts are processed by that provider under its own policies.
- The AI can make mistakes and does not automatically browse the web. Verify important claims and don't use it as a substitute for professional medical, legal or financial advice.

## Troubleshooting

- **AI OFFLINE**: open `http://localhost:5173/api/health` in your browser. It explains whether the endpoint or model is missing.
- **Ollama isn't reachable**: start Ollama, then test `ollama run llama3.2:latest` in a separate terminal.
- **Model not installed**: run `ollama pull llama3.2:latest` or change `AI_MODEL` to a model already in `ollama list`.
- **Hosted provider errors**: verify `AI_BASE_URL`, model name and API key. A hosted provider may return rate-limit, permission, quota or billing errors.
- **Port already in use**: stop the previous PLAYFORGE terminal with `Ctrl+C`, then rerun `npm run dev`. You can set `PORT=5174` in `.env` if you need another port.
- **It keeps showing old UI**: stop the old server; open the folder containing this `package.json`; then run `npm run dev` from that project.

## Deployment caution

`npm run build` builds the client bundle; `npm start` starts the production server and serves `dist/` plus the AI API. Do not expose a hosted-model API publicly without adding authentication, usage limits, monitoring and appropriate abuse protection. The included endpoint is a prototype, not a hardened public multi-user AI service.
