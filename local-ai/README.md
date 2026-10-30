# Gaya local AI (Ollama)

Runs a local vision model so Gaya can work without a Gemini API key.

## Recommended on Apple Silicon (M1): run natively

Docker on macOS cannot use the Apple GPU (Metal), so the container below runs CPU-only and is slow. Native Ollama is much faster:

```bash
brew install ollama
ollama serve            # or launch the Ollama app
ollama pull qwen2.5vl:7b   # ~6 GB; fine on 16 GB RAM (use qwen2.5vl:3b on 8 GB)
```

## Start (Docker, CPU-only fallback)

```bash
cd local-ai
docker compose up -d
```

The first run downloads the model (several GB). Override it with `OLLAMA_MODEL`, e.g. `OLLAMA_MODEL=llava:7b docker compose up -d`.

Check it: `curl http://localhost:11435/api/tags`

## Stop

```bash
docker compose down
```

## Notes

- API: `http://localhost:11435` (from another container use `http://host.docker.internal:11435`). The host port is 11435 so it does not clash with a native Ollama on 11434.
- Not yet wired into the backend or mobile app (parked for now).
