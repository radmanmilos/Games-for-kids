# Lessons: scanner alerts and process spawning

Read before fixing a code-scanning alert or spawning a process from a tool. Each entry is a past incident; text is moved verbatim from `AGENTS.md` (Footguns section, 2026-10-13 refactor).

- **A partially-applied security fix is worse than none, so pin the *rule*, not the diff.** Two Advanced Security alerts were autofixed here on 2026-10-01: a denylist missing `vbscript:` alongside `javascript:`, and an HTML stripper ending at `<\/script\s*>` which `</script foo="bar">` walks straight through. Autofix edits the exact text that tripped the scanner and nothing guards the rule, so the next hand-written copy of that shape reopens the alert. `tools/check_scan_alerts.js` (task 176, inside `check_fast`) now asserts both rules — scheme filters must test **every** dangerous scheme, strippers must consume the whole closing tag — proved *behaviourally* (replace the element, mask it, require the body to be gone), self-tested against the pre-fix shapes, and non-vacuous (each scan must find at least one site). When you touch a scheme filter or an HTML stripper, the guard is the spec.
- **A secret that reaches `main` is public the moment it is pushed, so the check has to run before the push.**
  The only credential this repo uses is the Cloudflare pair in the git-ignored `tools/vendor/Cloudflare-credentials.json`
  (`accountId` + `apiToken`, consumed via `--creds`); the app under `game/` never needs it and `docs/` must never contain it.
  `tools/check_secrets.js` (task 353) is the guard, in three layers: a path deny-list (`.env`, `*credentials*.json`, `*.pem`,
  `id_rsa`, `.netrc`, …), content patterns (private key blocks, AWS/GitHub/Slack/OpenAI/Google key shapes, JWTs, filled-in
  `api_key:`/`password:` literals — placeholders such as `your-api-key-here` are allowed), and an exact-value scan of the local
  credential file's real values. It runs as a `check_fast` stage, i.e. on every CI push/PR, **and** as the committed
  `.githooks/pre-commit` — enable it once per clone with `git config core.hooksPath .githooks`. Pushing straight to `main`
  bypasses nothing but CI, which reports *after* publication, so the hook is the one that actually prevents the leak;
  `--no-verify` and CI-less clones are the remaining holes. If it fires: remove the value, rotate the credential (deleting the
  commit is not enough once pushed), and only then re-commit. Do not "fix" a finding by adding an allowlist entry.
- **A fresh clone is unprotected until one command is run, and this device's sync layer can rot `.git` (2026-11-03).**
  Repo-side nets are on: `secret_scanning` and `secret_scanning_push_protection` are `enabled` in the repository's
  `security_and_analysis`, and there are 0 open code-scanning/secret-scanning alerts. Local-side, the committed
  `.githooks/pre-commit` only runs when that clone has `core.hooksPath` set — `git config core.hooksPath .githooks`, once per
  clone, with no warning when it is missing. The file-sync layer on this device also leaves `.l2s.tmp_*` junk inside
  `.git/objects` and returns `EPERM` on pack files, so a hung `git commit` / `write-tree` / `git show` is a **clone-health**
  symptom, not a repo one; the fix is a fresh full clone, never a workaround that skips the gate. On this device the git dir
  therefore lives outside the synced tree (`.git` is a one-line `gitdir:` pointer into `…/cache/opencode/git-store*`), and
  **never delete the `.l2s.tmp_*` files inside it: they share the inode with `pack-*.pack`, so removing them destroys the pack.**
  The Cloudflare pair stays in the git-ignored `tools/vendor/` and is restored by hand after a fresh clone (CI never has it). If a commit must be published
  from an unhealthy clone, build it in a throwaway repo outside the synced tree (fetch trees only, hash the changed files in,
  `commit-tree`, thin push) and then prove it: `git hash-object` of every changed file must equal the remote blob `sha`, and CI's
  `secrets/credentials` stage must be green before the task is called done.
- **Never spawn a tool through a shell-interpolated path.** `build_offline.js` used `execSync('node ' + path.join(...))` and died with `Cannot find module 'E:\GitHub\Games'` on this repo's own path (`E:\GitHub\Games for kids`). Use `execFileSync(process.execPath, [script])`. Same family as `screenshot.js`, `axe_check.js` and the `check_all.js` → `build_offline.ps1` invocation.
