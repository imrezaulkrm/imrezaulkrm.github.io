// Google Apps Script - Statistics

function getStats() {
    const userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const chapterSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chapters');
    const questionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('questions');
    
    const userData = userSheet.getDataRange().getValues();
    const chapterData = chapterSheet.getDataRange().getValues();
    const questionData = questionSheet.getDataRange().getValues();
    
    let totalUsers = 0;
    let activeUsers = 0;
    
    for (let i = 1; i < userData.length; i++) {
        if (userData[i][0]) totalUsers++;
        if (userData[i][5] === 'ACTIVE') activeUsers++;
    }
    
    let totalChapters = 0;
    for (let i = 1; i < chapterData.length; i++) {
        if (chapterData[i][0]) totalChapters++;
    }
    
    let pendingQuestions = 0;
    for (let i = 1; i < questionData.length; i++) {
        if (questionData[i][8] === 'PENDING') pendingQuestions++;
    }
    
    const recentActivity = [
        { description: 'System started', timestamp: new Date() }
    ];
    
    return sendResponse(true, 'Stats retrieved', {
        totalUsers: totalUsers,
        activeUsers: activeUsers,
        totalChapters: totalChapters,
        pendingQuestions: pendingQuestions,
        recentActivity: recentActivity
    });
}
