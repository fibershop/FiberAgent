# Git Workflow Rules (Enforced Feb 26, 2026)

## THE RULE
**Always push after commit. No exceptions. Ever.**

## Workflow
```bash
# 1. Make changes
# 2. Add files
git add <files>

# 3. Commit
git commit -m "Clear message"

# 4. PUSH IMMEDIATELY (non-negotiable)
git push origin main

# 5. VERIFY (before saying "done")
git status
# Must show: "Your branch is up to date with 'origin/main'"
```

## Why This Matters
- **Vercel auto-deploys on git push** — if you don't push, Vercel doesn't redeploy
- **Laurent tests against live code** — uncommitted = testing old code
- **Time waste** — debugging "why isn't this working?" when code never deployed
- **Trust** — saying "it's deployed" when it isn't breaks credibility

## Examples of What NOT To Do
❌ `git commit` then slack "done, ready to test" (forgot push)
❌ `git commit` then immediately move to next task (forgot push)
❌ `git push` later in a batch (should be immediate)
❌ Saying "deployed to Vercel" without actually pushing

## What To Do Instead
✅ `git add` → `git commit` → `git push` → `git status` → THEN declare done
✅ Every commit = immediate push
✅ Always verify `git status` shows up-to-date before messaging

## Automated Check (Run before messaging Laurent)
```bash
git status
# If you see "Your branch is ahead of 'origin/main'":
#   → You forgot to push
#   → Push now: git push origin main
#   → Then message
```

## Lesson
Laurent had to point this out **twice** (Feb 26, morning + afternoon). This is a critical workflow bug in how I work. Fix it: **Always push immediately after commit.** No mental note of "I'll push later" — push now.
