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
