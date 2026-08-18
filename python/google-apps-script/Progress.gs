// Google Apps Script - Progress, Unlocking, Bookmarks & Notes

function getProgress(userId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);

    const progressSheet = ss.getSheetByName('progress');
    const chapterSheet = ss.getSheetByName('chapters');
    const quizSheet = ss.getSheetByName('quiz_attempts');
    const bookmarkSheet = ss.getSheetByName('bookmarks');
    const questionSheet = ss.getSheetByName('questions');

    if (!progressSheet || !chapterSheet) {
        return sendResponse(false, 'Tables missing.', null, 500);
    }

    const progressData = progressSheet.getDataRange().getValues();
    const chapterData = chapterSheet.getDataRange().getValues();
    
    let chaptersCompleted = 0;
    const completedChapters = [];
    let currentChapterId = null;
    let currentProgress = 0;
    let latestUpdatedAt = null;

    for (let i = 1; i < progressData.length; i++) {
        const row = progressData[i];
        if (row[1] === userId) {
            const isDone = row[5] === true || row[5] === 'TRUE';
            if (isDone) {
                chaptersCompleted++;
                completedChapters.push(row[2]);
            }
            const updateTime = new Date(row[6]).getTime();
            if (!latestUpdatedAt || updateTime > latestUpdatedAt) {
                latestUpdatedAt = updateTime;
                currentChapterId = row[2];
                currentProgress = Number(row[3] || 0);
            }
        }
    }

    // Quiz average calculation
    let quizTotal = 0;
    let quizCount = 0;
    if (quizSheet) {
        const quizData = quizSheet.getDataRange().getValues();
        for (let i = 1; i < quizData.length; i++) {
            if (quizData[i][1] === userId) {
                quizTotal += Number(quizData[i][5] || 0); // percentage column
                quizCount++;
            }
        }
    }
    const quizAverage = quizCount > 0 ? Math.round(quizTotal / quizCount) : 0;

    // Bookmarks and questions count
    let bookmarkCount = 0;
    if (bookmarkSheet) {
        const bookmarkData = bookmarkSheet.getDataRange().getValues();
        for (let i = 1; i < bookmarkData.length; i++) {
            if (bookmarkData[i][1] === userId) bookmarkCount++;
        }
    }

    let questionCount = 0;
    if (questionSheet) {
        const questionData = questionSheet.getDataRange().getValues();
        for (let i = 1; i < questionData.length; i++) {
            if (questionData[i][1] === userId) questionCount++;
        }
    }

    // Get published chapters in order
    const publishedChapters = [];
    for (let i = 1; i < chapterData.length; i++) {
        if (chapterData[i][0] && (!chapterData[i][8] || chapterData[i][8] === 'PUBLISHED')) {
            publishedChapters.push({
                id: chapterData[i][0],
                number: Number(chapterData[i][2] || i),
                order: Number(chapterData[i][7] || chapterData[i][2] || i)
            });
        }
    }
    publishedChapters.sort((a, b) => a.order - b.order);

    // Compute unlocked chapters
    const unlockedChapters = [];
    for (let i = 0; i < publishedChapters.length; i++) {
        if (i === 0 || completedChapters.indexOf(publishedChapters[i - 1].id) !== -1) {
            unlockedChapters.push(publishedChapters[i].id);
        }
    }

    if (!currentChapterId && publishedChapters.length > 0) {
        currentChapterId = publishedChapters[0].id;
        currentProgress = 0;
    }

    return sendResponse(true, 'Progress retrieved', {
        chaptersCompleted: chaptersCompleted,
        totalChapters: publishedChapters.length,
        quizAverage: quizAverage,
        bookmarkCount: bookmarkCount,
        questionCount: questionCount,
        currentChapterId: currentChapterId,
        currentProgress: currentProgress,
        currentChapterUnlocked: unlockedChapters.indexOf(currentChapterId) !== -1,
        completedChapters: completedChapters,
        unlockedChapters: unlockedChapters,
        overallProgress: publishedChapters.length > 0 ? Math.round((chaptersCompleted / publishedChapters.length) * 100) : 0
    });
}

// Check if a specific chapter is unlocked for a user
function isChapterUnlockedForUser(userId, chapterId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return true;

    const chapterSheet = ss.getSheetByName('chapters');
    const progressSheet = ss.getSheetByName('progress');
    if (!chapterSheet) return true;

    const chapterData = chapterSheet.getDataRange().getValues();
    const published = [];
    for (let i = 1; i < chapterData.length; i++) {
        if (chapterData[i][0] && (!chapterData[i][8] || chapterData[i][8] === 'PUBLISHED')) {
            published.push({
                id: chapterData[i][0],
                order: Number(chapterData[i][7] || chapterData[i][2] || i)
            });
        }
    }
    published.sort((a, b) => a.order - b.order);

    if (published.length === 0 || published[0].id === chapterId) {
        return true; // First chapter is always unlocked
    }

    const targetIndex = published.findIndex(c => c.id === chapterId);
    if (targetIndex === -1) return true;
    if (targetIndex === 0) return true;

    const previousChapterId = published[targetIndex - 1].id;

    if (!progressSheet) return false;
    const progressData = progressSheet.getDataRange().getValues();
    for (let i = 1; i < progressData.length; i++) {
        const row = progressData[i];
        if (row[1] === userId && row[2] === previousChapterId) {
            return row[5] === true || row[5] === 'TRUE';
        }
    }

    return false;
}

function updateProgress(userId, chapterId, progress, sectionId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('progress');
    if (!sheet) return sendResponse(false, 'Progress table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    const now = new Date();
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[1] === userId && row[2] === chapterId) {
            sheet.getRange(i + 1, 4).setValue(Math.min(100, Math.max(0, Number(progress)))); // progress_percentage
            if (sectionId) sheet.getRange(i + 1, 5).setValue(sectionId); // last_position
            sheet.getRange(i + 1, 7).setValue(now); // updated_at
            return sendResponse(true, 'Progress updated', null);
        }
    }
    
    // Create new progress record
    sheet.appendRow([
        Utilities.getUuid(),
        userId,
        chapterId,
        Math.min(100, Math.max(0, Number(progress))),
        sectionId || '',
        false,
        now
    ]);
    
    return sendResponse(true, 'Progress created', null);
}

// === BOOKMARKS ===

function getBookmarks(userId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('bookmarks');
    if (!sheet) return sendResponse(false, 'Bookmarks table not found.', null, 500);
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
    if (!sheet) return sendResponse(false, 'Bookmarks table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][1] === userId && data[i][2] === chapterId && data[i][3] === sectionId) {
            return sendResponse(true, 'Bookmark already exists', { id: data[i][0] });
        }
    }

    const id = Utilities.getUuid();
    sheet.appendRow([
        id,
        userId,
        chapterId,
        sectionId || '',
        new Date()
    ]);
    
    return sendResponse(true, 'Bookmark added', { id: id });
}

function removeBookmark(bookmarkId, requesterId, isAdmin) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('bookmarks');
    if (!sheet) return sendResponse(false, 'Bookmarks table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === bookmarkId) {
            if (!isAdmin && data[i][1] !== requesterId) {
                return sendResponse(false, 'Permission denied.', null, 403);
            }
            sheet.deleteRow(i + 1);
            return sendResponse(true, 'Bookmark removed', null);
        }
    }
    
    return sendResponse(false, 'Bookmark not found.', null, 404);
}

// === PERSONAL NOTES ===

function getNotes(userId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('notes');
    if (!sheet) return sendResponse(false, 'Notes table not found.', null, 500);
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
                createdAt: row[5],
                updatedAt: row[6]
            });
        }
    }
    
    return sendResponse(true, 'Notes retrieved', notes);
}

function addNote(userId, chapterId, sectionId, content) {
    if (!content || !content.trim()) {
        return sendResponse(false, 'Note content cannot be empty.', null, 400);
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('notes');
    if (!sheet) return sendResponse(false, 'Notes table not found.', null, 500);
    const id = Utilities.getUuid();
    const now = new Date();

    sheet.appendRow([
        id,
        userId,
        chapterId,
        sectionId || '',
        content.trim(),
        now,
        now
    ]);
    
    return sendResponse(true, 'Note added successfully', { id: id });
}

function updateNote(noteId, content, requesterId, isAdmin) {
    if (!content || !content.trim()) {
        return sendResponse(false, 'Note content cannot be empty.', null, 400);
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('notes');
    if (!sheet) return sendResponse(false, 'Notes table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === noteId) {
            if (!isAdmin && data[i][1] !== requesterId) {
                return sendResponse(false, 'Permission denied.', null, 403);
            }
            sheet.getRange(i + 1, 5).setValue(content.trim());
            sheet.getRange(i + 1, 7).setValue(new Date());
            return sendResponse(true, 'Note updated', null);
        }
    }
    
    return sendResponse(false, 'Note not found.', null, 404);
}

function deleteNote(noteId, requesterId, isAdmin) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('notes');
    if (!sheet) return sendResponse(false, 'Notes table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === noteId) {
            if (!isAdmin && data[i][1] !== requesterId) {
                return sendResponse(false, 'Permission denied.', null, 403);
            }
            sheet.deleteRow(i + 1);
            return sendResponse(true, 'Note deleted', null);
        }
    }
    
    return sendResponse(false, 'Note not found.', null, 404);
}
