// Google Apps Script - Chapter and Content Functions

function getChapters() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chapters');
    const data = sheet.getDataRange().getValues();
    const chapters = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        chapters.push({
            id: row[0],
            partId: row[1],
            number: row[2],
            title: {
                en: row[3],
                bn: row[4]
            },
            description: {
                en: row[5],
                bn: row[6]
            },
            order: row[7],
            status: row[8]
        });
    }
    
    return sendResponse(true, 'Chapters retrieved', chapters);
}

function getChapter(chapterId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chapters');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] === chapterId) {
            return sendResponse(true, 'Chapter found', {
                id: row[0],
                number: row[2],
                title: {
                    en: row[3],
                    bn: row[4]
                },
                description: {
                    en: row[5],
                    bn: row[6]
                }
            });
        }
    }
    
    return sendResponse(false, 'Chapter not found', null, 404);
}

function getChapterContent(chapterId) {
    // Get chapter info
    const chapterResponse = getChapter(chapterId);
    if (!chapterResponse.success) {
        return chapterResponse;
    }
    
    const chapter = chapterResponse.data;
    
    // Get sections and content
    const contentSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('content');
    const contentData = contentSheet.getDataRange().getValues();
    const sections = [];
    
    for (let i = 1; i < contentData.length; i++) {
        const row = contentData[i];
        if (row[1] === chapterId) { // section_id matches chapter
            sections.push({
                id: row[0],
                title: {
                    en: row[3],
                    bn: row[4]
                },
                content: {
                    en: row[5],
                    bn: row[6]
                },
                type: row[2]
            });
        }
    }
    
    chapter.sections = sections;
    return sendResponse(true, 'Chapter content retrieved', chapter);
}
