# Publishing FiberAgent Skill

## Setup (One Time)

### 1. Create GitHub Repository
```bash
# If not already created
git init
git remote add origin https://github.com/openclawlaurent/fiberagent.git
git branch -M main
git add .
git commit -m "Initial commit: FiberAgent OpenClaw skill"
git push -u origin main
```

### 2. Setup npm Account
```bash
npm login
# Enter username, password, email
# One-time setup
```

---

## Publishing to npm

### Step 1: Update Version
```bash
cd /Users/laurentsalou/.openclaw/workspace-fiber/skills/fiberagent
npm version patch  # or minor/major
# This updates package.json and creates a git tag
```

### Step 2: Publish
```bash
npm publish --access public
```

### Step 3: Verify
```bash
npm view fiberagent
# Should show your published package
```

**Users can then install:**
```bash
npm install fiberagent
```

---

## Publishing to ClawHub (Official Registry)

### Step 1: Go to ClawHub
Visit: https://clawhub.com

### Step 2: Submit Skill
- Click "Submit a Skill"
- Fill in:
  - **Name:** FiberAgent
  - **Description:** Find products with cryptocurrency cashback across 50,000+ merchants on Monad blockchain
  - **Category:** Shopping / Commerce
  - **Repository URL:** https://github.com/openclawlaurent/fiberagent
  - **npm Package:** fiberagent
  - **Tags:** shopping, cashback, crypto, deals, commerce, monad, erc-8004
  - **Homepage:** https://fiberagent.shop
  - **Logo/Icon:** (optional)

### Step 3: Wait for Approval
ClawHub team reviews submissions. Usually approved in 24-48 hours.

---

## Publishing to GitHub (Community Discovery)

### Step 1: Add GitHub Topics
Go to your repo settings and add topics:
- `openclaw`
- `skill`
- `shopping`
- `crypto-cashback`
- `agent-commerce`
- `monad`
- `erc-8004`

### Step 2: Create GitHub Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

Then on GitHub UI:
- Go to Releases → Create Release
- Tag: v1.0.0
- Title: "FiberAgent v1.0.0 - OpenClaw Skill"
- Description: Copy from README.md highlights
- Publish

### Step 3: Submit to awesome-openclaw-skills
1. Find: https://github.com/awesome-openclaw/awesome-openclaw-skills
2. Fork the repo
3. Add entry to README:
```markdown
- [FiberAgent](https://github.com/openclawlaurent/fiberagent) - Find products with cryptocurrency cashback across 50,000+ merchants. Powered by Wildfire affiliate network on Monad blockchain.
```
4. Submit PR

---

## After Publishing

### Announce to Community
1. **Reddit:** Post to r/openclaw, r/monad, r/agentic
2. **Discord:** OpenClaw Discord #announcements
3. **Twitter:** Tweet about the release
4. **Dev.to / Medium:** Write a tutorial post

### Monitor
- Track installs: `npm view fiberagent downloads`
- Check GitHub stars
- Respond to issues/feedback

---

## Quick Publish Checklist

- [ ] Version bumped in package.json
- [ ] README.md is up to date
- [ ] Keywords in package.json are good
- [ ] .npmignore is set
- [ ] All files committed to GitHub
- [ ] `npm publish --access public` successful
- [ ] Submitted to ClawHub
- [ ] GitHub topics added
- [ ] GitHub release created
- [ ] PR submitted to awesome-openclaw-skills

---

## Commands Summary

```bash
# Navigate to skill directory
cd /Users/laurentsalou/.openclaw/workspace-fiber/skills/fiberagent

# Update version (creates git tag)
npm version patch

# Publish to npm
npm publish --access public

# Verify publication
npm view fiberagent

# Check npm download stats
npm view fiberagent downloads
```

Done! Your skill is now discoverable by OpenClaw users worldwide. 🚀
