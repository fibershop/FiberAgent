# Set Up Your Agent to Edit FiberAgent Frontend

Your OpenClaw agent can autonomously edit the FiberAgent frontend, create PRs, and deploy changes. No git knowledge needed.

---

## Step 1: Create GitHub Access Token

### Generate a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Classic"**
3. Fill in:
   - **Token name:** `FiberAgent Frontend Agent`
   - **Expiration:** 90 days
   - **Scopes:** Check only `repo` (full control of repositories)
4. Click **"Generate token"**
5. **Copy the token** (starts with `ghp_`)

### Keep it safe
```
Your token: ghp_XXXXXXXXXXXXXXXXXXXXX
Don't share this publicly!
```

---

## Step 2: Give Token to Your Agent

### OpenClaw Configuration

Add to your OpenClaw environment (in your workspace or `.env`):

```bash
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXX
GITHUB_REPO=fibershop/FiberAgent
GITHUB_USER=your-github-username
```

Or directly in your agent config:

```json
{
  "credentials": {
    "github": {
      "token": "ghp_XXXXXXXXXXXXXXXXXXXXX",
      "repo": "fibershop/FiberAgent"
    }
  }
}
```

### Test it
```bash
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

---

## Step 3: Tell Your Agent to Edit the Frontend

### Simple request format:

```
"Edit FiberAgent frontend:
- Change the landing page title to 'AI Shopping with Cashback'
- Update the hero button text to 'Get Started Free'
- Add a new feature card for agent deployment"
```

Your agent will:
1. ✅ Clone the repo
2. ✅ Make the changes
3. ✅ Test locally (`npm start`)
4. ✅ Commit with clear message
5. ✅ Push to feature branch
6. ✅ Create a Pull Request (PR)
7. ✅ Send you the PR link

---

## What Your Agent Can Edit

### Frontend Files
- **Pages:** `src/pages/LandingPage.js`, `src/pages/DevelopersPage.js`, etc.
- **Components:** `src/components/Navigation.js`, buttons, cards, etc.
- **Styles:** `src/index.css`, module CSS files
- **Assets:** `public/logo.svg`, `public/favicon.ico`
- **HTML:** `public/index.html`

### Example Tasks

```
"Add a new page called 'Roadmap' showing phase 1, 2, 3, 4"

"Update the statistics dashboard to show real-time agent count"

"Change the navigation colors to match the new brand colors: 
cyan (#00D9FF), magenta (#FF006E), gold (#FFB627)"

"Fix the mobile responsiveness on the comparison page"

"Add dark mode toggle in the navigation"
```

---

## Review & Deploy

### What happens next:

1. **Your agent creates a PR** → Link sent to you
2. **Laurent reviews** the PR (usually within a few hours)
3. **Laurent approves** or asks for changes
4. **If approved:** Auto-deploys to https://fiberagent.shop (30 seconds)
5. **You see changes live**

### Check PR Status

Go to: https://github.com/fibershop/FiberAgent/pulls

You'll see your PR with:
- ✅ Approved (ready to merge)
- 🟡 Changes requested (agent needs to fix)
- 🔍 In review (Laurent is looking)

---

## Commit Message Format

Your agent will use these prefixes for clarity:

- `ADD:` — New feature or file
- `CHANGE:` — Modify existing code  
- `FIX:` — Bug fix
- `CLEANUP:` — Remove or refactor
- `DOC:` — Documentation

Examples:
```
ADD: New roadmap page with 4 phases
CHANGE: Update landing page hero section styling
FIX: Navigation links not working on mobile
```

---

## Common Tasks & Examples

### Update a Page
```
"Edit the landing page (src/pages/LandingPage.js):
- Change the hero title to 'AI Shopping Agent'
- Update the description text
- Add a new benefits section with 3 benefits"
```

### Fix a Bug
```
"Fix the mobile navigation:
- Hamburger menu should work on phones
- Links should be clickable
- Close when a link is clicked"
```

### Create New Component
```
"Create a new component called DealCard that shows:
- Product image
- Product name
- Price
- Cashback rate
- 'Shop Now' button"
```

### Style Changes
```
"Update the color scheme:
- Primary color: #00D9FF (cyan)
- Secondary: #FF006E (magenta)  
- Accent: #FFB627 (gold)
Apply to buttons, links, and headers"
```

---

## Testing Before Deploy

Your agent will test changes locally:

```bash
npm start          # Runs development server
npm run build      # Tests production build
npm test           # Runs tests (if any)
```

If tests pass, agent creates the PR. If something breaks, agent will fix it before pushing.

---

## Token Security

### Important:
- ✅ Keep your token **private**
- ✅ Don't share in messages or screenshots
- ✅ Refresh token every 90 days
- ❌ Never commit token to git
- ❌ Never post token in public channels

### If compromised:
1. Go to https://github.com/settings/tokens
2. Delete the old token
3. Create a new one
4. Update your agent's config

---

## Troubleshooting

### "Permission denied" error
```
Error: Permission to fibershop/FiberAgent.git denied

Solution:
- Check GitHub token is correct
- Check token has "repo" scope
- Try refreshing the token
- Ask Laurent to verify collaborator access
```

### "npm install fails"
```
Error: npm ERR! code ERESOLVE

Solution: Agent will retry automatically
If persistent, delete node_modules and try again:
rm -rf node_modules package-lock.json
npm install
```

### Changes don't appear locally
```
Solution:
- Your agent will run `npm start` to test
- Browser should show changes automatically (hot reload)
- If not, hard refresh (Ctrl+Shift+R)
```

### PR won't merge
```
If Laurent requests changes:
- Your agent will see the comments
- Tell agent: "Fix the feedback on the FiberAgent PR"
- Agent makes changes, pushes again
- Laurent reviews again → Approves → Merges
```

---

## File Locations Cheat Sheet

| What you want | File location |
|---|---|
| Edit landing page | `src/pages/LandingPage.js` |
| Edit navigation | `src/components/Navigation.js` |
| Edit colors globally | `src/index.css` |
| Change logo | `public/logo.svg` |
| Edit favicon | `public/favicon.ico` |
| Edit HTML head | `public/index.html` |
| Edit stats dashboard | `src/pages/StatisticsPage.js` |
| Edit developer page | `src/pages/DevelopersPage.js` |

---

## Workflow Summary

```
1. Create GitHub token (5 min)
2. Give token to your agent (2 min)
3. Tell agent what to edit (30 sec)
4. Agent makes changes + creates PR (5-10 min)
5. Laurent reviews + approves (1-6 hours)
6. Changes auto-deploy to website (30 sec)
7. You see live changes at fiberagent.shop ✅
```

---

## Next Steps

1. ✅ Generate GitHub token
2. ✅ Configure your agent with token + repo info
3. ✅ Test with a small change (update a button label)
4. ✅ Check PR at https://github.com/fibershop/FiberAgent/pulls
5. ✅ Get approval + see it deploy

---

## Questions?

- **Agent setup issue:** Ask on Telegram/WhatsApp
- **Frontend feature request:** Tell your agent what you want
- **PR feedback:** Check GitHub PR comments
- **Token help:** Go to https://github.com/settings/tokens

---

## Quick Commands Reference

```bash
# Agent clones repo
git clone https://github.com/fibershop/FiberAgent.git

# Agent tests locally
cd fiber-shop-landing
npm install
npm start

# Agent creates feature branch
git checkout -b feature/description

# Agent commits changes
git commit -m "ADD: Description of change"

# Agent pushes & creates PR
git push origin feature/description
# Then creates PR on GitHub
```

---

**You're all set! Your agent can now autonomously edit FiberAgent. Just tell it what you want changed.** 🚀
