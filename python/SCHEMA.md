# Google Sheets Database Schema

This document describes the structure of all Google Sheets used in the Python Learning Journey project.

## Overview

The database consists of 15 sheets organized by functionality:

### 1. **users** Sheet

Stores user account information.

| Column | Name | Data Type | Example | Notes |
|--------|------|-----------|---------|-------|
| A | id | Text | `550e8400-e29b-41d4-a716-446655440000` | UUID |
| B | username | Text | `rahim` | Unique identifier for login |
| C | password_hash | Text | `abc123...` | SHA-256 hash + salt |
| D | display_name | Text | `Rahim Khan` | Full name to display |
| E | role | Text | `USER` or `ADMIN` | User role |
| F | status | Text | `ACTIVE` or `DISABLED` | Account status |
| G | created_at | DateTime | `2024-01-15 10:30:00` | Account creation date |
| H | updated_at | DateTime | `2024-01-15 10:30:00` | Last update date |

---

### 2. **chapters** Sheet

Stores Python learning chapters organized by parts.

| Column | Name | Data Type | Example | Notes |
|--------|------|-----------|---------|-------|
| A | id | Text | UUID | Unique chapter ID |
| B | part_id | Text | `part_01` | Part category ID |
| C | chapter_number | Number | `1` | Sequential chapter number |
| D | title_en | Text | `What is Python?` | English title |
| E | title_bn | Text | `Python কী?` | Bengali title |
| F | description_en | Text | `Learn Python basics` | English description |
| G | description_bn | Text | `Python মূলবিষয় শিখুন` | Bengali description |
| H | order_no | Number | `1` | Display order |
| I | status | Text | `PUBLISHED` or `DRAFT` | Visibility status |
| J | created_at | DateTime | Current time | Creation date |
| K | updated_at | DateTime | Current time | Last update date |

---

### 3. **sections** Sheet

Subsections within chapters.

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | id | Text | UUID |
| B | chapter_id | Text | Reference to chapters.id |
| C | title_en | Text | `Introduction` |
| D | title_bn | Text | `পরিচয়` |
| E | order_no | Number | `1` |
| F | status | Text | `PUBLISHED` or `DRAFT` |

---

### 4. **content** Sheet

Detailed content within sections.

| Column | Name | Data Type | Example | Notes |
|--------|------|-----------|---------|-------|
| A | id | Text | UUID | |
| B | section_id | Text | Reference | |
| C | content_type | Text | `paragraph`, `code`, `callout` | |
| D | title_en | Text | | Optional |
| E | title_bn | Text | | Optional |
| F | content_en | Text | HTML or Markdown | English content |
| G | content_bn | Text | HTML or Markdown | Bengali content |
| H | order_no | Number | `1` | Display order |
| I | status | Text | `PUBLISHED` or `DRAFT` | |

---

### 5. **quizzes** Sheet

Chapter quizzes.

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | id | Text | UUID |
| B | chapter_id | Text | Reference to chapters.id |
| C | title_en | Text | `Chapter 1 Quiz` |
| D | title_bn | Text | `অধ্যায় ১ কুইজ` |
| E | pass_percentage | Number | `70` |
| F | status | Text | `PUBLISHED` or `DRAFT` |

---

### 6. **quiz_questions** Sheet

Individual questions in quizzes.

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | id | Text | UUID |
| B | quiz_id | Text | Reference to quizzes.id |
| C | question_en | Text | `Which keyword defines a function?` |
| D | question_bn | Text | `কোন keyword function define করে?` |
| E | explanation_en | Text | `The 'def' keyword...` |
| F | explanation_bn | Text | `'def' keyword...` |
| G | order_no | Number | `1` |

---

### 7. **quiz_options** Sheet

Answer options for quiz questions.

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | id | Text | UUID |
| B | question_id | Text | Reference to quiz_questions.id |
| C | option_en | Text | `def` |
| D | option_bn | Text | `def` |
| E | is_correct | Boolean | `TRUE` |

---

### 8. **progress** Sheet

User progress tracking.

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | id | Text | UUID |
| B | user_id | Text | Reference to users.id |
| C | chapter_id | Text | Reference to chapters.id |
| D | progress_percentage | Number | `75` |
| E | last_position | Text | Section position |
| F | completed | Boolean | `FALSE` |
| G | updated_at | DateTime | Current time |

---

### 9. **bookmarks** Sheet

User bookmarks for important sections.

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | id | Text | UUID |
| B | user_id | Text | Reference to users.id |
| C | chapter_id | Text | Reference to chapters.id |
| D | section_id | Text | Reference to sections.id |
| E | created_at | DateTime | Current time |

---

### 10. **notes** Sheet

User personal notes (private).

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | id | Text | UUID |
| B | user_id | Text | Reference to users.id |
| C | chapter_id | Text | Reference to chapters.id |
| D | section_id | Text | Reference to sections.id |
| E | content | Text | User's note content |
| F | created_at | DateTime | Current time |
| G | updated_at | DateTime | Current time |

---

### 11. **questions** Sheet

User questions asked while learning.

| Column | Name | Data Type | Example | Notes |
|--------|------|-----------|---------|-------|
| A | id | Text | UUID | |
| B | user_id | Text | Reference | |
| C | chapter_id | Text | Reference | |
| D | section_id | Text | Reference | |
| E | topic | Text | `*args` | Specific topic |
| F | question_type | Text | `concept`, `code`, etc. | Question category |
| G | question_text | Text | User's question | |
| H | understanding_text | Text | What user knows | |
| I | status | Text | `PENDING`, `ANSWERED` | |
| J | created_at | DateTime | | |
| K | updated_at | DateTime | | |

---

### 12. **question_answers** Sheet

Admin answers to user questions.

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | id | Text | UUID |
| B | question_id | Text | Reference to questions.id |
| C | admin_id | Text | Reference to users.id |
| D | answer | Text | Admin's answer |
| E | created_at | DateTime | Current time |
| F | updated_at | DateTime | Current time |

---

### 13. **quiz_attempts** Sheet

Record of all quiz attempts by users.

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | id | Text | UUID |
| B | user_id | Text | Reference to users.id |
| C | quiz_id | Text | Reference to quizzes.id |
| D | score | Number | `8` |
| E | total | Number | `10` |
| F | percentage | Number | `80` |
| G | passed | Boolean | `TRUE` |
| H | attempt_number | Number | `1` |
| I | created_at | DateTime | Current time |

---

### 14. **activity_logs** Sheet

System activity tracking.

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | id | Text | UUID |
| B | user_id | Text | Reference or `admin` |
| C | action | Text | `USER_CREATED`, `CHAPTER_UPDATED` |
| D | description | Text | Details of action |
| E | timestamp | DateTime | Current time |

---

### 15. **settings** Sheet

Platform-wide settings.

| Column | Name | Data Type | Example |
|--------|------|-----------|---------|
| A | setting_key | Text | `DEFAULT_PASS_MARK` |
| B | setting_value | Text | `70` |
| C | description | Text | `Default pass percentage for quizzes` |
| D | updated_at | DateTime | Current time |

---

## Data Relationships

```
users (1) ──→ (many) progress
users (1) ──→ (many) bookmarks
users (1) ──→ (many) notes
users (1) ──→ (many) questions
users (1) ──→ (many) quiz_attempts

chapters (1) ──→ (many) sections
chapters (1) ──→ (many) progress
chapters (1) ──→ (many) quizzes

sections (1) ──→ (many) content
sections (1) ──→ (many) bookmarks
sections (1) ──→ (many) notes
sections (1) ──→ (many) questions

quizzes (1) ──→ (many) quiz_questions
quizzes (1) ──→ (many) quiz_attempts

quiz_questions (1) ──→ (many) quiz_options

questions (1) ──→ (many) question_answers
```

---

## Security Notes

1. **Password Storage**: Passwords are SHA-256 hashed with salt. Never store plain text passwords.
2. **Private Data**: Notes and personal data should only be visible to the user and admins.
3. **Admin-Only Access**: User creation, deletion, and role changes are admin-only operations.
4. **Audit Trail**: All admin actions should be logged in activity_logs.

---

## Initial Data

Refer to `SETUP.md` for initial data setup and demo content.
