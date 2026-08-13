# COMPLETE PROJECT SPECIFICATION

## Python Learning Journey — Interactive Learning Book

### 1. Project Overview

আমি একটি personal Python learning platform তৈরি করতে চাই।

এটি একটি সাধারণ blog, documentation website বা traditional online course website হবে না।

এটি হবে এমন একটি **interactive digital learning book**, যেখানে আমি Python শেখার পুরো journey chapter-by-chapter লিখে রাখব।

Website-এর visual design হবে:

> **Modern website + subtle book/reading experience**

কিন্তু এটি যেন পুরোনো দিনের physical book-এর মতো না লাগে।

অর্থাৎ:

* modern
* clean
* minimal
* dark
* professional
* comfortable for long reading
* slight book-like feeling
* কিন্তু সম্পূর্ণ website-এর মতোও না
* এবং সম্পূর্ণ traditional book-এর মতোও না

---

# 2. Main Goal

Website-এর মূল উদ্দেশ্য:

> একজন user যেন আমার Python শেখার journey একটি structured interactive book হিসেবে পড়তে পারে, বুঝতে পারে, note নিতে পারে, প্রশ্ন করতে পারে এবং chapter-wise quiz দিয়ে নিজের understanding যাচাই করতে পারে।

Website-এর public visitor শুধু landing page দেখতে পারবে।

কিন্তু actual learning content দেখতে হলে login করতে হবে।

---

# 3. Important Restriction

এই project-এ **শুধু Python-related learning content থাকবে।**

অন্য কোনো topic add করা যাবে না।

যেমন:

* Linux ❌
* Docker ❌
* Kubernetes ❌
* Database ❌
* DevOps ❌
* Networking ❌
* JavaScript tutorial ❌

শুধু:

> **Python**

---

# 4. Technology Stack

Project-এর architecture:

```text
                 ┌──────────────────────┐
                 │      User Browser    │
                 │                      │
                 │ HTML                 │
                 │ CSS                  │
                 │ JavaScript           │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │    GitHub Pages      │
                 │    Static Hosting    │
                 └──────────┬───────────┘
                            │
                            │ HTTPS API
                            ▼
                 ┌──────────────────────┐
                 │   Google Apps Script │
                 │      Web App API     │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │     Google Sheets    │
                 │      Database        │
                 └──────────────────────┘
```

### Frontend

Use:

```text
HTML5
CSS3
Vanilla JavaScript
```

Prefer **no React / Vue / Angular**.

কারণ project-এর goal হলো simple, free এবং easy-to-maintain static website।

---

# 5. Hosting

Frontend:

> GitHub Pages

Database:

> Google Sheets

API:

> Google Apps Script Web App

Cost:

> Initially completely free.

কোনো paid VPS বা traditional server ব্যবহার করা যাবে না।

---

# 6. Backend Philosophy

আমি traditional backend server maintain করতে চাই না।

যেমন:

```text
Node.js server ❌
Express ❌
Django ❌
Flask ❌
PHP server ❌
Firebase paid infrastructure ❌
AWS backend ❌
```

এর পরিবর্তে:

```text
Google Apps Script
```

ব্যবহার করতে হবে।

Google Apps Script:

* API endpoint হিসেবে কাজ করবে
* Google Sheet read/write করবে
* authentication-related operations handle করবে
* admin CRUD handle করবে
* user progress save করবে
* notes save করবে
* bookmarks save করবে
* questions save করবে
* quiz result save করবে

---

# 7. User Roles

শুধু দুই ধরনের role থাকবে।

```text
ADMIN
USER
```

---

# 8. Public User Experience

Website খুললে প্রথমে landing page দেখাবে।

Landing page-এর purpose:

User যেন বুঝতে পারে:

> "এটি কী?"

এবং:

> "এখানে কী শেখানো হয়?"

---

# 9. Landing Page

Landing page-এ থাকবে:

### Hero section

Example:

```text
MY PYTHON JOURNEY

Learn Python.
Understand the concepts.
Build the habit of thinking in code.

[ Read the Journey ]
```

Design:

* dark
* minimal
* elegant
* lots of whitespace
* subtle typography
* no unnecessary animations

---

# 10. Landing Page Content

Landing page-এ explain করতে হবে:

### What is this?

এটি একটি personal Python learning book/journey।

### What will I find here?

* Python fundamentals
* Python syntax
* Variables
* Data types
* Conditions
* Loops
* Functions
* Modules
* Packages
* OOP
* Exceptions
* Files
* etc.

তবে content structure admin dynamically manage করতে পারবে।

---

# 11. Login System

Landing page থেকে:

```text
Read the Journey
```

button থাকবে।

Click করলে:

```text
Login Page
```

আসবে।

---

# 12. Login Page

Fields:

```text
Username
Password
```

Button:

```text
Login
```

Important:

### Public signup থাকবে না।

অর্থাৎ:

```text
Create Account ❌
Register ❌
Sign Up ❌
```

কেউ নিজে account খুলতে পারবে না।

---

# 13. User Creation

শুধু Admin user তৈরি করতে পারবে।

Admin:

```text
Create User
```

করতে পারবে।

User information:

```text
User ID
Username
Password
Display Name
Role
Status
Created Date
```

Status:

```text
ACTIVE
DISABLED
```

Disabled user login করতে পারবে না।

---

# 14. Authentication

Frontend login করবে Apps Script API-তে।

Flow:

```text
User
 ↓
Login form
 ↓
Apps Script API
 ↓
Google Sheet Users
 ↓
Credentials verify
 ↓
Success
 ↓
Session create
 ↓
Dashboard
```

Password plain text হিসেবে Google Sheet-এ রাখা উচিত নয়।

Password hashing ব্যবহার করতে হবে।

যদি Apps Script environment-এর limitations থাকে, implementation-এ secure hash approach ব্যবহার করতে হবে।

---

# 15. User Dashboard

Login করার পর user dashboard দেখবে।

Dashboard হবে learning-focused।

Example:

```text
Welcome back, Reza

Continue your Python journey

Current Chapter
Chapter 05 — Functions
Section: Arguments

Progress
████████████░░░ 76%

[ Continue Reading ]
```

---

# 16. Dashboard Statistics

Dashboard-এ দেখাবে:

```text
Chapters Completed
Current Progress
Quiz Average
Bookmarks
Questions Asked
```

Example:

```text
18
Chapters Completed

82%
Quiz Average

7
Bookmarks

3
Questions
```

---

# 17. Overall Python Progress

Progress categories হতে পারে:

```text
Python Fundamentals
Python Core Concepts
Object Oriented Programming
Advanced Python
```

তবে এগুলো admin dynamically তৈরি করতে পারবে।

---

# 18. Continue Reading

User কোথায় শেষবার পড়া বন্ধ করেছে সেটা save হবে।

Example:

```text
Chapter 05
Functions

Section:
Arguments

Progress:
76%

[Continue]
```

User আবার ঢুকলে সেখান থেকেই শুরু করতে পারবে।

---

# 19. Main Reading Interface

এটাই website-এর সবচেয়ে গুরুত্বপূর্ণ অংশ।

Design:

> Modern digital reading interface with subtle book feeling.

Traditional book design নয়।

### Avoid:

* page turning animation
* paper texture
* realistic book shadow
* old-style serif-heavy design
* excessive decoration

### Use:

* dark background
* comfortable reading width
* elegant typography
* chapter hierarchy
* code blocks
* subtle borders
* clean sidebar
* progress indicator

---

# 20. Reading Layout

Desktop:

```text
┌─────────────────────────────────────────────┐
│ Logo                  EN বাংলা     Profile │
├──────────────┬──────────────────────────────┤
│              │                              │
│ Contents     │ Chapter                      │
│              │                              │
│ Chapter 01   │ Title                        │
│ Chapter 02   │ Introduction                 │
│ Chapter 03 ✓ │                              │
│ Chapter 04   │ Content                      │
│ Chapter 05   │                              │
│ Chapter 06 🔒│ Code                         │
│              │                              │
│              │ Notes                        │
│              │                              │
│              │ Quiz                         │
│              │                              │
└──────────────┴──────────────────────────────┘
```

---

# 21. Chapter Sidebar

Left sidebar থাকবে।

Example:

```text
PYTHON FUNDAMENTALS

✓ 01 What is Python?
✓ 02 Variables
✓ 03 Data Types
✓ 04 Conditions
🔒 05 Loops
🔒 06 Functions
```

Completed chapter:

```text
✓
```

Current chapter:

highlighted

Locked:

```text
🔒
```

---

# 22. Chapter Structure

Content structure হবে:

```text
Part
 └── Chapter
      └── Section
           └── Topic
                ├── Explanation
                ├── Example
                ├── Code
                ├── Important Point
                └── Practice
```

Example:

```text
Python Fundamentals

Chapter 01
What is Python?

Section 01
Introduction

Section 02
Why Python?

Section 03
First Python Program
```

---

# 23. Bilingual System

Website দুই language support করবে:

```text
English
বাংলা
```

Header-এ:

```text
EN | বাংলা
```

থাকবে।

---

# 24. Important Translation Requirement

Language change করলে শুধু UI নয়, **book content-ও language change করবে।**

Example:

English:

```text
A function is a reusable block of code.
```

বাংলা:

```text
Function হলো reusable code-এর একটি block।
```

Admin প্রতিটি content-এর জন্য দুই version maintain করবে:

```text
title_en
title_bn

content_en
content_bn
```

একইভাবে:

```text
quiz_question_en
quiz_question_bn

option_en
option_bn

explanation_en
explanation_bn
```

---

# 25. Reading Progress

User যখন পড়বে, progress automatically save হবে।

Example:

```text
Chapter 04
Progress: 65%
```

Progress track হবে:

```text
User
Chapter
Section
Reading position
Last opened
Completed
```

---

# 26. Bookmark System

User নিজের জন্য bookmark করতে পারবে।

Example:

```text
🔖 Bookmark this section
```

Bookmark করলে save হবে:

```text
User
Chapter
Section
Topic
Date
```

User dashboard থেকে:

```text
My Bookmarks
```

দেখতে পারবে।

---

# 27. Personal Notes

Admin note system থাকবে না।

**Note সম্পূর্ণ user-এর personal feature।**

User কোনো জায়গায় বুঝতে না পারলে:

```text
📝 Add Note
```

করবে।

Example:

```text
Chapter:
Functions

Section:
Arguments

Note:
"এখানে *args কেন ব্যবহার হচ্ছে সেটা আবার দেখতে হবে।"
```

এই note শুধুমাত্র ওই user দেখতে পারবে।

Admin user-এর private note দেখতে পারবে না।

---

# 28. Question System

User যেকোনো random প্রশ্ন করতে পারবে না।

Question করার আগে form পূরণ করতে হবে।

---

# 29. Question Form

Fields:

```text
Chapter
Section
Topic
Question Type
What did you not understand?
What do you understand so far?
```

Question Type:

```text
Concept
Code
Example
Difference
Other
```

Example:

```text
Chapter:
Functions

Section:
Arguments

Topic:
*args

Question:

Why do we use *args here?

What I understand so far:

I understand that it accepts multiple values,
but I don't understand why it is needed.
```

---

# 30. Why this form?

Purpose:

User যেন:

> "Python বুঝি না"

এর মতো useless question না করে।

বরং:

> "Chapter 05 → Functions → Arguments → *args"

এর মতো specific question করে।

---

# 31. Question Status

Question-এর status:

```text
PENDING
ANSWERED
CLOSED
```

User নিজের questions দেখতে পারবে।

---

# 32. Admin Question Management

Admin দেখতে পারবে:

```text
User
Chapter
Section
Topic
Question
Status
Date
```

Admin answer করতে পারবে।

User পরে answer দেখতে পারবে।

---

# 33. Quiz System

**Quiz বাধ্যতামূলক হবে।**

প্রতিটি chapter-এর শেষে quiz থাকবে।

---

# 34. Chapter Quiz

Example:

```text
Chapter 05
Functions Quiz

Question 1 / 10

Which keyword is used to define a function?

○ func
○ def
○ function
○ create
```

---

# 35. Quiz Rules

প্রতিটি chapter-এর একটি pass mark থাকবে।

Default:

```text
70%
```

Admin চাইলে pass mark change করতে পারবে।

---

# 36. Chapter Unlock System

User:

```text
Chapter 01
 ↓
Read
 ↓
Quiz
 ↓
Pass
 ↓
Chapter 02 unlocked
```

যদি fail করে:

```text
Chapter 01
 ↓
Quiz
 ↓
Fail
 ↓
Chapter 02 🔒
```

তখন:

```text
Review Chapter
Retry Quiz
```

options থাকবে।

---

# 37. Quiz Result

Quiz শেষ হলে:

```text
82%

8 / 10 Correct

✓ Passed
```

এর নিচে প্রতিটি question-এর result:

```text
✓ Question 01
Correct

✗ Question 02
Wrong

Correct Answer:
def

Explanation:
...
```

অর্থাৎ user শুধু mark দেখবে না।

সে বুঝবে:

> কোনটা ভুল হয়েছে এবং কেন ভুল হয়েছে।

---

# 38. Quiz Attempts

প্রতিটি attempt save হবে।

Data:

```text
User
Chapter
Quiz
Score
Percentage
Passed
Attempt Number
Date
```

---

# 39. Admin Quiz Management

Admin পারবে:

```text
Create Quiz
Edit Quiz
Delete Quiz
Add Question
Edit Question
Delete Question
Set Correct Answer
Set Explanation
Set Pass Mark
```

প্রতিটি question bilingual হবে।

---

# 40. Admin Panel

Admin login করলে আলাদা admin interface থাকবে।

Sidebar:

```text
Dashboard

Users
Chapters
Sections
Content
Quizzes
Questions
Media
Progress
Settings
```

---

# 41. Admin Dashboard

Statistics:

```text
Total Users
Active Users
Total Chapters
Published Chapters
Pending Questions
Quiz Average
```

Recent activity:

```text
New user created
Question submitted
Chapter updated
Quiz completed
```

---

# 42. User CRUD

Admin:

### Create

```text
Create User
```

### Read

User list

### Update

```text
Username
Display Name
Password
Status
```

### Delete

User delete/deactivate।

Preferably hard delete-এর পরিবর্তে:

```text
DISABLED
```

করাই safer।

---

# 43. Chapter CRUD

Admin:

```text
Create Chapter
Edit Chapter
Delete Chapter
Publish
Unpublish
Reorder
```

Chapter fields:

```text
Chapter ID
Part
Title EN
Title BN
Description EN
Description BN
Order
Status
```

---

# 44. Section CRUD

প্রতিটি chapter-এর মধ্যে:

```text
Create Section
Edit Section
Delete Section
Reorder
```

---

# 45. Content Editor

Admin যেন HTML code manually না লিখেও content manage করতে পারে।

Editor-এর মধ্যে:

```text
Heading
Paragraph
Bold
Italic
Code Block
Quote
Important Note
List
Image
Link
```

থাকতে পারে।

Content bilingual:

```text
English Content
Bangla Content
```

---

# 46. Python Code Blocks

Python code সুন্দরভাবে display করতে হবে।

Example:

```python
def greet(name):
    return f"Hello {name}"

print(greet("Reza"))
```

Syntax highlighting থাকলে ভালো।

---

# 47. Python-specific Features

যেহেতু এটি Python learning book:

Content-এর মধ্যে বিশেষভাবে support করতে হবে:

```text
Python code block
Output block
Explanation
Important concept
Example
Practice
```

---

# 48. Python Learning Structure

Initial content structure এমন হতে পারে:

```text
PART 01 — Python Fundamentals

Chapter 01
What is Python?

Chapter 02
Python Installation & First Program

Chapter 03
Variables

Chapter 04
Data Types

Chapter 05
Operators

Chapter 06
Input & Output

Chapter 07
Conditions

Chapter 08
Loops


PART 02 — Core Python

Chapter 09
Functions

Chapter 10
Arguments

Chapter 11
Scope

Chapter 12
Modules

Chapter 13
Packages

Chapter 14
Exception Handling

Chapter 15
File Handling


PART 03 — Object Oriented Python

Chapter 16
Classes & Objects

Chapter 17
Constructors

Chapter 18
Inheritance

Chapter 19
Encapsulation

Chapter 20
Polymorphism


PART 04 — Advanced Python

Chapter 21
List Comprehension

Chapter 22
Lambda

Chapter 23
Decorators

Chapter 24
Generators

Chapter 25
Iterators

Chapter 26
Context Managers

Chapter 27
Virtual Environments

Chapter 28
Useful Python Patterns
```

এগুলো **initial suggested structure**। Admin যেন পরে chapter add/remove/reorder করতে পারে।

---

# 49. Search

User book-এর মধ্যে search করতে পারবে।

Example:

```text
Search Python Journey...
```

Search করলে:

```text
Functions
→ Chapter 09

*args
→ Chapter 10

decorator
→ Chapter 23
```

---

# 50. Reading Tools

Reading page-এ:

```text
Bookmark
Add Note
Ask Question
```

থাকবে।

Optional:

```text
Copy code
```

---

# 51. Responsive Design

Website অবশ্যই responsive হতে হবে।

Desktop:

```text
Sidebar + Content
```

Tablet:

```text
Collapsible Sidebar
```

Mobile:

```text
Top navigation
Drawer contents
Single-column reading
```

---

# 52. Dark Mode

**Dark mode mandatory।**

Default theme:

```text
Dark
```

Color style:

```text
Background:
#0B0E12

Panel:
#11161D

Secondary:
#171D25

Text:
#E9EDF2

Muted:
#929BA8

Accent:
soft blue
```

Design যেন চোখে চাপ না দেয়।

---

# 53. UI Philosophy

Avoid:

```text
❌ Excessive gradients
❌ Excessive animations
❌ Glassmorphism everywhere
❌ Huge colorful cards
❌ Gamification overload
❌ Fake book texture
❌ Page turning animation
```

Prefer:

```text
✓ Typography
✓ Spacing
✓ Subtle borders
✓ Dark surfaces
✓ Clear hierarchy
✓ Calm UI
✓ Reading comfort
```

---

# 54. Google Sheets Database Design

একটি Google Spreadsheet হবে database।

Sheets:

```text
users
chapters
sections
content
quizzes
quiz_questions
quiz_options
quiz_attempts
progress
bookmarks
notes
questions
question_answers
activity_logs
settings
```

---

# 55. users Sheet

Columns:

```text
id
username
password_hash
display_name
role
status
created_at
updated_at
```

---

# 56. chapters Sheet

```text
id
part_id
chapter_number
title_en
title_bn
description_en
description_bn
order_no
status
created_at
updated_at
```

---

# 57. sections Sheet

```text
id
chapter_id
title_en
title_bn
order_no
status
```

---

# 58. content Sheet

```text
id
section_id
content_type
title_en
title_bn
content_en
content_bn
order_no
status
```

`content_type`:

```text
paragraph
heading
code
callout
image
example
```

---

# 59. quizzes Sheet

```text
id
chapter_id
title_en
title_bn
pass_percentage
status
```

---

# 60. quiz_questions Sheet

```text
id
quiz_id
question_en
question_bn
explanation_en
explanation_bn
order_no
```

---

# 61. quiz_options Sheet

```text
id
question_id
option_en
option_bn
is_correct
```

---

# 62. progress Sheet

```text
id
user_id
chapter_id
section_id
progress_percentage
completed
last_position
updated_at
```

---

# 63. notes Sheet

```text
id
user_id
chapter_id
section_id
content
created_at
updated_at
```

Important:

**Admin notes দেখতে পারবে না।**

---

# 64. bookmarks Sheet

```text
id
user_id
chapter_id
section_id
created_at
```

---

# 65. questions Sheet

```text
id
user_id
chapter_id
section_id
topic
question_type
question_text
understanding_text
status
created_at
updated_at
```

---

# 66. question_answers Sheet

```text
id
question_id
admin_id
answer
created_at
updated_at
```

---

# 67. quiz_attempts Sheet

```text
id
user_id
quiz_id
score
total
percentage
passed
attempt_number
created_at
```

---

# 68. API Structure

Apps Script API actions:

```text
POST /login

GET /chapters

GET /chapter?id=...

GET /section?id=...

GET /progress

POST /progress

GET /bookmarks

POST /bookmark

DELETE /bookmark

GET /notes

POST /note

PUT /note

DELETE /note

POST /question

GET /questions

GET /quiz

POST /quiz/submit
```

Admin:

```text
GET /admin/users

POST /admin/users

PUT /admin/users

DELETE /admin/users

POST /admin/chapter

PUT /admin/chapter

DELETE /admin/chapter

POST /admin/content

PUT /admin/content

DELETE /admin/content

POST /admin/quiz

PUT /admin/quiz

DELETE /admin/quiz

POST /admin/question

PUT /admin/question

DELETE /admin/question
```

Apps Script-এর ক্ষেত্রে actual implementation `doGet(e)` এবং `doPost(e)` দিয়ে করা যাবে।

---

# 69. Security Requirements

যদিও project free এবং lightweight:

### অবশ্যই:

* HTTPS
* Password hash
* No password in frontend
* No Google Sheet direct write from browser
* API validation
* Role checking
* Admin endpoint protection
* User ownership checking

বিশেষভাবে:

User যেন API modify করে অন্য user's:

```text
notes
progress
bookmarks
questions
quiz results
```

access করতে না পারে।

---

# 70. Admin Authorization

যদি:

```text
role != ADMIN
```

তাহলে admin API access:

```text
403 Forbidden
```

---

# 71. User Authorization

User শুধু নিজের data access করবে।

Example:

```text
GET /notes
```

নিজের notes।

অন্য user-এর notes কখনো নয়।

---

# 72. Session

Login-এর পরে secure session/token mechanism থাকতে হবে।

Frontend:

```text
session/token
```

রাখবে।

প্রতিটি protected API request-এর সাথে পাঠাবে।

---

# 73. Important Limitation

Google Sheets traditional database নয়।

তাই architecture lightweight রাখতে হবে।

এই website-এর expected user:

```text
small/private learning platform
```

এবং:

```text
few users
```

এর জন্য design করতে হবে।

Massive public traffic-এর জন্য optimize করার দরকার নেই।

---

# 74. Performance

Frontend static হওয়ায়:

* fast initial load
* minimal JavaScript
* lazy-load images
* optimized assets
* no unnecessary libraries

ব্যবহার করতে হবে।

---

# 75. Folder Structure

Final project ideally:

```text
python-learning-journey/
│
├── index.html
├── login.html
├── dashboard.html
├── reader.html
├── quiz.html
├── question.html
├── profile.html
│
├── admin/
│   ├── index.html
│   ├── users.html
│   ├── chapters.html
│   ├── content.html
│   ├── quizzes.html
│   ├── questions.html
│   └── settings.html
│
├── css/
│   ├── variables.css
│   ├── global.css
│   ├── landing.css
│   ├── auth.css
│   ├── dashboard.css
│   ├── reader.css
│   ├── quiz.css
│   └── admin.css
│
├── js/
│   ├── app.js
│   ├── api.js
│   ├── auth.js
│   ├── reader.js
│   ├── quiz.js
│   ├── notes.js
│   ├── bookmarks.js
│   ├── questions.js
│   └── admin.js
│
├── assets/
│   ├── images/
│   └── icons/
│
└── README.md
```

Apps Script আলাদা:

```text
google-apps-script/
│
├── Code.gs
├── Auth.gs
├── Users.gs
├── Chapters.gs
├── Content.gs
├── Quiz.gs
├── Questions.gs
├── Progress.gs
└── Utils.gs
```

---

# 76. Admin Content Workflow

Admin:

```text
Login
 ↓
Admin Dashboard
 ↓
Create Part
 ↓
Create Chapter
 ↓
Create Sections
 ↓
Write English Content
 ↓
Write Bangla Content
 ↓
Add Python Examples
 ↓
Add Quiz
 ↓
Add Questions
 ↓
Set Pass Mark
 ↓
Publish
```

---

# 77. User Learning Workflow

User:

```text
Landing Page
 ↓
Login
 ↓
Dashboard
 ↓
Continue Reading
 ↓
Chapter
 ↓
Read Sections
 ↓
Bookmark / Note
 ↓
Question if necessary
 ↓
Chapter Quiz
 ↓
Result
 ↓
Pass
 ↓
Next Chapter Unlock
```

---

# 78. User Profile

User profile page:

```text
Display Name
Username
Password Change
Learning Progress
Quiz History
Bookmarks
Notes
Questions
```

User নিজের password change করতে পারবে।

কিন্তু username/role/status user নিজে change করতে পারবে না।

---

# 79. Admin Activity Log

Admin activity log রাখতে হবে।

Example:

```text
Admin created user
Admin updated Chapter 05
Admin published quiz
Admin answered question
```

---

# 80. Error Handling

User-friendly error message:

```text
Invalid username or password.

Something went wrong.

Please try again.

You don't have permission.

Chapter is locked.

Please complete the previous quiz.
```

Raw technical error user-কে দেখানো যাবে না।

---

# 81. Empty States

যদি user-এর কোনো:

```text
Bookmark নেই
Note নেই
Question নেই
Quiz history নেই
```

তাহলে সুন্দর empty state দেখাতে হবে।

Example:

```text
No bookmarks yet.

Save important sections while reading
and they will appear here.
```

---

# 82. Loading States

API call-এর সময়:

```text
Loading...
```

বা skeleton loader থাকবে।

---

# 83. Mobile Reading Experience

Mobile-এ content width পুরো screen fill করবে না।

Padding থাকবে।

Code horizontal scroll করবে।

Sidebar drawer হবে।

Buttons touch-friendly হবে।

---

# 84. Accessibility

Use:

```text
semantic HTML
labels
keyboard navigation
good contrast
focus states
alt text
```

---

# 85. No Public Registration

এটা আবার খুব গুরুত্বপূর্ণ:

```text
Public registration = NO
```

Only:

```text
Admin → Create User
```

---

# 86. No Payment

কোনো:

```text
Payment
Subscription
Premium
Ads
```

থাকবে না।

এটি একটি personal free learning platform।

---

# 87. No Unnecessary Features

প্রথম version-এ এগুলো add করা যাবে না:

```text
Chat
Social feed
Friends
Followers
Comments
Public profile
Payment
Leaderboard
Complex gamification
```

Focus হবে:

> Learn → Read → Note → Ask → Quiz → Progress

---

# 88. Final Design Direction

Website-এর visual identity:

### Dark

সবসময় dark-first।

### Modern

Clean SaaS/documentation quality UI।

### Book-like

শুধু:

* reading width
* chapter hierarchy
* typography
* calm layout

এর মাধ্যমে subtle book feeling।

### Not a real book

No:

* page flipping
* paper background
* old book ornaments
* excessive serif fonts

---

# 89. Final User Interface

User experience ideally:

```text
┌──────────────────────────────────────────────┐
│ My Python Journey       EN বাংলা    Profile │
├──────────────────────────────────────────────┤
│                                              │
│  Your Python Journey                         │
│                                              │
│  Chapter 05                                  │
│  Functions                                   │
│                                              │
│  ────────────────────────────────            │
│                                              │
│  Understanding Functions                     │
│                                              │
│  A function is a reusable block...           │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ def add(a, b):                       │    │
│  │     return a + b                     │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  📝 Note     🔖 Bookmark     ❓ Question     │
│                                              │
│  ────────────────────────────────            │
│                                              │
│              Chapter Quiz →                 │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 90. Most Important Requirement for the AI Building This

এই project generate করার সময় **সবকিছু একসাথে fake/mock করে দেওয়া যাবে না।**

AI-কে complete working project দিতে হবে।

অর্থাৎ:

```text
Frontend
+
Apps Script API
+
Google Sheet schema
+
Authentication
+
Admin CRUD
+
User CRUD
+
Content CRUD
+
Quiz
+
Progress
+
Notes
+
Bookmarks
+
Questions
+
Bilingual system
```

সবকিছুর implementation থাকতে হবে।

শুধু UI তৈরি করে:

> "Backend পরে implement করুন"

এভাবে project শেষ করা যাবে না।

---

# 91. Deliverables

অন্য AI-কে শেষ পর্যন্ত এগুলো দিতে বলবে:

### 1. Complete frontend source

```text
HTML
CSS
JavaScript
```

### 2. Complete Apps Script source

সব `.gs` files।

### 3. Google Sheets database schema

প্রতিটি sheet-এর:

```text
Sheet Name
Column Name
Data Type
Example
```

### 4. Setup instructions

Step-by-step:

```text
Create Google Sheet
 ↓
Create Apps Script
 ↓
Paste code
 ↓
Deploy Web App
 ↓
Copy API URL
 ↓
Put API URL in frontend config
 ↓
Push to GitHub
 ↓
Enable GitHub Pages
```

### 5. Default admin creation

প্রথম admin কীভাবে তৈরি হবে সেটাও explain করতে হবে।

### 6. Demo data

কমপক্ষে:

```text
2 users
3 chapters
3 quizzes
sample Python content
sample questions
```

দিয়ে দিতে হবে।

---

# 92. Final Acceptance Criteria

Project তখনই complete ধরা হবে যখন:

### Public

* [ ] Landing page works
* [ ] Login works
* [ ] No signup
* [ ] English works
* [ ] Bangla works
* [ ] Dark UI works

### User

* [ ] Dashboard works
* [ ] Chapter reading works
* [ ] Progress saves
* [ ] Continue reading works
* [ ] Bookmark works
* [ ] Personal notes work
* [ ] Question form works
* [ ] Question history works
* [ ] Quiz works
* [ ] Score works
* [ ] Correct/wrong answer works
* [ ] Explanation works
* [ ] Chapter unlock works
* [ ] Profile works
* [ ] Password change works

### Admin

* [ ] Admin login
* [ ] User CRUD
* [ ] Chapter CRUD
* [ ] Section CRUD
* [ ] Content CRUD
* [ ] Bilingual content
* [ ] Quiz CRUD
* [ ] Question CRUD
* [ ] Question answering
* [ ] Progress view
* [ ] Media management
* [ ] Settings

### Backend

* [ ] Apps Script API works
* [ ] Google Sheets persistence works
* [ ] Authentication works
* [ ] Authorization works
* [ ] User data isolation works
* [ ] Admin protection works

### Deployment

* [ ] GitHub Pages works
* [ ] Apps Script Web App works
* [ ] No paid server required
* [ ] Project can be deployed using free services

---

# 93. One-line Project Definition

অন্য AI-কে সবচেয়ে সহজভাবে project-এর উদ্দেশ্য বলতে হলে:

> **"Build a private, bilingual, dark-themed interactive Python learning book where admin-created users can read structured Python chapters, save private notes and bookmarks, ask context-specific questions, take mandatory chapter quizzes, see detailed results, and unlock the next chapter after passing; host the static frontend on GitHub Pages and use Google Apps Script + Google Sheets as the free persistence/API layer, with a complete admin CRUD panel."**

---

## আমার মতে এই architecture-টাই তোমার জন্য সবচেয়ে practical

```text
                    PYTHON LEARNING JOURNEY
                              │
             ┌────────────────┴────────────────┐
             │                                 │
          PUBLIC                            PRIVATE
             │                                 │
       Landing Page                       Login
             │                                 │
             │                     ┌───────────┴───────────┐
             │                     │                       │
             │                   USER                    ADMIN
             │                     │                       │
             │                Dashboard              Admin Dashboard
             │                     │                       │
             │                 Reading              User Management
             │                     │                 Content Management
             │              ┌──────┼──────┐          Quiz Management
             │              │      │      │          Question Management
             │            Note Bookmark Question      Settings
             │                     │
             │                   Quiz
             │                     │
             │                  Result
             │                     │
             │               Chapter Unlock
             │
             └──────────── GitHub Pages ──────────────┐
                                                      │
                                             Google Apps Script
                                                      │
                                               Google Sheets
