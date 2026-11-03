# Petrin svet — Status

*Overwrite this file at the end of every session (never append). Budget: 6 KB, checked by `node tools/check_docs.js`.*

**Last updated:** 2026-11-03 **App version:** 3.0.1 (`game/manifest.json`) **Repository:** https://github.com/radmanmilos/Games-for-kids **Branch:** `main`

## Where we are

- **Secrets gate shipped (task 353) and the local clone repaired (task 354).**
  - `tools/check_secrets.js` keeps credentials, API keys and private keys out of git: path deny-list
    (`.env`, `*credentials*.json`, `*.pem`, `id_rsa`, `.netrc`, …), high-confidence value patterns (private key blocks,
    AWS/GitHub/Slack/OpenAI/Google shapes, JWTs, filled `api_key:`/`password:` literals) and an exact-value scan of the real
    values in the git-ignored `tools/vendor/Cloudflare-credentials.json`. Self-tested detectors, negative-tested end to end.
  - It runs as a `check_fast` stage (CI's `fast` job → every push/PR) **and** as the committed `.githooks/pre-commit` —
    enable once per clone with `git config core.hooksPath .githooks`.
  - GitHub side: secret scanning **and push protection** are now enabled; 0 open code-scanning alerts and 0 secret-scanning alerts.
  - Credential audit (2026-11-03): 0 real credential values in 581 tracked text files, 0 generic secret patterns, 0 hits across
    523 commits of history; the credentials file is git-ignored locally and 404s on the remote.
- **Git health:** the local clone is a fresh **full** clone (9 113 objects, 1 pack, blobs included, no lazy fetch). Its git dir
  lives outside the synced tree (`/public/Games-for-kids/.git` is a `gitdir:` pointer) because the device's file-sync layer
  corrupts pack files under `/public` — decision recorded in `project/DECISIONS.md`. `log`, `show`, `diff`, `commit` (hook
  fires), `push` all verified working; local `check_fast` 9/9.
- **Open tasks:** 341–352 (feedback-batch art, Kilo-era, IN PROGRESS in `ACTIVE.md`); 328 DEFERRED (needs user input).

## Security & privacy

- Gate: `node tools/check_secrets.js` (`--quiet` for exit code only). Failing it means: remove the value, **rotate** the
  credential (deleting a pushed commit is not enough), then re-commit — never add an allowlist entry to "fix" a finding.
- Server-side nets: secret scanning + push protection enabled; code-scanning 0 open.
- `.gitignore` protects `tools/vendor/` (the Cloudflare pair) and `.env`; `docs/` is a mirror of `game/` and must never contain
  credentials.

## Asset generation

- Production art: **161 WebP** under `game/assets/art/`.
- `game/data/art-registry.js` — **154 glyph→stem** entries.
- `game/shared/art.js` — `url`, `html`, `fill`, `fillAttr`, `image`, `draw`, `_BASE`.

## Validate

- `node tools/check_fast.js` — **9/9 green** (`syntax`, registry, CI workflow, `secrets/credentials`, scan-alert guards,
  generated artifacts, offline inventory, docs, hub smoke). This is what CI's `fast` job runs.
- `node tools/check_release.js` — release gate before a release (fast gate + full smoke battery).
- CI on `main` is green (last run: task 354).

## Rules of the road

- `game/` changes → `node tools/build_offline.js` FIRST, then `tools/sync-docs.sh`, then refresh affected review screenshots.
  Never edit `docs/` by hand.
- Never commit Cloudflare credentials (`tools/vendor/` is git-ignored). Never push to `main` without the user asking.
- Keep `resources/` and `tools/` for dev assets and tooling; `game/` must stay deployable-only.
- Runtime scratch goes under git-ignored `tools/.cache/`, never system temp.
- Before touching a risky area read its lesson file (table in `AGENTS.md`). Locked decisions: `project/DECISIONS.md`.
  Process: `project/PROCESS.md`.
- **Tests must be updated to follow implementation changes.**
