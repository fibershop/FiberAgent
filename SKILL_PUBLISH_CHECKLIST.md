# FiberAgent Skill Publishing Checklist

**Date Created:** 2026-02-23  
**Status:** Ready for npm login & publish

---

## 🎯 WHAT'S DONE

✅ Skill built & tested locally  
✅ Code committed to GitHub  
✅ npm version bumped to 1.0.1  
✅ Documentation created  
✅ Keywords configured  

---

## 📝 MANUAL STEPS (You Do These)

### 1️⃣ npm Login (One-time)
```bash
npm login
# Username: (your npm username)
# Password: (your npm password)
# Email: (your email)
# 2FA code: (if you have 2FA enabled)
```

### 2️⃣ Publish to npm
```bash
cd /Users/laurentsalou/.openclaw/workspace-fiber/skills/fiberagent
npm publish --access public
```

### 3️⃣ Verify Published
```bash
npm view fiberagent
# Should show latest version
```

### 4️⃣ Submit to ClawHub
Go to: https://clawhub.com/submit
- Name: FiberAgent
- Category: Shopping/Commerce
- npm: fiberagent
- Repo: https://github.com/openclawlaurent/fiberagent
- Tags: shopping, cashback, crypto, monad, erc-8004

### 5️⃣ Create GitHub Release
Go to: https://github.com/openclawlaurent/fiberagent/releases/new
- Tag: v1.0.1
- Title: FiberAgent v1.0.1 - OpenClaw Shopping Skill
- Paste the release description from PUBLISHING.md

### 6️⃣ Submit to awesome-openclaw-skills
Go to: https://github.com/awesome-openclaw/awesome-openclaw-skills
- Fork → Add entry to Shopping section → PR

---

## 🔄 UPDATING LATER

When you need to update (new features, bug fixes, etc.):

```bash
cd /Users/laurentsalou/.openclaw/workspace-fiber/skills/fiberagent

# 1. Edit the files (SKILL.md, index.js, README.md, etc.)

# 2. Commit to GitHub
git add -A
git commit -m "Update: [description of changes]"
git push

# 3. Bump version
npm version patch    # Bug fixes
npm version minor    # New features
npm version major    # Breaking changes

# 4. Publish to npm
npm publish --access public

# 5. Create GitHub release
# (The git tag is auto-created by npm version)
# Go to GitHub UI → Releases → new release from tag
```

Full guide: See `/Users/laurentsalou/.openclaw/workspace-fiber/memory/fiberagent-skill-publishing.md`

---

## 📊 Current State

| Item | Status |
|------|--------|
| Code ready | ✅ |
| GitHub repo | ✅ https://github.com/openclawlaurent/fiberagent |
| Documentation | ✅ README.md, SKILL.md, PUBLISHING.md |
| npm prepared | ✅ (needs login) |
| Version | 1.0.1 |
| Package name | `fiberagent` |
| Keywords | ✅ (shopping, cashback, crypto, monad, erc-8004, etc.) |

---

## 🎉 Result

Once published, users can:
```bash
npm install fiberagent
```

And OpenClaw agents can automatically use FiberAgent to help users find shopping deals with crypto cashback!
