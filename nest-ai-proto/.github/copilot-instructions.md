## NEST.ai — Quick instructions for AI assistants

This file helps automated coding assistants (Copilot, Agents) be immediately productive in this repository.

High-level summary
- Purpose: NEST.ai is a multi-service project (Frontend, Backend, Worker processes, infra) focused on voice → video and AI-powered learning features.
- Key directories: `Services/Backend/` (API + workers), `Frontend/nest-frontend/` (Vite/React app), `Infra/` (docker-compose), `Scripts/` (helpers), `Models/` (local/large model binaries — usually ignored).

Where to start (quick wins)
- Read the top-level `README.md` and `Requirements.txt` for the project's intent and runtime dependencies (openai-whisper, torch, ffmpeg, etc.).
- Inspect `Services/Backend/app/` for backend API endpoints (look for `api/*.py`) and background jobs (`workers/*`). Example files to check: `Services/Backend/app/api/transcribe.py` and `Services/Backend/app/workers/worker_transcribe.py`.
- For UI changes, open `Frontend/nest-frontend/src/` (e.g., `Audiouploader.jsx`, `App.jsx`) and `Frontend/nest-frontend/package.json` to learn start/build commands.

Developer workflows and commands (discoverable in repo)
- Local environment: the repo contains `Scripts/run_local.sh` and `Scripts/setup_models.sh` — inspect and use them if present; they are the canonical helpers for local runs.
- Containers: look at `Infra/docker-compose.yml` and service `Dockerfile`s (Backend, frontend, worker image) when adding or modifying services — updating compose and images is required for deployments.

Patterns & project conventions
- Service boundaries: keep web/API code under `Services/Backend/app/api/` and long-running/background logic in `Services/Backend/app/workers/` or top-level `Services/workers/`.
- Models and binary assets live in `Models/` and are intentionally separate from source. Do not commit large model files — prefer download/setup scripts (`Scripts/setup_models.sh`).
- Dependency management: Python packages are listed in `Requirements.txt` at the repo root and each service may have its own `requirements.txt` or Dockerfile.

Integration points & runtime expectations
- Speech/video ML stack is driven by native libs and model artifacts (whisper, torch, ffmpeg) — be careful when editing code that expects local models.
- Frontend↔Backend: expected typical REST / file uploads from `Audiouploader.jsx` to backend API endpoints (look for matching `transcribe` route implementations).

When making edits
- If you change a backend endpoint, search for corresponding uses in the frontend (simple grep for the route name), update tests/examples, and adjust docker-compose / Dockerfile if runtime changes are needed.
- If you add or modify model files or downloads, update `Scripts/setup_models.sh` and document the change in README.

Important notes / gotchas
- Several scaffolding files are currently empty placeholders. Before making assumptions, open files in `Services/Backend/app/` and `Frontend/nest-frontend/` to check whether logic exists or is still TODO.
- Models are intentionally external — keep models out of git history and prefer `Models/` with helper scripts.

If you need more details
- Ask for: exact local run steps (shell scripts), intended docker-compose services and image names, or where tests should be added. I can update this doc after you provide those details.

---
Be concise and prefer editing the existing structure (API vs workers vs frontend) over merging code across layers. Reference the files listed above when proposing or implementing changes.
