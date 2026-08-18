# 📖 How to Use "My Python Journey" — Complete User & Admin Guide

Welcome to **My Python Journey**, an interactive, bilingual (English & Bengali), dark-themed digital learning book built specifically for mastering Python step-by-step.

This guide explains how to use all features of the website, whether you are a **Learner** progressing through the chapters or an **Administrator/Instructor** managing the curriculum and students.

---

## 🔑 Demo Access Credentials

The platform includes pre-configured demo accounts so you can explore immediately:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Full access to Admin Panel, content editor, quiz builder & Q&A |
| **Learner (Active)** | `reza` | `demo123` | Standard student account with active chapter progress |
| **Learner (Disabled)** | `karim` | `demo123` | Demonstrates account suspension behavior |

---

## 🌐 1. Global Features

### Language Switcher (EN | বাংলা)
* Located in the top header of every page.
* Clicking **`EN`** or **`বাংলা`** instantly translates:
  * All user interface buttons, navigation labels, and badges.
  * Chapter titles, descriptions, and explanatory text.
  * Code explanations and quiz questions with multiple choice options.
* Your selected language is automatically remembered in your browser.

### Theme
* Designed with a dark color palette (`#0B0E12`, `#11161D`, `#171D25`) to reduce eye strain during extended study sessions.
* Monospaced code blocks with syntax styling and one-click code copying.

---

## 🎓 2. Learner's Guide

### 2.1 Logging In
1. Open the website and click **"Read the Journey"** or go to `login.html`.
2. Enter your **Username** and **Password**.
3. Click **"Sign In"**.
> [!NOTE]
> This is a private learning platform without open public registration. User accounts are created and distributed by the instructor/admin.

---

### 2.2 The Learner Dashboard (`dashboard.html`)
After signing in, you are greeted with your personal learning hub:

1. **Current Chapter Card**:
   * Shows the chapter you are currently reading.
   * Displays a visual progress bar and a **"Continue Reading →"** button.
2. **Your Progress Metrics**:
   * **Chapters Completed**: Number of chapters you have successfully finished.
   * **Quiz Average**: Your average score percentage across all completed quizzes.
   * **Bookmarks**: Total number of bookmarked sections.
   * **Questions Asked**: Total questions you have submitted to the instructor.
3. **Quick Action Cards**:
   * 📚 **Continue Reading**: Jump directly back to your latest unlocked section.
   * 🔖 **My Bookmarks**: Opens a popup listing all saved bookmarks with one-click jump links.
   * 📝 **My Notes**: Opens your private note repository where you can view, edit, or delete notes.
   * ❓ **My Questions**: Opens your question history showing pending questions and answers from your instructor.
4. **Curriculum Chapters Grid**:
   * Browse all parts of the curriculum (Fundamentals, Core, OOP, Advanced).
   * **Status Badges**:
     * `✓ Completed` (Green): You passed the quiz for this chapter.
     * `Unlocked` (Blue): Accessible now.
     * `🔒 Locked` (Amber): Requires passing previous chapter quizzes.

---

### 2.3 Interactive Digital Book Reader (`reader.html`)
The reader offers a focused learning environment:

1. **Table of Contents (Sidebar)**:
   * View all chapters in sequence.
   * Shows chapter unlock status (`✓`, `→`, `🔒`).
   * On mobile devices, tap **☰** to toggle the sidebar.
2. **Reading Progress Bar**:
   * A dynamic progress indicator at the top tracks your scroll position in real time.
3. **Python Code Blocks & Copying**:
   * Clean code blocks with syntax formatting.
   * Click **"Copy Code"** in the top right of any code block to copy it to your clipboard.
4. **Reading Tools**:
   * 🔖 **Bookmark Section**: Click the bookmark icon next to any section or the header button to save it for quick reference.
   * 📝 **Add Personal Note**: Click the note button to write private notes. These are strictly private to you and never shared.
   * ❓ **Ask Question**: Encountered a tricky concept? Open the question dialog (see below).
5. **Bottom Navigation**:
   * Navigate back with **"← Previous"** or proceed to the assessment with **"Take Chapter Quiz →"**.

---

### 2.4 Asking Structured Questions
When you ask a question from the reader, you fill out a structured form:
* **Section**: Automatically tagged to the chapter/section you are reading.
* **Question Type**: Choose from *Concept Understanding*, *Code Behavior*, *Example Application*, *Difference / Comparison*, or *Other*.
* **What did you not understand?**: Describe specifically where you felt confused.
* **What do you understand so far?**: Share your current reasoning. This helps the instructor give you a precise answer.
* Once submitted, the question is sent directly to the instructor's dashboard. When answered, the response will appear under your **My Questions** panel.

---

### 2.5 Chapter Quizzes & Progression (`quiz.html`)
Each chapter concludes with a mandatory quiz to verify comprehension before unlocking the next chapter:

1. **Starting the Quiz**:
   * Click **"Take Chapter Quiz →"** from the bottom of any chapter reader.
2. **Answering Questions**:
   * View the progress counter (e.g., `Question 1 / 5`).
   * Select your choice ($A, B, C, D$).
   * Click **"Next Question →"** (or **"Finish Quiz"** on the last question).
3. **Results & Explanations**:
   * **Pass Mark**: 70% by default.
   * **Passed (≥70%)**: Next chapter is automatically unlocked! You can proceed immediately.
   * **Try Again (<70%)**: Review the detailed question-by-question breakdown with explanations, then click **"Retry Quiz"** or **"Review Chapter"**.

---

### 2.6 Managing Your Profile & Password
1. Click **"Profile"** in the top navigation bar.
2. View your username and display name.
3. Enter your **New Password** (minimum 6 characters) and **Confirm Password**.
4. Click **"Update Password"**.

---

## 🛠️ 3. Administrator's Guide

### 3.1 Accessing the Admin Panel (`admin/index.html`)
1. Log in with admin credentials (`username: admin`, `password: admin123`).
2. You will be automatically redirected to the **Admin Control Panel**.
3. You can also switch between the admin panel and learner view at any time using the navigation links.

---

### 3.2 Admin Sections Overview

#### 📊 1. Dashboard
* Real-time metrics: Total Users, Active Users, Total Chapters, Pending Questions, and Quiz Average Score.
* **Recent System Activity**: Audit trail logging logins, password updates, user creation, quiz attempts, and content updates.

#### 👥 2. User Management
* **View Users**: Searchable table displaying username, display name, role (`ADMIN` / `USER`), status (`ACTIVE` / `DISABLED`), and creation date.
* **Create User**: Click **"+ Create User"** to add a new learner account with username, display name, password, and role.
* **Edit User**: Modify display names or reset passwords.
* **Disable/Enable Account**: Instantly suspend or restore student access with one click.

#### 📚 3. Chapter Management
* **Create Chapter**: Set Part ID (e.g. `fundamentals`, `core`, `oop`, `advanced`), chapter number, English & Bengali titles, descriptions, and status (`PUBLISHED` / `DRAFT`).
* **Edit Chapter**: Update titles, translations, order, or publish status.
* **Unpublish / Publish**: Toggle visibility for learners.

#### ✍️ 4. Content & Sections Management
* Select any chapter from the dropdown.
* **Add Section**: Create structured sub-sections with bilingual titles and ordering.
* **Add Content Block**: Insert rich modular content into any section:
  * `paragraph`: Rich HTML text.
  * `code`: Formatted Python code snippets.
  * `callout`: Key ideas, warnings, or tips.
  * `heading`: Sub-headings.
  * `example`: Highlighted practical examples.
  * `quote`: Styled blockquotes.

#### ✅ 5. Quiz Management
* View all chapter quizzes with their associated pass percentage and question count.
* **Create Quiz**: Link a quiz to any chapter with a custom pass percentage.
* **Manage Questions**: Add bilingual questions, set explanations for right/wrong answers, input 4 choices (EN & BN), and mark the correct option via radio button.

#### ❓ 6. Questions & Student Support
* Filter questions by **Pending Only**, **Answered**, or **All Questions**.
* View student name, topic, confusion point, and what they understood.
* Click **"✍️ Answer Question"**, write your comprehensive explanation, and submit. The student will instantly see your response on their dashboard.

#### 📈 7. Learner Progress Inspection
* Select any learner from the dropdown.
* Inspect their exact progress percentage, chapters completed, quiz scores, bookmark count, and question count.

#### ⚙️ 8. Platform Settings
* Configure global platform settings:
  * **Default Pass Mark (%)**: Update standard passing threshold (default: 70%).
  * **Platform Title**: Update brand display name.
  * **Default Language**: Set default interface language (`en` or `bn`).
* Click **"Save Settings"** to persist changes.

---

## 💡 4. Best Practices for Learners

1. **Read Concept First, Code Second**: Spend time understanding *why* a Python feature exists before reading the syntax.
2. **Use Code Copying**: Copy code snippets to your local Python interpreter or IDE (`python3` / VS Code / Jupyter) and experiment with variations.
3. **Take Notes Constantly**: Use the inline **"Add Note"** feature to rephrase explanations in your own words.
4. **Don't Rush Quizzes**: Review the chapter thoroughly before taking the quiz. Quizzes are designed to test deep conceptual understanding.
5. **Leverage the Bilingual Toggle**: If a technical term is confusing in English, switch to Bengali (or vice versa) to get alternative wording.

---

## 🔒 5. Security & Privacy Notes

* **Private Notes**: Notes are stored with your unique user ID and are not displayed in the admin dashboard.
* **Session Expiry**: Sessions are secured with token verification and expire after 6 hours of inactivity.
* **Password Encryption**: All passwords are encrypted with SHA-256 and salted.

---

**Happy Learning & Teaching! 🐍📚**
