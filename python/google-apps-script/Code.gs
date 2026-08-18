// Google Apps Script Backend - Main Script
// Deploy as a Web App (Execute as: Me, Who has access: Anyone)

const SCRIPT_VERSION = '1.2.0';
const PASSWORD_SALT = 'python_journey_2024_salt_prod'; // Change this to a unique secure value
const SESSION_TTL_SECONDS = 21600; // 6 hours

// Actions restricted strictly to ADMIN users
const ADMIN_ACTIONS = [
    'createUser', 'getUsers', 'updateUser', 'deleteUser',
    'getStats', 'getPendingQuestions', 'getAllQuestions', 'answerQuestion',
    'createChapter', 'updateChapter', 'deleteChapter',
    'getSections', 'createSection', 'updateSection', 'deleteSection',
    'createContent', 'updateContent', 'deleteContent',
    'getQuizzes', 'createQuiz', 'updateQuiz', 'deleteQuiz',
    'getQuizQuestions', 'createQuizQuestion', 'updateQuizQuestion', 'deleteQuizQuestion',
    'getSettings', 'updateSettings', 'getActivityLogs'
];

// Actions that operate on a user's own data
const OWNED_USER_ACTIONS = [
    'getUser', 'updatePassword', 'getProgress', 'updateProgress',
    'getBookmarks', 'addBookmark', 'getNotes', 'addNote',
    'getQuestions', 'submitQuestion', 'submitQuizAnswer', 'completeQuiz'
];

// Main POST request handler
function doPost(e) {
    try {
        const action = e.parameter ? e.parameter.action : null;
        let data = {};
        if (e.postData && e.postData.contents) {
            try {
                data = JSON.parse(e.postData.contents);
            } catch (parseErr) {
                return sendResponse(false, 'Invalid JSON payload.', null, 400);
            }
        }

        if (!action) {
            return sendResponse(false, 'Action parameter is required.', null, 400);
        }

        let session = null;

        // Verify authentication for all actions except login
        if (action !== 'login') {
            const token = data.token || (e.parameter ? e.parameter.token : '');
            session = verifyToken(token);
            if (!session) {
                return sendResponse(false, 'Unauthorized. Please log in again.', null, 401);
            }
        }

        // Admin privilege check
        if (ADMIN_ACTIONS.indexOf(action) !== -1) {
            if (!session || session.role !== 'ADMIN') {
                return sendResponse(false, 'Permission denied. Admin privileges required.', null, 403);
            }
        }

        // Auto-assign userId for user-owned operations if not supplied, or enforce isolation
        if (OWNED_USER_ACTIONS.indexOf(action) !== -1 && session) {
            if (!data.userId || session.role !== 'ADMIN') {
                data.userId = session.id;
            }
        }

        switch (action) {
            // === AUTHENTICATION ===
            case 'login':
                return login(data.username, data.password);

            // === USER MANAGEMENT ===
            case 'getUser':
                return getUser(data.userId);
            case 'updatePassword':
                return updatePassword(data.userId, data.newPassword);
            case 'createUser':
                return createUser(data.username, data.displayName, data.password, data.role, session.id);
            case 'getUsers':
                return getUsers();
            case 'updateUser':
                return updateUser(data.userId, data, session.id);
            case 'deleteUser':
                return deleteUser(data.userId, session.id);

            // === CHAPTERS ===
            case 'getChapters':
                return getChapters(session ? session.role === 'ADMIN' : false);
            case 'getChapter':
                return getChapter(data.chapterId);
            case 'getChapterContent':
                if (session.role !== 'ADMIN' && !isChapterUnlockedForUser(session.id, data.chapterId)) {
                    return sendResponse(false, 'Chapter is locked. Please complete the previous chapter quiz first.', null, 403);
                }
                return getChapterContent(data.chapterId);
            case 'createChapter':
                return createChapter(data, session.id);
            case 'updateChapter':
                return updateChapter(data.chapterId, data, session.id);
            case 'deleteChapter':
                return deleteChapter(data.chapterId, session.id);

            // === SECTIONS & CONTENT ===
            case 'getSections':
                return getSections(data.chapterId);
            case 'createSection':
                return createSection(data, session.id);
            case 'updateSection':
                return updateSection(data.sectionId, data, session.id);
            case 'deleteSection':
                return deleteSection(data.sectionId, session.id);
            case 'createContent':
                return createContent(data, session.id);
            case 'updateContent':
                return updateContent(data.contentId, data, session.id);
            case 'deleteContent':
                return deleteContent(data.contentId, session.id);

            // === PROGRESS ===
            case 'getProgress':
                return getProgress(data.userId);
            case 'updateProgress':
                return updateProgress(data.userId, data.chapterId, data.progress, data.sectionId);

            // === BOOKMARKS ===
            case 'getBookmarks':
                return getBookmarks(data.userId);
            case 'addBookmark':
                return addBookmark(data.userId, data.chapterId, data.sectionId);
            case 'removeBookmark':
                return removeBookmark(data.bookmarkId, session.id, session.role === 'ADMIN');

            // === NOTES ===
            case 'getNotes':
                return getNotes(data.userId);
            case 'addNote':
                return addNote(data.userId, data.chapterId, data.sectionId, data.content);
            case 'updateNote':
                return updateNote(data.noteId, data.content, session.id, session.role === 'ADMIN');
            case 'deleteNote':
                return deleteNote(data.noteId, session.id, session.role === 'ADMIN');

            // === QUESTIONS ===
            case 'getQuestions':
                return getQuestions(data.userId);
            case 'submitQuestion':
                return submitQuestion(data.userId, data.chapterId, data.sectionId, data.questionText, data.understanding, data.questionType, data.topic);
            case 'getPendingQuestions':
                return getPendingQuestions();
            case 'getAllQuestions':
                return getAllQuestions();
            case 'answerQuestion':
                return answerQuestion(data.questionId, data.answer, session.id);

            // === QUIZZES ===
            case 'getQuiz':
                if (session.role !== 'ADMIN' && !isChapterUnlockedForUser(session.id, data.chapterId)) {
                    return sendResponse(false, 'Chapter is locked. Please complete the previous chapter quiz first.', null, 403);
                }
                return getQuiz(data.chapterId);
            case 'getQuizzes':
                return getQuizzes();
            case 'createQuiz':
                return createQuiz(data, session.id);
            case 'updateQuiz':
                return updateQuiz(data.quizId, data, session.id);
            case 'deleteQuiz':
                return deleteQuiz(data.quizId, session.id);
            case 'getQuizQuestions':
                return getQuizQuestions(data.quizId);
            case 'createQuizQuestion':
                return createQuizQuestion(data, session.id);
            case 'updateQuizQuestion':
                return updateQuizQuestion(data.questionId, data, session.id);
            case 'deleteQuizQuestion':
                return deleteQuizQuestion(data.questionId, session.id);
            case 'submitQuizAnswer':
                return submitQuizAnswer(data.userId, data.quizId, data.questionId, data.optionId);
            case 'completeQuiz':
                return completeQuiz(data.userId, data.quizId, data.score, data.percentage, data.passed);

            // === STATS, SETTINGS & LOGS ===
            case 'getStats':
                return getStats();
            case 'getSettings':
                return getSettings();
            case 'updateSettings':
                return updateSettings(data, session.id);
            case 'getActivityLogs':
                return getActivityLogs();

            default:
                return sendResponse(false, 'Unknown action: ' + action, null, 400);
        }
    } catch (error) {
        console.error('API execution error:', error);
        return sendResponse(false, 'Server error: ' + error.message, null, 500);
    }
}

// GET request handler (Health check & basic status)
function doGet(e) {
    const action = e.parameter ? e.parameter.action : null;
    if (!action) {
        return sendResponse(true, 'Google Apps Script API is running.', {
            version: SCRIPT_VERSION,
            status: 'READY'
        });
    }
    // Delegate to doPost logic for GET queries
    return doPost(e);
}

// Helper function to send standard JSON response
function sendResponse(success, message, data, statusCode) {
    const response = {
        success: success,
        error: !success ? message : null,
        message: success ? message : null,
        data: data !== undefined ? data : null,
        timestamp: new Date().toISOString()
    };

    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

// Create and store session token
function createSession(user) {
    const token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    const session = {
        id: user.id,
        username: user.username,
        displayName: user.displayName || user.display_name || user.username,
        role: user.role,
        status: user.status,
        createdAt: new Date().toISOString()
    };
    const key = 'session_' + token;

    try {
        CacheService.getScriptCache().put(key, JSON.stringify(session), SESSION_TTL_SECONDS);
        PropertiesService.getScriptProperties().setProperty(key, JSON.stringify(session));
    } catch (err) {
        console.warn('Session caching note:', err);
    }
    return token;
}

// Verify token and retrieve session
function verifyToken(token) {
    if (!token) return null;

    const key = 'session_' + token;
    let raw = null;
    try {
        raw = CacheService.getScriptCache().get(key);
    } catch (_) {}

    if (!raw) {
        try {
            raw = PropertiesService.getScriptProperties().getProperty(key);
            if (raw) {
                CacheService.getScriptCache().put(key, raw, SESSION_TTL_SECONDS);
            }
        } catch (_) {}
    }

    if (!raw) return null;

    try {
        const session = JSON.parse(raw);
        const createdAt = new Date(session.createdAt).getTime();
        if (!createdAt || Date.now() - createdAt > SESSION_TTL_SECONDS * 1000) {
            try {
                PropertiesService.getScriptProperties().deleteProperty(key);
            } catch (_) {}
            return null;
        }

        if (session.status !== 'ACTIVE' || !isUserStillActive(session.id)) {
            return null;
        }
        return session;
    } catch (err) {
        return null;
    }
}

// Check if user is still active in users sheet
function isUserStillActive(userId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return false;
    const sheet = ss.getSheetByName('users');
    if (!sheet) return false;

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
            return data[i][5] === 'ACTIVE';
        }
    }
    return false;
}

// SHA-256 password hasher with salt
function hashPassword(password) {
    return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + PASSWORD_SALT);
}

// Convert byte array to hexadecimal string
function bytesToString(bytes) {
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
        result += ('0' + (bytes[i] & 0xFF).toString(16)).slice(-2);
    }
    return result;
}
