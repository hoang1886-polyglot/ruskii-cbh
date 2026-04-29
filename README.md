# Говори — Russian Learning Website
## Step-by-Step Setup Guide for Beginners

---

## 📁 File Structure

```
russian-learn/
├── index.html          ← Home page (exam grid, login/register)
├── exam.html           ← Exam-taking page (timer, questions)
├── admin.html          ← Admin-only: upload & manage exams
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── supabase-client.js  ← YOUR API KEYS GO HERE
│   ├── auth.js             ← Login / Register / Logout
│   ├── home.js             ← Loads exam grid on home page
│   ├── exam.js             ← Timer, questions, scoring
│   └── admin.js            ← Admin upload/delete logic
├── sample-exam.json    ← Example exam file to test with
└── supabase-setup.sql  ← Run this in Supabase SQL Editor
```

---

## STEP 1 — Create a Supabase Project (Free)

1. Go to **https://supabase.com** → click **Start your project**
2. Sign up (GitHub login is easiest)
3. Click **New Project**
4. Choose a name (e.g. `govori`), set a strong database password, pick a region close to Vietnam (e.g. Singapore)
5. Wait ~2 minutes for it to spin up

---

## STEP 2 — Set Up the Database

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `supabase-setup.sql` from this project
4. Copy all the SQL and paste it into the editor
5. Click **Run**
6. You should see "Success" — your tables are created!

---

## STEP 3 — Get Your API Keys

1. In Supabase, click **Settings** (gear icon) → **API**
2. Copy two things:
   - **Project URL** — looks like `https://xyzabc.supabase.co`
   - **anon public key** — a long string starting with `eyJ...`
3. Open `js/supabase-client.js` in a text editor
4. Replace the placeholder values:

```javascript
const SUPABASE_URL  = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON = 'eyJ...your-long-anon-key...';
```

---

## STEP 4 — Set Your Admin Email

1. Open `js/auth.js`
2. Find this line near the top:
   ```javascript
   const ADMIN_EMAILS = ['admin@govori.com'];
   ```
3. Replace `admin@govori.com` with **your actual email address**

4. Do the same in `js/admin.js`:
   ```javascript
   const ADMIN_EMAILS_LOCAL = ['admin@govori.com'];
   ```

---

## STEP 5 — Push to GitHub

1. Go to **https://github.com** → sign up or log in
2. Click **+** → **New Repository**
3. Name it `govori` (or anything you like)
4. Make it **Public** (required for free GitHub Pages)
5. Click **Create Repository**
6. Upload all your files:
   - Option A (easiest): Click **uploading an existing file**, drag all files/folders in
   - Option B: Use Git on your computer (ask if you need help with this)
7. Click **Commit changes**

---

## STEP 6 — Enable GitHub Pages

1. In your GitHub repo, click **Settings** (top tab)
2. Scroll down to **Pages** in the left sidebar
3. Under **Source**, choose:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. After ~1 minute, GitHub gives you a URL like:
   `https://yourusername.github.io/govori/`

🎉 **Your site is live!**

---

## STEP 7 — Enable Email Auth in Supabase

1. In Supabase → **Authentication** → **Providers**
2. Make sure **Email** is enabled (it is by default)
3. Optional: Go to **Authentication** → **Email Templates** to customize welcome emails

---

## STEP 8 — Test Everything

1. Visit your GitHub Pages URL
2. Click **Register** → create an account with your admin email
3. Check your email and click the confirmation link
4. Go to `/admin.html` on your site
5. Upload the `sample-exam.json` file
6. Go back to the home page → you should see the exam card!
7. Click the exam to take it

---

## How to Upload Exams (Admin)

1. Create a `.json` file following the format in `sample-exam.json`
2. Go to `yoursite.com/admin.html`
3. Click the upload zone and select your JSON file
4. Review the preview
5. Click **Publish Exam**

### Question Types Supported:

| Type | JSON `"type"` value | Required fields |
|------|---------------------|-----------------|
| Multiple Choice | `"mcq"` | `options[]`, `correctIndex` |
| Fill in the Blank | `"fill"` | `answer` |
| Listening Quiz | `"listening"` | `audioUrl`, `options[]`, `correctIndex` |
| Sentence Ordering | `"ordering"` | `words[]`, `correctOrder[]` |

### For Audio Files:
- Host your `.mp3` files somewhere publicly accessible
- Good free options: **Cloudinary** (free tier), **GitHub itself** (for small files), or **Supabase Storage**
- Paste the public URL into `audioUrl` in your JSON

---

## FAQ

**Q: How do I see student results?**
Go to Supabase → **Table Editor** → `exam_results` table to see all scores.

**Q: Can I change the 3-hour timer?**
Yes! Open `js/exam.js`, find `let timerSecs = 180 * 60;` and change `180` to any number of minutes.

**Q: How do I add another admin?**
Add their email to the `ADMIN_EMAILS` array in both `auth.js` and `admin.js`.

**Q: My changes aren't showing on the live site!**
GitHub Pages can take 1-2 minutes to update after you push changes. Try hard-refreshing (Ctrl+Shift+R).
