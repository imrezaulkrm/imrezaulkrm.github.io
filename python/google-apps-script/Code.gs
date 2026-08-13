// Google Apps Script Backend - Main Script
// Deploy as a Web App

// Configuration
const SCRIPT_VERSION = '1.0.0';
const PASSWORD_SALT = 'python_journey_2024'; // Change this to a secure value

// Main request handler
function doPost(e) {
    try {
        const action = e.parameter.action;
        const data = e.postData ? JSON.parse(e.postData.contents) : {};
        
        // Verify authentication (except for login)
        if (action !== 'login' && !verifyToken(data.token || '')) {
            return sendResponse(false, 'Unauthorized', null, 401);
        }
        
        switch(action) {
            // Authentication
            case 'login':
                return login(data.username, data.password);
            
            // Users
            case 'getUser':
                return getUser(data.userId);
            case 'updatePassword':
                return updatePassword(data.userId, data.newPassword);
            
            // Chapters
            case 'getChapters':
                return getChapters();
            case 'getChapter':
                return getChapter(data.chapterId);
            case 'getChapterContent':
                return getChapterContent(data.chapterId);
            
            // Progress
            case 'getProgress':
                return getProgress(data.userId);
            case 'updateProgress':
                return updateProgress(data.userId, data.chapterId, data.progress);
            
            // Bookmarks
            case 'getBookmarks':
                return getBookmarks(data.userId);
            case 'addBookmark':
                return addBookmark(data.userId, data.chapterId, data.sectionId);
            case 'removeBookmark':
                return removeBookmark(data.bookmarkId);
            
            // Notes
            case 'getNotes':
                return getNotes(data.userId);
            case 'addNote':
                return addNote(data.userId, data.chapterId, data.sectionId, data.content);
            case 'updateNote':
                return updateNote(data.noteId, data.content);
            case 'deleteNote':
                return deleteNote(data.noteId);
            
            // Questions
            case 'getQuestions':
                return getQuestions(data.userId);
            case 'submitQuestion':
                return submitQuestion(data.userId, data.chapterId, data.sectionId, data.questionText, data.understanding);
            case 'getPendingQuestions':
                return getPendingQuestions();
            case 'answerQuestion':
                return answerQuestion(data.questionId, data.answer);
            
            // Quizzes
            case 'getQuiz':
                return getQuiz(data.chapterId);
            case 'submitQuizAnswer':
                return submitQuizAnswer(data.userId, data.quizId, data.questionId, data.optionId);
            case 'completeQuiz':
                return completeQuiz(data.userId, data.quizId, data.score, data.percentage, data.passed);
            
            // Admin
            case 'createUser':
                return createUser(data.username, data.displayName, data.password, data.role);
            case 'getUsers':
                return getUsers();
            case 'updateUser':
                return updateUser(data.userId, data);
            case 'deleteUser':
                return deleteUser(data.userId);
            
            // Stats
            case 'getStats':
                return getStats();
            
            default:
                return sendResponse(false, 'Unknown action', null, 400);
        }
    } catch (error) {
        console.error('Error:', error);
        return sendResponse(false, error.toString(), null, 500);
    }
}

function doGet(e) {
    // For GET requests (can be empty or used for simple queries)
    return HtmlService.createHtmlOutput('Google Apps Script Web App is running.');
}

// Helper function to send responses
function sendResponse(success, message, data, statusCode = 200) {
    const response = {
        success: success,
        error: !success ? message : null,
        data: data,
        timestamp: new Date().toISOString()
    };
    
    return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
}

// Token verification (simple implementation)
function verifyToken(token) {
    // In production, implement proper token verification
    // For now, accept any non-empty token
    return token && token.length > 0;
}

// Hash password (simple implementation - use bcrypt in production)
function hashPassword(password) {
    return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + PASSWORD_SALT);
}

// Convert hash to string
function bytesToString(bytes) {
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
        result += ('0' + (bytes[i] & 0xFF).toString(16)).slice(-2);
    }
    return result;
}
