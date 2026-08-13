// Google Apps Script - Progress and Learning Functions

function getProgress(userId) {
    const progressSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('progress');
    const progressData = progressSheet.getDataRange().getValues();
    
    let chaptersCompleted = 0;
    let totalChapters = 0;
    let quizTotal = 0;
    let quizCount = 0;
    let currentChapterId = null;
    let currentProgress = 0;
    
    for (let i = 1; i < progressData.length; i++) {
        const row = progressData[i];
        if (row[1] === userId) { // user_id
            if (row[5]) chaptersCompleted++;
            totalChapters++;
            currentChapterId = row[2]; // chapter_id
            currentProgress = row[3]; // progress_percentage
        }
    }
    
    // Get quiz average
    const quizSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('quiz_attempts');
    const quizData = quizSheet.getDataRange().getValues();
    
    for (let i = 1; i < quizData.length; i++) {
        const row = quizData[i];
        if (row[1] === userId) { // user_id
            quizTotal += row[4]; // percentage
            quizCount++;
        }
    }
    
    const quizAverage = quizCount > 0 ? Math.round(quizTotal / quizCount) : 0;
    
    // Get bookmarks and questions count
    const bookmarkSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('bookmarks');
    const questionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('questions');
    
    let bookmarkCount = 0;
    let questionCount = 0;
    
    const bookmarkData = bookmarkSheet.getDataRange().getValues();
    for (let i = 1; i < bookmarkData.length; i++) {
        if (bookmarkData[i][1] === userId) bookmarkCount++;
    }
    
    const questionData = questionSheet.getDataRange().getValues();
    for (let i = 1; i < questionData.length; i++) {
        if (questionData[i][1] === userId) questionCount++;
    }
    
    return sendResponse(true, 'Progress retrieved', {
        chaptersCompleted: chaptersCompleted,
        totalChapters: totalChapters,
        quizAverage: quizAverage,
        bookmarkCount: bookmarkCount,
        questionCount: questionCount,
        currentChapterId: currentChapterId,
        currentProgress: currentProgress,
        overallProgress: totalChapters > 0 ? Math.round((chaptersCompleted / totalChapters) * 100) : 0
    });
}

function updateProgress(userId, chapterId, progress) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('progress');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[1] === userId && row[2] === chapterId) {
            sheet.getRange(i + 1, 4).setValue(progress); // progress_percentage
            sheet.getRange(i + 1, 7).setValue(new Date()); // updated_at
            return sendResponse(true, 'Progress updated', null);
        }
    }
    
    // Create new progress record if not found
    sheet.appendRow([
        Utilities.getUuid(),
        userId,
        chapterId,
        progress,
        '',
        false,
        new Date()
    ]);
    
    return sendResponse(true, 'Progress created', null);
}

// Bookmarks
function getBookmarks(userId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('bookmarks');
    const data = sheet.getDataRange().getValues();
    const bookmarks = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[1] === userId) {
            bookmarks.push({
                id: row[0],
                chapterId: row[2],
                sectionId: row[3],
                createdAt: row[4]
            });
        }
    }
    
    return sendResponse(true, 'Bookmarks retrieved', bookmarks);
}

function addBookmark(userId, chapterId, sectionId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('bookmarks');
    sheet.appendRow([
        Utilities.getUuid(),
        userId,
        chapterId,
        sectionId,
        new Date()
    ]);
    
    return sendResponse(true, 'Bookmark added', null);
}

function removeBookmark(bookmarkId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('bookmarks');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === bookmarkId) {
            sheet.deleteRow(i + 1);
            return sendResponse(true, 'Bookmark removed', null);
        }
    }
    
    return sendResponse(false, 'Bookmark not found', null, 404);
}

// Notes
function getNotes(userId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('notes');
    const data = sheet.getDataRange().getValues();
    const notes = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[1] === userId) {
            notes.push({
                id: row[0],
                chapterId: row[2],
                sectionId: row[3],
                content: row[4],
                createdAt: row[5]
            });
        }
    }
    
    return sendResponse(true, 'Notes retrieved', notes);
}

function addNote(userId, chapterId, sectionId, content) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('notes');
    sheet.appendRow([
        Utilities.getUuid(),
        userId,
        chapterId,
        sectionId,
        content,
        new Date(),
        new Date()
    ]);
    
    return sendResponse(true, 'Note added', null);
}

function updateNote(noteId, content) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('notes');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === noteId) {
            sheet.getRange(i + 1, 5).setValue(content); // content
            sheet.getRange(i + 1, 7).setValue(new Date()); // updated_at
            return sendResponse(true, 'Note updated', null);
        }
    }
    
    return sendResponse(false, 'Note not found', null, 404);
}

function deleteNote(noteId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('notes');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === noteId) {
            sheet.deleteRow(i + 1);
            return sendResponse(true, 'Note deleted', null);
        }
    }
    
    return sendResponse(false, 'Note not found', null, 404);
}
