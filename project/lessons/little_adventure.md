# Lessons — Little Adventure

- Keep `game/` deployable-only; sync `docs/` via `tools/sync-docs.sh`.
- Run `node tools/check_fast.js` and `node tools/run_all.js --game little_adventure` after changes.
- Models must build in Node without DOM; import Three as a parameter.
- Use `bootEmulated` for reduced-motion assertions, never host default.
- Save only on milestone events; wrap storage in try/catch.
EOF