// Google Apps Script - Chapters, Sections & Content Management

function getChapters(includeDrafts) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);
    const sheet = ss.getSheetByName('chapters');
    if (!sheet) return sendResponse(false, 'Chapters table not found.', null, 500);

    const data = sheet.getDataRange().getValues();
    const chapters = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0]) continue;
        const status = row[8] || 'PUBLISHED';
        if (!includeDrafts && status !== 'PUBLISHED') continue;

        chapters.push({
            id: row[0],
            partId: row[1] || 'fundamentals',
            number: Number(row[2] || i),
            title: {
                en: row[3] || '',
                bn: row[4] || row[3] || ''
            },
            description: {
                en: row[5] || '',
                bn: row[6] || row[5] || ''
            },
            order: Number(row[7] || row[2] || i),
            status: status
        });
    }

    chapters.sort((a, b) => a.order - b.order);
    
    return sendResponse(true, 'Chapters retrieved', chapters);
}

function getChapter(chapterId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chapters');
    if (!sheet) return sendResponse(false, 'Chapters table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] === chapterId) {
            return sendResponse(true, 'Chapter found', {
                id: row[0],
                partId: row[1] || 'fundamentals',
                number: Number(row[2] || 1),
                title: {
                    en: row[3] || '',
                    bn: row[4] || row[3] || ''
                },
                description: {
                    en: row[5] || '',
                    bn: row[6] || row[5] || ''
                },
                order: Number(row[7] || 1),
                status: row[8] || 'PUBLISHED'
            });
        }
    }
    
    return sendResponse(false, 'Chapter not found.', null, 404);
}

function getChapterContent(chapterId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);

    const chapterSheet = ss.getSheetByName('chapters');
    const sectionSheet = ss.getSheetByName('sections');
    const contentSheet = ss.getSheetByName('content');

    if (!chapterSheet || !sectionSheet || !contentSheet) {
        return sendResponse(false, 'Content tables missing.', null, 500);
    }

    const chapterData = chapterSheet.getDataRange().getValues();
    let chapter = null;

    for (let i = 1; i < chapterData.length; i++) {
        const row = chapterData[i];
        if (row[0] === chapterId) {
            chapter = {
                id: row[0],
                partId: row[1] || 'fundamentals',
                number: Number(row[2] || 1),
                title: { en: row[3] || '', bn: row[4] || row[3] || '' },
                description: { en: row[5] || '', bn: row[6] || row[5] || '' },
                order: Number(row[7] || 1),
                status: row[8] || 'PUBLISHED',
                sections: []
            };
            break;
        }
    }

    if (!chapter) {
        return sendResponse(false, 'Chapter not found.', null, 404);
    }

    const sectionData = sectionSheet.getDataRange().getValues();
    const contentData = contentSheet.getDataRange().getValues();

    for (let i = 1; i < sectionData.length; i++) {
        const row = sectionData[i];
        if (row[1] === chapterId && (!row[5] || row[5] === 'PUBLISHED')) {
            chapter.sections.push({
                id: row[0],
                chapterId: row[1],
                title: { en: row[2] || '', bn: row[3] || row[2] || '' },
                order: Number(row[4] || 1),
                status: row[5] || 'PUBLISHED',
                blocks: []
            });
        }
    }

    chapter.sections.sort((a, b) => a.order - b.order);
    const sectionMap = {};
    chapter.sections.forEach(sec => { sectionMap[sec.id] = sec; });

    for (let i = 1; i < contentData.length; i++) {
        const row = contentData[i];
        const section = sectionMap[row[1]];
        if (!section || (row[8] && row[8] !== 'PUBLISHED')) continue;

        section.blocks.push({
            id: row[0],
            sectionId: row[1],
            type: row[2] || 'paragraph',
            title: { en: row[3] || '', bn: row[4] || row[3] || '' },
            content: { en: row[5] || '', bn: row[6] || row[5] || '' },
            order: Number(row[7] || 1),
            status: row[8] || 'PUBLISHED'
        });
    }

    chapter.sections.forEach(section => {
        section.blocks.sort((a, b) => a.order - b.order);
        section.content = {
            en: section.blocks.map(b => b.content.en || '').join('\n'),
            bn: section.blocks.map(b => b.content.bn || '').join('\n')
        };
    });

    return sendResponse(true, 'Chapter content retrieved', chapter);
}

function createChapter(data, adminId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chapters');
    if (!sheet) return sendResponse(false, 'Chapters table not found.', null, 500);
    const id = Utilities.getUuid();
    const now = new Date();
    const number = Number(data.number || data.chapterNumber || 1);
    const order = Number(data.order || data.orderNo || number);

    sheet.appendRow([
        id,
        data.partId || 'fundamentals',
        number,
        data.titleEn || data.title?.en || '',
        data.titleBn || data.title?.bn || data.titleEn || '',
        data.descriptionEn || data.description?.en || '',
        data.descriptionBn || data.description?.bn || data.descriptionEn || '',
        order,
        data.status || 'PUBLISHED',
        now,
        now
    ]);

    logActivity(adminId || 'system', 'CHAPTER_CREATED', 'Created chapter: ' + (data.titleEn || 'New Chapter'));
    return sendResponse(true, 'Chapter created', { id: id });
}

function updateChapter(chapterId, data, adminId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chapters');
    if (!sheet) return sendResponse(false, 'Chapters table not found.', null, 500);
    const values = sheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i++) {
        if (values[i][0] === chapterId) {
            if (data.partId !== undefined) sheet.getRange(i + 1, 2).setValue(data.partId);
            if (data.number !== undefined) sheet.getRange(i + 1, 3).setValue(Number(data.number));
            if (data.titleEn !== undefined) sheet.getRange(i + 1, 4).setValue(data.titleEn);
            if (data.titleBn !== undefined) sheet.getRange(i + 1, 5).setValue(data.titleBn);
            if (data.descriptionEn !== undefined) sheet.getRange(i + 1, 6).setValue(data.descriptionEn);
            if (data.descriptionBn !== undefined) sheet.getRange(i + 1, 7).setValue(data.descriptionBn);
            if (data.order !== undefined) sheet.getRange(i + 1, 8).setValue(Number(data.order));
            if (data.status !== undefined) sheet.getRange(i + 1, 9).setValue(data.status);
            sheet.getRange(i + 1, 11).setValue(new Date());

            logActivity(adminId || 'system', 'CHAPTER_UPDATED', 'Updated chapter: ' + values[i][3]);
            return sendResponse(true, 'Chapter updated successfully.', null);
        }
    }
    return sendResponse(false, 'Chapter not found.', null, 404);
}

function deleteChapter(chapterId, adminId) {
    return updateChapter(chapterId, { status: 'DRAFT' }, adminId);
}

function getSections(chapterId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('sections');
    if (!sheet) return sendResponse(false, 'Sections table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    const sections = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!chapterId || row[1] === chapterId) {
            sections.push({
                id: row[0],
                chapterId: row[1],
                title: { en: row[2] || '', bn: row[3] || row[2] || '' },
                order: Number(row[4] || 1),
                status: row[5] || 'PUBLISHED'
            });
        }
    }

    sections.sort((a, b) => a.order - b.order);
    return sendResponse(true, 'Sections retrieved', sections);
}

function createSection(data, adminId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('sections');
    if (!sheet) return sendResponse(false, 'Sections table not found.', null, 500);
    const id = Utilities.getUuid();
    sheet.appendRow([
        id,
        data.chapterId,
        data.titleEn || data.title?.en || '',
        data.titleBn || data.title?.bn || data.titleEn || '',
        Number(data.order || data.orderNo || 1),
        data.status || 'PUBLISHED'
    ]);

    logActivity(adminId || 'system', 'SECTION_CREATED', 'Created section: ' + (data.titleEn || 'New Section'));
    return sendResponse(true, 'Section created', { id: id });
}

function updateSection(sectionId, data, adminId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('sections');
    if (!sheet) return sendResponse(false, 'Sections table not found.', null, 500);
    const values = sheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i++) {
        if (values[i][0] === sectionId) {
            if (data.chapterId !== undefined) sheet.getRange(i + 1, 2).setValue(data.chapterId);
            if (data.titleEn !== undefined) sheet.getRange(i + 1, 3).setValue(data.titleEn);
            if (data.titleBn !== undefined) sheet.getRange(i + 1, 4).setValue(data.titleBn);
            if (data.order !== undefined) sheet.getRange(i + 1, 5).setValue(Number(data.order));
            if (data.status !== undefined) sheet.getRange(i + 1, 6).setValue(data.status);

            logActivity(adminId || 'system', 'SECTION_UPDATED', 'Updated section ID: ' + sectionId);
            return sendResponse(true, 'Section updated successfully.', null);
        }
    }
    return sendResponse(false, 'Section not found.', null, 404);
}

function deleteSection(sectionId, adminId) {
    return updateSection(sectionId, { status: 'DRAFT' }, adminId);
}

function createContent(data, adminId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('content');
    if (!sheet) return sendResponse(false, 'Content table not found.', null, 500);
    const id = Utilities.getUuid();
    sheet.appendRow([
        id,
        data.sectionId,
        data.contentType || data.type || 'paragraph',
        data.titleEn || data.title?.en || '',
        data.titleBn || data.title?.bn || data.titleEn || '',
        data.contentEn || data.content?.en || '',
        data.contentBn || data.content?.bn || data.contentEn || '',
        Number(data.order || data.orderNo || 1),
        data.status || 'PUBLISHED'
    ]);

    logActivity(adminId || 'system', 'CONTENT_CREATED', 'Added content block to section: ' + data.sectionId);
    return sendResponse(true, 'Content created', { id: id });
}

function updateContent(contentId, data, adminId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('content');
    if (!sheet) return sendResponse(false, 'Content table not found.', null, 500);
    const values = sheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i++) {
        if (values[i][0] === contentId) {
            if (data.sectionId !== undefined) sheet.getRange(i + 1, 2).setValue(data.sectionId);
            if (data.contentType !== undefined || data.type !== undefined) sheet.getRange(i + 1, 3).setValue(data.contentType || data.type);
            if (data.titleEn !== undefined) sheet.getRange(i + 1, 4).setValue(data.titleEn);
            if (data.titleBn !== undefined) sheet.getRange(i + 1, 5).setValue(data.titleBn);
            if (data.contentEn !== undefined) sheet.getRange(i + 1, 6).setValue(data.contentEn);
            if (data.contentBn !== undefined) sheet.getRange(i + 1, 7).setValue(data.contentBn);
            if (data.order !== undefined) sheet.getRange(i + 1, 8).setValue(Number(data.order));
            if (data.status !== undefined) sheet.getRange(i + 1, 9).setValue(data.status);

            logActivity(adminId || 'system', 'CONTENT_UPDATED', 'Updated content ID: ' + contentId);
            return sendResponse(true, 'Content updated successfully.', null);
        }
    }
    return sendResponse(false, 'Content not found.', null, 404);
}

function deleteContent(contentId, adminId) {
    return updateContent(contentId, { status: 'DRAFT' }, adminId);
}
