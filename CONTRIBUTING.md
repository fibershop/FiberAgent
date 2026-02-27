# Contributing to FiberAgent Frontend

Quick guide for colleagues to contribute to the FiberAgent frontend using OpenClaw.

---

## Prerequisites

- OpenClaw installed locally
- GitHub account with push access to fibershop/FiberAgent
- Node.js v22+ (for local testing)
- Git configured

---

## Step 1: Get GitHub Access

### Request Collaborator Access
1. Ask Laurent to add you as a collaborator to `fibershop/FiberAgent`
   - GitHub repo: https://github.com/fibershop/FiberAgent
   - You'll need "push" permissions (not just read)

2. Verify you have access:
```bash
git clone https://github.com/fibershop/FiberAgent.git
# If this works without password, you're set
```

---

## Step 2: Set Up Your OpenClaw Workspace

### Clone the repo in your OpenClaw workspace

```bash
cd ~/.openclaw/workspace-fiber
# (or your custom workspace)

# If you haven't cloned yet:
git clone https://github.com/fibershop/FiberAgent.git .

# If already cloned:
git pull origin main
```

### Install dependencies

```bash
cd fiber-shop-landing
npm install
```

---

## Step 3: Make Your Changes

### Frontend file structure:
```
fiber-shop-landing/
├── src/
│   ├── pages/           ← Page components
│   ├── components/      ← Reusable components
│   ├── styles/          ← CSS modules
│   ├── App.js           ← Main app
│   └── index.js         ← Entry point
├── public/
│   ├── index.html
│   ├── logo.svg
│   ├── favicon.ico
│   └── .well-known/
├── package.json
└── vercel.json
```

### Example: Edit a page

```bash
# Navigate to a page file
nano src/pages/LandingPage.js

# Make your changes
# Save with Ctrl+X, Y, Enter (if using nano)
```

### Test locally

```bash
npm start
# Opens http://localhost:3000
```

---

## Step 4: Commit & Push

### Standard Git workflow

```bash
# Check status
git status

# Add changes
git add src/pages/LandingPage.js

# Commit with clear message
git commit -m "CHANGE: Update landing page hero section - add CTA button"

# Push to GitHub
git push origin main
```

### Commit message format
Use prefixes for clarity:
- `ADD:` — New feature/file
- `CHANGE:` — Modify existing code
- `FIX:` — Bug fix
- `CLEANUP:` — Remove/refactor
- `DOC:` — Documentation only

Example:
```
git commit -m "ADD: New comparison page with interactive table"
git commit -m "FIX: Navigation links not working on mobile"
git commit -m "CHANGE: Update color scheme to match new branding"
```

---

## Step 5: Create a Pull Request (PR)

### If making a bigger feature, use a branch instead:

```bash
# Create feature branch
git checkout -b feature/new-comparison-page

# Make your changes
# Test them: npm start

# Commit
git add .
git commit -m "ADD: New comparison page with merchant filters"

# Push branch
git push origin feature/new-comparison-page
```

### Then on GitHub:
1. Go to https://github.com/fibershop/FiberAgent
2. Click "Pull requests" tab
3. Click "New pull request"
4. Select your branch
5. Write description (what changed, why)
6. Click "Create pull request"
7. Wait for Laurent's review

---

## Step 6: Review Process

### What I'll check:
- ✅ **Code quality** — Clean, readable, no console errors
- ✅ **Design consistency** — Matches existing style
- ✅ **Performance** — No major slowdowns
- ✅ **Mobile responsive** — Works on all screen sizes
- ✅ **Accessibility** — ARIA labels, keyboard nav
- ✅ **Git history** — Clear commit messages
- ✅ **Testing** — Locally tested and working

### What happens next:
- 🟢 **Approved** → Merge to main → Auto-deploys to Vercel
- 🟡 **Changes requested** → Fix and push again → I re-review
- 🔴 **Rejected** → Usually with explanation + guidance

---

## Common Workflows

### Small fix (direct to main)
```bash
git checkout main
git pull origin main
# Make changes
git add .
git commit -m "FIX: Button color on dark mode"
git push origin main
# Done! Auto-deploys
```

### New feature (use branch)
```bash
git checkout -b feature/dark-mode
# Make changes
git add .
git commit -m "ADD: Dark mode toggle in settings"
git push origin feature/dark-mode
# Create PR on GitHub
# Wait for review + approval
# PR merged → auto-deploys
```

### Update from main (keep branch in sync)
```bash
git fetch origin
git rebase origin/main
git push origin feature/my-feature --force-with-lease
```

---

## Testing Checklist Before Pushing

```bash
# 1. Local development server
npm start
# Check http://localhost:3000
# Test your changes
# Ctrl+C to stop

# 2. Production build
npm run build
# Check for errors

# 3. Check for console errors
# Open DevTools (F12) → Console tab
# Should be clean (no red errors)

# 4. Mobile responsive
# DevTools → Toggle device toolbar (Ctrl+Shift+M)
# Test on phone sizes

# 5. Git status before pushing
git status
git diff  # Review what changed
```

---

## Common Issues

### "Permission denied" on push
```
Error: Permission to fibershop/FiberAgent.git denied

Solution:
1. Check GitHub has you as collaborator
2. Re-authenticate:
   git credential reject
   # Then push again (will prompt for password/token)
```

### Local changes conflict with remote
```
Error: Your branch is behind origin/main

Solution:
git pull origin main
# Resolve any conflicts
git add .
git commit -m "Merge main"
git push origin main
```

### npm install fails
```
Error: npm ERR! code ERESOLVE

Solution:
rm -rf node_modules package-lock.json
npm install
```

### Changes not showing locally
```
Solution:
npm start  # Must be running
Ctrl+R in browser (hard refresh)
Check DevTools console for errors
```

---

## Review Expectations

### Timeline
- **Simple fixes** (1-2 files): Review in 1-2 hours
- **Features** (3-5 files): Review in 4-6 hours
- **Major changes** (10+ files): Review in 24 hours

### Communication
- I'll comment on the PR with feedback
- Or approve + merge immediately if clean
- If changes needed, you'll see comments → make changes → push again

### Approval = Auto-Deploy
- Once merged, Vercel automatically deploys to https://fiberagent.shop
- No manual deployment needed
- Check site 30 seconds after merge

---

## Questions?

- Ask on Telegram/WhatsApp
- Or comment on the PR itself (I'll respond)
- Or check existing PRs for examples: https://github.com/fibershop/FiberAgent/pulls

---

## Quick Reference

| Task | Command |
|------|---------|
| Clone repo | `git clone https://github.com/fibershop/FiberAgent.git .` |
| Update main | `git pull origin main` |
| Create branch | `git checkout -b feature/name` |
| Check status | `git status` |
| Add files | `git add .` |
| Commit | `git commit -m "PREFIX: message"` |
| Push | `git push origin main` (or branch) |
| Test locally | `npm start` |
| Build test | `npm run build` |
| Create PR | Go to GitHub repo → Pull Requests → New |

---

## File Locations for Common Changes

| Component | File |
|-----------|------|
| Landing page | `src/pages/LandingPage.js` |
| Navigation | `src/components/Navigation.js` |
| Statistics page | `src/pages/StatisticsPage.js` |
| Developer page | `src/pages/DevelopersPage.js` |
| Styles (global) | `src/index.css` |
| Logo | `public/logo.svg` or `public/logo.png` |
| Favicon | `public/favicon.ico` |

---

**Ready to contribute? Start with a small fix to get comfortable, then tackle features!**
