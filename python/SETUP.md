# Python Learning Journey - Complete Setup Guide

## Project Overview

A private, bilingual (English/Bengali), dark-themed interactive Python learning platform with:
- Static frontend hosted on GitHub Pages
- Google Apps Script backend API
- Google Sheets database
- Complete admin panel
- Chapter progression with mandatory quizzes
- User notes, bookmarks, and questions

---

## Prerequisites

Before starting, make sure you have:

1. **Google Account** - For Google Sheets and Google Apps Script
2. **GitHub Account** - For hosting frontend on GitHub Pages
3. **Basic Knowledge** - HTML, CSS, JavaScript, Google Sheets

---

## Step 1: Create Google Sheets Database

### 1.1 Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Create"** → **"Blank spreadsheet"**
3. Name it: **"Python Learning Journey Database"**
4. Note the spreadsheet ID from the URL (format: `/spreadsheets/d/{ID}/edit`)

### 1.2 Create All Required Sheets

In the spreadsheet, create the following sheets (right-click tab → Insert sheet):

1. `users`
2. `chapters`
3. `sections`
4. `content`
5. `quizzes`
6. `quiz_questions`
7. `quiz_options`
8. `progress`
9. `bookmarks`
10. `notes`
11. `questions`
12. `question_answers`
13. `quiz_attempts`
14. `activity_logs`
15. `settings`

See [SCHEMA.md](SCHEMA.md) for detailed column definitions for each sheet.

### 1.3 Add Column Headers

For each sheet, add the column headers as defined in SCHEMA.md in row 1.

Example for `users` sheet:
```
id | username | password_hash | display_name | role | status | created_at | updated_at
```

### 1.4 Admin User

Do not manually create password hashes. After adding the Apps Script files, run `setupDatabase()` from the Apps Script editor. It creates the first admin with a hashed password:

```text
Username: admin
Password: admin123
Role: ADMIN
Status: ACTIVE
```

---

## Step 2: Set Up Google Apps Script

### 2.1 Create Apps Script Project

1. Open your Google Sheet
2. Click **Extensions** → **Apps Script**
3. This opens the Apps Script editor

### 2.2 Add Backend Code

1. Delete the default `myFunction()` code
2. Copy all code from `google-apps-script/` folder:
   - Copy all content from `Code.gs`
   - Create new files and add:
     - `Auth.gs` - Authentication functions
     - `Chapters.gs` - Chapter management
     - `Progress.gs` - Progress tracking, bookmarks, notes
     - `Quiz.gs` - Quiz functions
     - `Stats.gs` - Statistics
     - `DatabaseSetup.gs` - Schema and demo-data initializer

To create new files:
- Click **+ (next to Files)** → **New file**
- Name it (e.g., `Auth.gs`)
- Paste the content

### 2.3 Add Required Libraries

In Apps Script, click **Libraries** (+) and add:

- **Google Apps Script built-in services** (already included, no additional library needed)

### 2.4 Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click **Select type** → Choose **Web app**
3. Configure:
   - **Execute as**: Your Google Account
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Copy the Deployment URL** - This is your API endpoint

Example format: 
```
https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb
```

### 2.5 Initialize the database

In the Apps Script editor, select and run:

```javascript
setupDatabase
```

This creates all required sheets, column headers, default admin, two demo users, three Python chapters, three quizzes, sample content, and sample notes/bookmarks/questions.

Default accounts:

```text
admin / admin123
reza / demo123
karim / demo123   (disabled demo user)
```

### 2.6 Update Frontend Configuration

In your frontend `js/api.js`, update:

```javascript
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
    // ... rest of config
};
```

Replace `YOUR_DEPLOYMENT_ID` with your actual Apps Script deployment ID.

---

## Step 3: Set Up Frontend on GitHub Pages

### 3.1 Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **+ (New repository)**
3. Name it: `python-learning-journey`
4. Choose **Public** repository
5. Click **Create repository**

### 3.2 Prepare Your Project

Ensure your project structure is:

```
python-learning-journey/
├── index.html
├── login.html
├── dashboard.html
├── reader.html
├── quiz.html
├── admin/
│   └── index.html
├── css/
│   ├── variables.css
│   ├── global.css
│   ├── landing.css
│   ├── auth.css
│   ├── dashboard.css
│   ├── reader.css
│   ├── quiz.css
│   └── admin.css
├── js/
│   ├── app.js
│   ├── api.js
│   ├── auth.js
│   ├── i18n.js
│   ├── dashboard.js
│   ├── reader.js
│   ├── quiz.js
│   └── admin.js
├── SCHEMA.md
├── SETUP.md
└── README.md
```

### 3.3 Push to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Python Learning Journey"

# Add remote (replace USERNAME and REPO)
git remote add origin https://github.com/USERNAME/python-learning-journey.git

# Push
git branch -M main
git push -u origin main
```

### 3.4 Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main** / **root**
4. Click **Save**
5. Your site will be available at: `https://USERNAME.github.io/python-learning-journey/`

---

## Step 4: Initialize Demo Data

### 4.1 Add Sample Users

In the `users` sheet, add:

```
Username: reza | Password: demo | Display Name: Reza Khan | Role: USER
Username: karim | Password: demo | Display Name: Karim Islam | Role: USER
```

(Password hashes need to be computed - for now, use a test hash)

### 4.2 Add Sample Chapters

Add to `chapters` sheet:

```
Chapter 1: "What is Python?" / "Python কী?"
Chapter 2: "Variables and Data Types" / "Variables এবং Data Types"
Chapter 3: "Conditions" / "শর্তাধীন বিবৃতি"
Chapter 4: "Loops" / "লুপ"
Chapter 5: "Functions" / "ফাংশন"
... (add more as needed)
```

### 4.3 Add Sample Content

Add sections and content for each chapter in `sections` and `content` sheets.

### 4.4 Add Sample Quiz

Create a quiz for Chapter 1 in `quizzes` sheet:

```
Chapter ID: [Chapter 1 ID]
Title EN: "Chapter 1 Quiz"
Title BN: "অধ্যায় ১ কুইজ"
Pass Percentage: 70
```

Add questions in `quiz_questions` and `quiz_options` sheets.

---

## Step 5: Test the Application

### 5.1 Test Authentication

1. Go to your GitHub Pages URL
2. Click **Login**
3. Try credentials: `username: admin`, `password: admin123`
4. Should redirect to admin dashboard

### 5.2 Test User Features

1. Log in as a regular user
2. View dashboard
3. Start reading a chapter
4. Test bookmarks, notes, questions
5. Take a quiz

### 5.3 Test Admin Features

1. Log in as admin
2. Access admin panel
3. View statistics
4. Manage users
5. Manage content
6. Answer pending questions

---

## Step 6: Deploy to Production

### 6.1 Configure Domain (Optional)

If you have a custom domain, configure it in GitHub Pages settings.

### 6.2 Enable HTTPS

GitHub Pages automatically provides HTTPS. Ensure it's enabled in settings.

### 6.3 Share with Users

Share the URL with your learning community:
```
https://USERNAME.github.io/python-learning-journey/
```

---

## Troubleshooting

### Issue: API returns 403 error

**Solution**: Make sure the Google Apps Script is deployed as a Web App with "Anyone" access.

### Issue: Login fails with "Invalid credentials"

**Solution**: 
- Check username/password are correct
- Verify password hash in Google Sheet
- Check user status is "ACTIVE"

### Issue: Chapter content not loading

**Solution**:
- Verify chapter ID in URL
- Check content exists in `content` sheet
- Check section and content bilingual fields are filled

### Issue: Quiz not showing options

**Solution**:
- Verify quiz_questions are linked to correct quiz_id
- Check quiz_options are linked to correct question_id
- Verify is_correct boolean field is filled for at least one option

### Issue: GitHub Pages showing 404

**Solution**:
- Check repository is public
- Verify GitHub Pages is enabled
- Check index.html exists in root folder
- Wait a few minutes for GitHub to build the site

---

## Security Checklist

- [ ] Change PASSWORD_SALT in Apps Script to a unique value
- [ ] Use strong admin password
- [ ] Don't share Google Sheet publicly
- [ ] Keep Apps Script private (only web app deployment is public)
- [ ] Regularly backup Google Sheet
- [ ] Monitor activity logs for suspicious access
- [ ] Update content regularly

---

## File Locations

- **Frontend**: GitHub Pages repository
- **Backend**: Google Apps Script (linked to Google Sheet)
- **Database**: Google Sheets (15 sheets as defined in SCHEMA.md)

---

## Next Steps

1. Add your Python learning content to the sheets
2. Invite users and provide them the link
3. Monitor activity logs
4. Answer student questions through admin panel
5. Add more chapters as needed

---

## Support

For issues:
1. Check Google Apps Script logs (Apps Script → Executions)
2. Check browser console (F12 → Console tab)
3. Verify all field mappings match SCHEMA.md
4. Review sample data format

---

**Last Updated**: August 2024
**Version**: 1.0.0
