# Applying the package on Windows

Replace `C:\path\to` with your folders. I did not commit or push anything to `main`.

## Option 1 — as a commit on a new branch (recommended)

```powershell
cd C:\path\to\Games-for-kids
git pull
git checkout -b regen-prompts-2026-10-29
git am C:\path\to\regen-prompts-2026-10-29.patch
git log --oneline -1
```

If `git am` stops, run `git am --abort` and use Option 2. (The patch applies cleanly to `main` at `63fb8dd`.)

## Option 2 — copy the files

```powershell
Copy-Item C:\path\to\package\prompts\*.md `
  C:\path\to\Games-for-kids\resources\General_reviews\Asset_Generation\prompts\ -Force
```

This overwrites `egg.md`, `skis.md`, `medal.md`, `notebook.md` (their previous prompts stay inside the new files) and adds six new ones.

## Run one brief

Every brief carries its own ready-made commands in its header. Example for the cow, from the repo root:

```powershell
# 1) dry run: no API call, no neurons
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/cow.md `
  --out tools/.cache/regen/cow.png `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cow.png `
  --ref-files bear.png,star.png,sheep.png --dry-run

# 2) one candidate (about 126 neurons), into the git-ignored staging folder
node tools/asset_generate.js --prompt resources/General_reviews/Asset_Generation/prompts/cow.md `
  --out tools/.cache/regen/cow.png `
  --subject-ref resources/General_reviews/Asset_Generation/assets_work_in_progress_bundle/cow.png `
  --ref-files bear.png,star.png,sheep.png --creds "tools/vendor/Cloudflare-credentials,json"
```

The dry run takes about 40 seconds because the reference images are decoded and resized.
