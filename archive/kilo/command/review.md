---
description: Run a code review pass on modified files
model: kilo-auto/free
---
Review all modified and added files for: code quality, architecture consistency, Serbian Cyrillic text correctness, accessibility, performance, and adherence to AGENTS.md rules (YAGNI, surgical changes, no speculation). Produce a structured report with findings categorized by severity (blocker / major / minor / cosmetic) and actionable recommendations. Do not make code changes unless explicitly approved by the user.