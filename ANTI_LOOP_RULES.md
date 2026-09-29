# Anti-Looping Rules

## The Problem
The agent repeatedly reads the same files, investigates the same issues, and never takes action. This wastes the user's time and context.

## Rules

### 1. Maximum 2 attempts per diagnosis
After 2 attempts to diagnose/fix the same symptom: **STOP, ESCALATE, CHANGE APPROACH**.

### 2. No repeated file reads
If you've read a file once and have the information you need, **DO NOT READ IT AGAIN**. Take action with what you have.

### 3. Action over investigation
When you have enough context to act, **ACT IMMEDIATELY**. Do not:
- Re-read files you've already read
- Re-run commands you've already run
- Re-investigate issues you've already diagnosed
- Ask clarifying questions when the path forward is clear

### 4. Commit frequently
After every completed micro-step:
- Update docs
- Sync
- Commit
- Push

Do not batch multiple tasks before committing.

### 5. If stuck, ask — don't loop
If you genuinely cannot proceed after 2 attempts:
- Tell the user what you've tried
- Ask for guidance
- Do NOT keep trying variations of the same approach

### 6. One tool call per step
Make ONE tool call, get the result, then decide the next step. Do not chain multiple investigations in a single response.

## Enforcement
If you catch yourself looping:
1. STOP immediately
2. Commit whatever progress you have
3. Tell the user: "I was looping. Current state: [X]. Next step: [Y]."
4. Wait for user direction

## Signs You're Looping
- Reading the same file for the 3rd+ time
- Running the same command twice
- Investigating the same issue without new information
- Your response starts with "Let me check..." for the 3rd+ time
- You're about to write the same code you wrote before

**STOP. COMMIT. REPORT.**
