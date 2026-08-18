// Google Apps Script - Statistics, Settings & Activity Logs

function getStats() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);

    const userSheet = ss.getSheetByName('users');
    const chapterSheet = ss.getSheetByName('chapters');
    const questionSheet = ss.getSheetByName('questions');
    const quizSheet = ss.getSheetByName('quiz_attempts');

    const userData = userSheet ? userSheet.getDataRange().getValues() : [];
    const chapterData = chapterSheet ? chapterSheet.getDataRange().getValues() : [];
    const questionData = questionSheet ? questionSheet.getDataRange().getValues() : [];
    const quizData = quizSheet ? quizSheet.getDataRange().getValues() : [];
    
    let totalUsers = 0;
    let activeUsers = 0;
    for (let i = 1; i < userData.length; i++) {
        if (userData[i][0]) {
            totalUsers++;
            if (userData[i][5] === 'ACTIVE') activeUsers++;
        }
    }
    
    let totalChapters = 0;
    let publishedChapters = 0;
    for (let i = 1; i < chapterData.length; i++) {
        if (chapterData[i][0]) {
            totalChapters++;
            if (!chapterData[i][8] || chapterData[i][8] === 'PUBLISHED') publishedChapters++;
        }
    }
    
    let pendingQuestions = 0;
    let totalQuestions = 0;
    for (let i = 1; i < questionData.length; i++) {
        if (questionData[i][0]) {
            totalQuestions++;
            if (questionData[i][8] === 'PENDING') pendingQuestions++;
        }
    }

    let quizScoreSum = 0;
    let quizAttemptCount = 0;
    for (let i = 1; i < quizData.length; i++) {
        if (quizData[i][0]) {
            quizScoreSum += Number(quizData[i][5] || 0); // percentage column
            quizAttemptCount++;
        }
    }
    const quizAverage = quizAttemptCount > 0 ? Math.round(quizScoreSum / quizAttemptCount) : 0;
    
    const recentActivity = getRecentActivity(15);
    
    return sendResponse(true, 'Stats retrieved', {
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        totalChapters: totalChapters,
        publishedChapters: publishedChapters,
        pendingQuestions: pendingQuestions,
        totalQuestions: totalQuestions,
        quizAverage: quizAverage,
        quizAttempts: quizAttemptCount,
        recentActivity: recentActivity
    });
}

function getSettings() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);

    const sheet = ss.getSheetByName('settings');
    if (!sheet) return sendResponse(true, 'Settings retrieved', { DEFAULT_PASS_MARK: 70 });

    const data = sheet.getDataRange().getValues();
    const settings = {};
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            settings[data[i][0]] = data[i][1];
        }
    }

    return sendResponse(true, 'Settings retrieved', settings);
}

function updateSettings(settings, adminId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);

    let sheet = ss.getSheetByName('settings');
    if (!sheet) {
        sheet = ss.insertSheet('settings');
        sheet.appendRow(['setting_key', 'setting_value', 'description', 'updated_at']);
    }

    const data = sheet.getDataRange().getValues();
    const now = new Date();

    Object.keys(settings || {}).forEach(key => {
        let updated = false;
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === key) {
                sheet.getRange(i + 1, 2).setValue(String(settings[key]));
                sheet.getRange(i + 1, 4).setValue(now);
                updated = true;
                break;
            }
        }
        if (!updated) {
            sheet.appendRow([key, String(settings[key]), '', now]);
        }
    });

    logActivity(adminId || 'admin', 'SETTINGS_UPDATED', 'Platform settings updated');
    return sendResponse(true, 'Settings saved successfully', settings);
}

function logActivity(userId, action, description) {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        if (!ss) return;
        let sheet = ss.getSheetByName('activity_logs');
        if (!sheet) {
            sheet = ss.insertSheet('activity_logs');
            sheet.appendRow(['id', 'user_id', 'action', 'description', 'timestamp']);
        }
        sheet.appendRow([
            Utilities.getUuid(),
            userId || 'system',
            action || 'ACTION',
            description || '',
            new Date()
        ]);
    } catch (err) {
        console.warn('Logging activity note:', err);
    }
}

function getActivityLogs() {
    return sendResponse(true, 'Activity logs retrieved', getRecentActivity(50));
}

function getRecentActivity(limit) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return [];
    const sheet = ss.getSheetByName('activity_logs');
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    const logs = [];
    for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {
            logs.push({
                id: data[i][0],
                userId: data[i][1],
                action: data[i][2],
                description: data[i][3],
                timestamp: data[i][4]
            });
        }
    }

    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return logs.slice(0, limit || 20);
}
