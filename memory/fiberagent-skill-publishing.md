# FiberAgent OpenClaw Skill — Publishing & Maintenance

**Last Updated:** 2026-02-23  
**Status:** Ready for npm publish (needs manual login)  
**Package Name:** `fiberagent`  
**Location:** `/Users/laurentsalou/.openclaw/workspace-fiber/skills/fiberagent/`

---

## 🚀 CURRENT STATUS

✅ **Skill Built & Tested**
- SKILL.md, index.js, README.md, package.json created
- Local testing passed (user query → FiberAgent API → results)
- Committed to GitHub

⏳ **npm Publishing** (BLOCKED on authentication)
- Version bumped to 1.0.1
- Ready to publish, needs `npm login`

⏳ **ClawHub Submission** (Manual)
- Form at https://clawhub.com/submit

⏳ **GitHub Release & awesome-openclaw-skills** (Manual)
- Needs GitHub UI steps + PR to awesome-openclaw-skills

---

## 📋 NEXT STEPS (DO THESE)

### Step 1: Authenticate with npm (One-time)
```bash
npm login
# Enter your npm username (or create at https://www.npmjs.com/signup)
# Enter password
# Enter email
# One-time 2FA code (if enabled)
```

### Step 2: Publish to npm
```bash
cd /Users/laurentsalou/.openclaw/workspace-fiber/skills/fiberagent
npm publish --access public
```

Verify:
```bash
npm view fiberagent
# Should show: fiberagent@1.0.1
```

### Step 3: Submit to ClawHub
1. Go to https://clawhub.com
2. Click "Submit a Skill"
3. Fill form:
   - **Name:** FiberAgent
   - **Description:** Find products with cryptocurrency cashback across 50,000+ merchants on Monad blockchain
   - **Category:** Shopping / Commerce
   - **Repository:** https://github.com/openclawlaurent/fiberagent
   - **npm Package:** fiberagent
   - **Tags:** shopping, cashback, crypto, deals, monad, erc-8004, affiliate, agent-commerce
   - **Homepage:** https://fiberagent.shop

### Step 4: Create GitHub Release
```bash
cd /Users/laurentsalou/.openclaw/workspace-fiber/skills/fiberagent
git tag v1.0.1
git push origin v1.0.1
```

Then on https://github.com/openclawlaurent/fiberagent:
- Go to "Releases" → "Create a new release"
- Tag: v1.0.1
- Title: "FiberAgent v1.0.1 - OpenClaw Shopping Skill"
- Description:
```
## What's New
- OpenClaw skill for FiberAgent shopping platform
- Find products with crypto cashback across 50,000+ merchants
- Real-time pricing + Wildfire affiliate network
- Monad ERC-8004 on-chain reputation

## Installation
\`\`\`bash
npm install fiberagent
\`\`\`

## Features
- 🛍️ Search 50,000+ merchants
- 💰 Crypto cashback (10%+ rates)
- 🔗 Tracked affiliate links
- ⛓️ Monad blockchain integration
- 👥 Agent-to-agent commerce
```

### Step 5: Submit to awesome-openclaw-skills
1. Fork https://github.com/awesome-openclaw/awesome-openclaw-skills
2. Edit README.md, find Shopping section
3. Add:
```markdown
- [FiberAgent](https://github.com/openclawlaurent/fiberagent) - OpenClaw skill for shopping with cryptocurrency cashback. Search 50,000+ merchants powered by Wildfire affiliate network on Monad.
```
4. Submit PR

---

## 🔄 FUTURE UPDATES (FOR LATER)

### When to Update?
- New FiberAgent API features
- Bug fixes in skill logic
- New keywords/discovery improvements
- Version bumps

### How to Update?

```bash
cd /Users/laurentsalou/.openclaw/workspace-fiber/skills/fiberagent

# Edit files (SKILL.md, index.js, README.md, package.json)

# Commit to GitHub
git add -A
git commit -m "Update: [DESCRIPTION]"
git push

# Bump version (patch/minor/major)
npm version patch  # For bug fixes
npm version minor  # For new features
npm version major  # For breaking changes

# Publish to npm
npm publish --access public

# Tag & release on GitHub
git push origin v1.0.X  # Push the auto-created tag
# Then create release on GitHub UI

# Update ClawHub (if needed)
# Go to https://clawhub.com and edit the listing
```

---

## 📚 KEY FILES

- **SKILL.md** — Agent instructions (what LLM reads)
- **index.js** — Tool implementations (how API calls work)
- **package.json** — npm metadata + keywords
- **README.md** — User guide + installation
- **PUBLISHING.md** — Detailed publishing steps
- **This file** — Publishing checklist + update process

---

## 🔗 LINKS

- **GitHub:** https://github.com/openclawlaurent/fiberagent
- **Website:** https://fiberagent.shop
- **npm:** https://www.npmjs.com/package/fiberagent
- **ClawHub:** https://clawhub.com (submit here)
- **awesome-openclaw-skills:** https://github.com/awesome-openclaw/awesome-openclaw-skills
- **API:** https://fiberagent.shop/api/docs

---

## ✅ PUBLISHING CHECKLIST

- [x] Skill code complete & tested
- [x] GitHub repository created & committed
- [x] npm version bumped (1.0.1)
- [ ] npm login (Laurent does this)
- [ ] npm publish --access public (Laurent does this)
- [ ] Verify on npm (Laurent checks)
- [ ] Submit to ClawHub (Laurent manually)
- [ ] Create GitHub release v1.0.1 (Laurent manually)
- [ ] Submit PR to awesome-openclaw-skills (Laurent manually)
- [ ] Announce on social/community (optional)

---

## 💡 REMEMBER

1. **Keywords are critical** — People find this via searching for "shopping", "cashback", "crypto"
2. **README is your sales pitch** — Good examples = more installs
3. **GitHub presence matters** — Stars + topics help discoverability
4. **Update regularly** — New features keep it fresh
5. **Monitor feedback** — GitHub issues/npm reviews tell you what users need

Good luck! 🚀
