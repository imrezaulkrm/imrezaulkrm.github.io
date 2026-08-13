# Python Learning Journey - API Documentation

This document describes all API endpoints available in the platform.

## Base URL

```
https://script.google.com/macros/d/YOUR_SCRIPT_ID/userweb
```

Replace `YOUR_SCRIPT_ID` with your Google Apps Script deployment ID.

## General Response Format

All responses are in JSON format:

```json
{
  "success": true,
  "error": null,
  "data": { /* response data */ },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Responses

```json
{
  "success": false,
  "error": "Error message",
  "data": null,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Server error

---

## Authentication

### Login

**Endpoint**: `POST ?action=login`

**Parameters**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "displayName": "Administrator",
    "role": "ADMIN",
    "token": "abcd1234..."
  }
}
```

---

## Users API

All user endpoints require authentication token.

### Get User

**Endpoint**: `GET ?action=getUser`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "rahim",
    "displayName": "Rahim Khan",
    "role": "USER",
    "status": "ACTIVE"
  }
}
```

### Update Password

**Endpoint**: `POST ?action=updatePassword`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "newpassword123"
}
```

**Response**:
```json
{
  "success": true,
  "data": null
}
```

### Get All Users (Admin Only)

**Endpoint**: `GET ?action=getUsers`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "username": "admin",
      "displayName": "Administrator",
      "role": "ADMIN",
      "status": "ACTIVE"
    },
    {
      "id": "...",
      "username": "rahim",
      "displayName": "Rahim Khan",
      "role": "USER",
      "status": "ACTIVE"
    }
  ]
}
```

### Create User (Admin Only)

**Endpoint**: `POST ?action=createUser`

**Parameters**:
```json
{
  "username": "newuser",
  "displayName": "New User",
  "password": "password123",
  "role": "USER"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Update User (Admin Only)

**Endpoint**: `POST ?action=updateUser`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "displayName": "Updated Name",
  "status": "DISABLED"
}
```

### Delete User (Admin Only)

**Endpoint**: `POST ?action=deleteUser`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Chapters API

### Get All Chapters

**Endpoint**: `GET ?action=getChapters`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ch_001",
      "partId": "part_01",
      "number": 1,
      "title": {
        "en": "What is Python?",
        "bn": "Python কী?"
      },
      "description": {
        "en": "Learn Python basics",
        "bn": "Python মূলবিষয় শিখুন"
      },
      "order": 1,
      "status": "PUBLISHED"
    }
  ]
}
```

### Get Chapter Details

**Endpoint**: `GET ?action=getChapter`

**Parameters**:
```json
{
  "chapterId": "ch_001"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "ch_001",
    "number": 1,
    "title": {
      "en": "What is Python?",
      "bn": "Python কী?"
    },
    "description": {
      "en": "Learn Python basics",
      "bn": "Python মূলবিষয় শিখুন"
    }
  }
}
```

### Get Chapter Content

**Endpoint**: `GET ?action=getChapterContent`

**Parameters**:
```json
{
  "chapterId": "ch_001"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "ch_001",
    "number": 1,
    "title": { "en": "...", "bn": "..." },
    "sections": [
      {
        "id": "sec_001",
        "title": { "en": "Introduction", "bn": "পরিচয়" },
        "content": {
          "en": "<h2>Introduction</h2><p>Python is...</p>",
          "bn": "<h2>পরিচয়</h2><p>Python হল...</p>"
        },
        "type": "paragraph"
      }
    ]
  }
}
```

---

## Progress API

### Get User Progress

**Endpoint**: `GET ?action=getProgress`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "chaptersCompleted": 3,
    "totalChapters": 26,
    "quizAverage": 78,
    "bookmarkCount": 12,
    "questionCount": 5,
    "currentChapterId": "ch_004",
    "currentProgress": 45,
    "overallProgress": 12
  }
}
```

### Update Progress

**Endpoint**: `POST ?action=updateProgress`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "chapterId": "ch_001",
  "progress": 100
}
```

---

## Bookmarks API

### Get Bookmarks

**Endpoint**: `GET ?action=getBookmarks`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Add Bookmark

**Endpoint**: `POST ?action=addBookmark`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "chapterId": "ch_001",
  "sectionId": "sec_001"
}
```

### Remove Bookmark

**Endpoint**: `POST ?action=removeBookmark`

**Parameters**:
```json
{
  "bookmarkId": "bm_001"
}
```

---

## Notes API

### Get Notes

**Endpoint**: `GET ?action=getNotes`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Add Note

**Endpoint**: `POST ?action=addNote`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "chapterId": "ch_001",
  "sectionId": "sec_001",
  "content": "This is my note about variables..."
}
```

### Update Note

**Endpoint**: `POST ?action=updateNote`

**Parameters**:
```json
{
  "noteId": "note_001",
  "content": "Updated note content..."
}
```

### Delete Note

**Endpoint**: `POST ?action=deleteNote`

**Parameters**:
```json
{
  "noteId": "note_001"
}
```

---

## Questions API

### Get User Questions

**Endpoint**: `GET ?action=getQuestions`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Submit Question

**Endpoint**: `POST ?action=submitQuestion`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "chapterId": "ch_001",
  "sectionId": "sec_001",
  "questionText": "What does *args mean?",
  "understanding": "I understand it's for variable arguments but..."
}
```

### Get Pending Questions (Admin Only)

**Endpoint**: `GET ?action=getPendingQuestions`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "q_001",
      "userId": "...",
      "userName": "Rahim Khan",
      "questionText": "What does *args mean?",
      "understanding": "I understand...",
      "status": "PENDING"
    }
  ]
}
```

### Answer Question (Admin Only)

**Endpoint**: `POST ?action=answerQuestion`

**Parameters**:
```json
{
  "questionId": "q_001",
  "answer": "*args allows passing variable number of arguments..."
}
```

---

## Quiz API

### Get Quiz

**Endpoint**: `GET ?action=getQuiz`

**Parameters**:
```json
{
  "chapterId": "ch_001"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "quiz_001",
    "chapterId": "ch_001",
    "questions": [
      {
        "id": "q_001",
        "question": {
          "en": "What keyword defines a function?",
          "bn": "কোন keyword function define করে?"
        },
        "explanation": {
          "en": "The 'def' keyword...",
          "bn": "'def' keyword..."
        },
        "options": [
          { "id": "opt_1", "text": { "en": "def", "bn": "def" } },
          { "id": "opt_2", "text": { "en": "func", "bn": "func" } }
        ],
        "correctOptionIndex": 0
      }
    ],
    "passPercentage": 70
  }
}
```

### Submit Quiz Answer

**Endpoint**: `POST ?action=submitQuizAnswer`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "quizId": "quiz_001",
  "questionId": "q_001",
  "optionId": "opt_1"
}
```

### Complete Quiz

**Endpoint**: `POST ?action=completeQuiz`

**Parameters**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "quizId": "quiz_001",
  "score": 8,
  "percentage": 80,
  "passed": true
}
```

---

## Statistics API

### Get Platform Stats (Admin Only)

**Endpoint**: `GET ?action=getStats`

**Response**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 25,
    "activeUsers": 20,
    "totalChapters": 26,
    "pendingQuestions": 3,
    "recentActivity": [
      {
        "description": "User John completed Chapter 1 quiz",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 401 | Unauthorized | Add token to request headers |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource doesn't exist |
| 400 | Bad Request | Check parameter format |
| 500 | Server Error | Check Apps Script logs |

---

## Rate Limiting

No rate limiting is implemented. Use responsibly.

---

## Authentication Headers

All requests (except login) should include:

```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## Webhook Support

Not currently supported. Check back for future versions.

---

## Version

**API v1.0.0** - August 2024

---

## Support

For API issues:
1. Check browser Network tab (F12 → Network)
2. Review Apps Script logs (Apps Script → Executions)
3. Verify token is valid
4. Check request parameters match documentation

---

*Last Updated: August 2024*
