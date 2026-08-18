# 🐍 My Python Journey — Interactive Learning Platform

> A production-grade, bilingual (English & Bengali), dark-themed interactive digital Python learning book with quiz-gated progressive learning, private study tools, and an administrative management panel.
> 
> **Zero Hosting Cost**: Hosted statically on **GitHub Pages** with a serverless **Google Apps Script** backend and **Google Sheets** database.

---

## 📚 Essential Documentation

| Document | Description |
| :--- | :--- |
| **[📖 HOW_TO_USE.md](HOW_TO_USE.md)** | **Complete User & Admin Manual**: Explains every feature for Learners (Dashboard, Reader, Notes, Bookmarks, Quizzes, Q&A) and Admins (Content CMS, User Management, Progress Inspection). |
| **[🚀 DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | **Step-by-Step Deployment Guide**: How to set up Google Sheets, deploy Google Apps Script as a Web App, connect `js/api.js`, and launch on GitHub Pages. |
| **[🗄️ SCHEMA.md](SCHEMA.md)** | Complete database structure for all 15 Google Sheets tables. |
| **[🔌 API.md](API.md)** | Full specification of all REST-like API endpoints and parameters. |

---

## 🔑 Pre-Configured Demo Accounts

| Role | Username | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Full access to [Admin Control Panel](admin/index.html) & Learner View |
| **Learner (Active)** | `reza` | `demo123` | [Learner Dashboard](dashboard.html) & Chapter Reader |
| **Learner (Disabled)** | `karim` | `demo123` | Demonstrates suspended user behavior |

---

## 🎯 Core Features

### 🎓 For Learners
- 📚 **28+ Chapter Structured Curriculum**: Covers Python Fundamentals, Core Python, Object-Oriented Python, and Advanced Python patterns.
- 🔐 **Quiz-Gated Progressive Learning**: Must pass chapter quizzes ($\ge 70\%$) to unlock subsequent chapters.
- 🌍 **Instant Bilingual Translation**: Toggle between **English** and **Bengali (বাংলা)** at any time. UI, chapter content, code explanations, and quizzes all switch seamlessly.
- 📝 **Private Topic Notes**: Save notes attached to specific chapters/sections. Notes are private to the student and never exposed to admins.
- 🔖 **Instant Bookmarks**: Save important sections with one-click jump links from the dashboard.
- ❓ **Context-Aware Student Q&A**: Ask targeted questions specifying your point of confusion and current understanding to receive direct answers from the instructor.
- 📋 **Executable Python Code Blocks**: Clean syntax styling with single-click **"Copy Code"** buttons.
- 🌙 **Comfortable Dark Theme**: Eye-friendly color palette (`#0B0E12`, `#11161D`, `#171D25`) optimized for deep reading.

### 🛠️ For Instructors & Admins
- 📊 **Real-Time Analytics & Audit Logs**: Track active users, quiz completion averages, pending student questions, and recent activities.
- 👥 **Full User Management**: Create learner accounts, edit display names, reset passwords, or enable/disable access with one click.
- 📖 **Chapter & Section CMS**: Create, edit, reorder, and publish/draft curriculum chapters and sub-sections.
- ✍️ **Modular Content Block Builder**: Insert rich content blocks (`paragraph`, `code`, `callout`, `heading`, `example`, `quote`) in both English and Bengali.
- ✅ **Bilingual Quiz Builder**: Create quizzes with customizable pass marks, multi-option questions, and explanation feedback.
- 💬 **Student Support Center**: Filter and answer student questions directly from the admin panel.
- 📈 **Learner Progress Inspector**: View any individual student's completed chapters, quiz score averages, bookmark counts, and question history.
- ⚙️ **Platform Configuration**: Adjust default pass percentages, site titles, and language settings.

---

## 📂 Codebase Structure

```
my-learning-journey-prototype/
├── index.html                   # Landing page (Hero, Roadmap, Why this book)
├── login.html                   # Authentication portal (Role-based routing)
├── dashboard.html               # Learner hub (Stats, Continue reading, Quick actions)
├── reader.html                  # Digital book reader (Sidebar TOC, reading tools)
├── quiz.html                    # Assessment interface (Progress bar, score review)
├── admin/
│   └── index.html               # Admin control panel (CMS, Users, Quizzes, Q&A)
├── css/
│   ├── variables.css            # Design tokens, color palette, typography
│   ├── global.css               # Shared utilities, buttons, badges, modals
│   ├── landing.css              # Landing page styling
│   ├── auth.css                 # Login screen styling
│   ├── dashboard.css            # Learner dashboard styling
│   ├── reader.css               # Book reader typography & code block styles
│   ├── quiz.css                 # Quiz runner & result review styling
│   └── admin.css                # Admin panel layout & tables styling
├── js/
│   ├── api.js                   # API client + local preview mock engine
│   ├── auth.js                  # Login/logout & route protection guards
│   ├── i18n.js                  # Bilingual translation dictionaries & engine
│   ├── dashboard.js             # Dashboard data rendering & modal logic
│   ├── reader.js                # Reader canvas, bookmarks, notes, questions
│   ├── quiz.js                  # Quiz execution, score grading, chapter unlocking
│   ├── admin.js                 # Admin panel CRUD & analytics logic
│   └── app.js                   # Shared bootstrap & toast notification helpers
├── google-apps-script/
│   ├── Code.gs                  # Main request router, token auth & session caching
│   ├── Auth.gs                  # User authentication & salted SHA-256 hashing
│   ├── Chapters.gs              # Chapters, sections & content block management
│   ├── Progress.gs              # Lock/unlock logic, progress tracking, notes, bookmarks
│   ├── Quiz.gs                  # Quizzes, questions, attempt scoring, student Q&A
│   ├── Stats.gs                 # Analytics calculation, settings & activity logs
│   └── DatabaseSetup.gs         # 15-sheet automated schema & seed data initializer
├── HOW_TO_USE.md                # Detailed user & admin guide
├── DEPLOYMENT_GUIDE.md          # Full deployment instructions
├── SCHEMA.md                    # Database schema reference
├── API.md                       # REST API endpoint reference
└── README.md                    # Project overview (this file)
```

---

## ⚡ Quick Deployment (In 3 Minutes)

1. **Google Sheets**: Create a blank spreadsheet named `Python Learning Journey Database`.
2. **Apps Script**: Open **Extensions → Apps Script**, paste the files from `google-apps-script/`, and run `setupDatabase()`.
3. **Deploy Web App**: Click **Deploy → New deployment → Web app** (Execute as: *Me*, Who has access: *Anyone*). Copy the Web App URL.
4. **Connect Frontend**: Paste your Web App URL into `CONFIG.API_URL` in `js/api.js`.
5. **Publish to GitHub Pages**: Push the code to a GitHub repository and turn on **Pages** in **Settings → Pages**.

👉 **For detailed step-by-step instructions with screenshots and troubleshooting, read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).**

---

## 💡 Offline / Local Preview Support

The frontend in `js/api.js` includes an automatic, built-in **localStorage Mock Engine**. You can double-click `index.html` or run `python3 -m http.server 8000` to test the entire application (logins, reading, bookmarks, private notes, submitting questions, quiz scoring, and admin CRUD) immediately in your browser even before deploying the Google Apps Script backend!

---

## 📄 License & Attribution

This project is distributed under the MIT License. Built for focused Python learners and instructors.
