# AI tools: where each one gets its instructions

Every shim only **points at `AGENTS.md`**. Change rules in `AGENTS.md` only; never copy rules into a shim. If you add a new AI tool, add its shim and a row here.

| Tool | Reads | How |
| --- | --- | --- |
| OpenCode | `AGENTS.md` | native; skill `.opencode/skills/validate-game-change/`; Playwright MCP in `opencode.json` |
| Kilo | `AGENTS.md` | `kilo.jsonc` `instructions`; agent `.kilo/agent/ponytail.md`; commands `.kilo/command/*.md` (edits under `project/**` are allowed in `kilo.jsonc`) |
| Codex | `AGENTS.md` | native; `.codex/instructions.md` is a pointer |
| GitHub Copilot | `AGENTS.md` | `.github/copilot-instructions.md` is a pointer |
| Claude Code | `AGENTS.md` + `project/STATUS.md` | root `CLAUDE.md` imports both (`@AGENTS.md`). Claude Code reads `CLAUDE.md`, not `AGENTS.md` (<https://code.claude.com/docs/en/memory>) |
| Claude (claude.ai Project) | the Project brief | repo copy: [`claude-project-brief.md`](claude-project-brief.md); the live copy is pasted into the Project in claude.ai. Sandbox: no GitHub push credentials, no Chrome |

Startup set for every tool: `AGENTS.md` + `project/STATUS.md`. State lives in `project/STATUS.md` and `project/tasks/ACTIVE.md`, never in a shim or in the Claude brief.
