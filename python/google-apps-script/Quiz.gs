// Google Apps Script - Quizzes, Questions & Student Q&A

// === QUIZ FUNCTIONS ===

function getQuiz(chapterId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);

    const quizSheet = ss.getSheetByName('quizzes');
    const questionSheet = ss.getSheetByName('quiz_questions');
    const optionSheet = ss.getSheetByName('quiz_options');

    if (!quizSheet || !questionSheet || !optionSheet) {
        return sendResponse(false, 'Quiz tables missing.', null, 500);
    }

    const quizData = quizSheet.getDataRange().getValues();
    let quizId = null;
    let quizTitle = { en: '', bn: '' };
    let passPercentage = 70;

    for (let i = 1; i < quizData.length; i++) {
        if (quizData[i][1] === chapterId && (!quizData[i][5] || quizData[i][5] === 'PUBLISHED')) {
            quizId = quizData[i][0];
            quizTitle = { en: quizData[i][2] || '', bn: quizData[i][3] || quizData[i][2] || '' };
            passPercentage = Number(quizData[i][4] || 70);
            break;
        }
    }
    
    if (!quizId) {
        return sendResponse(false, 'Quiz not found for this chapter.', null, 404);
    }
    
    const questionData = questionSheet.getDataRange().getValues();
    const optionData = optionSheet.getDataRange().getValues();
    const questions = [];
    
    for (let i = 1; i < questionData.length; i++) {
        const row = questionData[i];
        if (row[1] === quizId) {
            const questionId = row[0];
            const options = [];
            let correctOptionIndex = 0;

            for (let j = 1; j < optionData.length; j++) {
                const optRow = optionData[j];
                if (optRow[1] === questionId) {
                    options.push({
                        id: optRow[0],
                        text: {
                            en: optRow[2] || '',
                            bn: optRow[3] || optRow[2] || ''
                        }
                    });
                    
                    if (optRow[4] === true || optRow[4] === 'TRUE') {
                        correctOptionIndex = options.length - 1;
                    }
                }
            }
            
            questions.push({
                id: questionId,
                order: Number(row[6] || 1),
                question: {
                    en: row[2] || '',
                    bn: row[3] || row[2] || ''
                },
                explanation: {
                    en: row[4] || '',
                    bn: row[5] || row[4] || ''
                },
                options: options,
                correctOptionIndex: correctOptionIndex
            });
        }
    }

    questions.sort((a, b) => a.order - b.order);
    
    return sendResponse(true, 'Quiz retrieved', {
        id: quizId,
        chapterId: chapterId,
        title: quizTitle,
        questions: questions,
        passPercentage: passPercentage
    });
}

function getQuizzes() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);

    const quizSheet = ss.getSheetByName('quizzes');
    const chapterSheet = ss.getSheetByName('chapters');
    if (!quizSheet) return sendResponse(false, 'Quizzes table missing.', null, 500);

    const quizData = quizSheet.getDataRange().getValues();
    const chapterData = chapterSheet ? chapterSheet.getDataRange().getValues() : [];
    const chapterMap = {};
    for (let i = 1; i < chapterData.length; i++) {
        chapterMap[chapterData[i][0]] = {
            number: chapterData[i][2],
            titleEn: chapterData[i][3],
            titleBn: chapterData[i][4]
        };
    }

    const quizzes = [];
    for (let i = 1; i < quizData.length; i++) {
        const row = quizData[i];
        if (row[0]) {
            quizzes.push({
                id: row[0],
                chapterId: row[1],
                chapterInfo: chapterMap[row[1]] || null,
                title: { en: row[2] || '', bn: row[3] || row[2] || '' },
                passPercentage: Number(row[4] || 70),
                status: row[5] || 'PUBLISHED'
            });
        }
    }

    return sendResponse(true, 'Quizzes retrieved', quizzes);
}

function createQuiz(data, adminId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('quizzes');
    if (!sheet) return sendResponse(false, 'Quizzes table not found.', null, 500);
    const id = Utilities.getUuid();
    sheet.appendRow([
        id,
        data.chapterId,
        data.titleEn || data.title?.en || '',
        data.titleBn || data.title?.bn || data.titleEn || '',
        Number(data.passPercentage || 70),
        data.status || 'PUBLISHED'
    ]);

    logActivity(adminId || 'system', 'QUIZ_CREATED', 'Created quiz for chapter: ' + data.chapterId);
    return sendResponse(true, 'Quiz created', { id: id });
}

function updateQuiz(quizId, data, adminId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('quizzes');
    if (!sheet) return sendResponse(false, 'Quizzes table not found.', null, 500);
    const values = sheet.getDataRange().getValues();

    for (let i = 1; i < values.length; i++) {
        if (values[i][0] === quizId) {
            if (data.chapterId !== undefined) sheet.getRange(i + 1, 2).setValue(data.chapterId);
            if (data.titleEn !== undefined) sheet.getRange(i + 1, 3).setValue(data.titleEn);
            if (data.titleBn !== undefined) sheet.getRange(i + 1, 4).setValue(data.titleBn);
            if (data.passPercentage !== undefined) sheet.getRange(i + 1, 5).setValue(Number(data.passPercentage));
            if (data.status !== undefined) sheet.getRange(i + 1, 6).setValue(data.status);

            logActivity(adminId || 'system', 'QUIZ_UPDATED', 'Updated quiz ID: ' + quizId);
            return sendResponse(true, 'Quiz updated', null);
        }
    }
    return sendResponse(false, 'Quiz not found.', null, 404);
}

function deleteQuiz(quizId, adminId) {
    return updateQuiz(quizId, { status: 'DRAFT' }, adminId);
}

function getQuizQuestions(quizId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const qSheet = ss.getSheetByName('quiz_questions');
    const oSheet = ss.getSheetByName('quiz_options');
    if (!qSheet || !oSheet) return sendResponse(false, 'Tables missing.', null, 500);

    const qData = qSheet.getDataRange().getValues();
    const oData = oSheet.getDataRange().getValues();
    const questions = [];

    for (let i = 1; i < qData.length; i++) {
        const row = qData[i];
        if (row[1] === quizId) {
            const qId = row[0];
            const options = [];
            let correctIndex = 0;

            for (let j = 1; j < oData.length; j++) {
                if (oData[j][1] === qId) {
                    options.push({
                        id: oData[j][0],
                        en: oData[j][2] || '',
                        bn: oData[j][3] || oData[j][2] || '',
                        isCorrect: oData[j][4] === true || oData[j][4] === 'TRUE'
                    });
                    if (oData[j][4] === true || oData[j][4] === 'TRUE') {
                        correctIndex = options.length - 1;
                    }
                }
            }

            questions.push({
                id: qId,
                quizId: row[1],
                questionEn: row[2] || '',
                questionBn: row[3] || row[2] || '',
                explanationEn: row[4] || '',
                explanationBn: row[5] || row[4] || '',
                order: Number(row[6] || 1),
                options: options,
                correctIndex: correctIndex
            });
        }
    }

    questions.sort((a, b) => a.order - b.order);
    return sendResponse(true, 'Quiz questions retrieved', questions);
}

function createQuizQuestion(data, adminId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const qSheet = ss.getSheetByName('quiz_questions');
    const oSheet = ss.getSheetByName('quiz_options');
    if (!qSheet || !oSheet) return sendResponse(false, 'Tables missing.', null, 500);

    const qId = Utilities.getUuid();
    qSheet.appendRow([
        qId,
        data.quizId,
        data.questionEn || '',
        data.questionBn || data.questionEn || '',
        data.explanationEn || '',
        data.explanationBn || data.explanationEn || '',
        Number(data.order || 1)
    ]);

    const options = data.options || [];
    for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const isCorrect = i === Number(data.correctIndex) || opt.isCorrect === true;
        oSheet.appendRow([
            Utilities.getUuid(),
            qId,
            typeof opt === 'string' ? opt : (opt.en || opt.text || ''),
            typeof opt === 'string' ? opt : (opt.bn || opt.en || opt.text || ''),
            isCorrect
        ]);
    }

    logActivity(adminId || 'system', 'QUESTION_CREATED', 'Added question to quiz: ' + data.quizId);
    return sendResponse(true, 'Quiz question created', { id: qId });
}

function updateQuizQuestion(questionId, data, adminId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const qSheet = ss.getSheetByName('quiz_questions');
    const oSheet = ss.getSheetByName('quiz_options');
    if (!qSheet || !oSheet) return sendResponse(false, 'Tables missing.', null, 500);

    const qData = qSheet.getDataRange().getValues();
    let found = false;

    for (let i = 1; i < qData.length; i++) {
        if (qData[i][0] === questionId) {
            if (data.questionEn !== undefined) qSheet.getRange(i + 1, 3).setValue(data.questionEn);
            if (data.questionBn !== undefined) qSheet.getRange(i + 1, 4).setValue(data.questionBn);
            if (data.explanationEn !== undefined) qSheet.getRange(i + 1, 5).setValue(data.explanationEn);
            if (data.explanationBn !== undefined) qSheet.getRange(i + 1, 6).setValue(data.explanationBn);
            if (data.order !== undefined) qSheet.getRange(i + 1, 7).setValue(Number(data.order));
            found = true;
            break;
        }
    }

    if (!found) return sendResponse(false, 'Quiz question not found.', null, 404);

    // If options are supplied, replace existing options
    if (data.options && Array.isArray(data.options)) {
        const oData = oSheet.getDataRange().getValues();
        for (let j = oData.length - 1; j >= 1; j--) {
            if (oData[j][1] === questionId) {
                oSheet.deleteRow(j + 1);
            }
        }
        for (let k = 0; k < data.options.length; k++) {
            const opt = data.options[k];
            const isCorrect = k === Number(data.correctIndex) || opt.isCorrect === true;
            oSheet.appendRow([
                Utilities.getUuid(),
                questionId,
                typeof opt === 'string' ? opt : (opt.en || opt.text || ''),
                typeof opt === 'string' ? opt : (opt.bn || opt.en || opt.text || ''),
                isCorrect
            ]);
        }
    }

    logActivity(adminId || 'system', 'QUESTION_UPDATED', 'Updated question ID: ' + questionId);
    return sendResponse(true, 'Quiz question updated', null);
}

function deleteQuizQuestion(questionId, adminId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const qSheet = ss.getSheetByName('quiz_questions');
    const oSheet = ss.getSheetByName('quiz_options');
    if (!qSheet) return sendResponse(false, 'Tables missing.', null, 500);

    const qData = qSheet.getDataRange().getValues();
    for (let i = 1; i < qData.length; i++) {
        if (qData[i][0] === questionId) {
            qSheet.deleteRow(i + 1);
            break;
        }
    }

    if (oSheet) {
        const oData = oSheet.getDataRange().getValues();
        for (let j = oData.length - 1; j >= 1; j--) {
            if (oData[j][1] === questionId) {
                oSheet.deleteRow(j + 1);
            }
        }
    }

    logActivity(adminId || 'system', 'QUESTION_DELETED', 'Deleted question ID: ' + questionId);
    return sendResponse(true, 'Quiz question deleted', null);
}

function completeQuiz(userId, quizId, score, percentage, passed) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);

    const attemptSheet = ss.getSheetByName('quiz_attempts');
    const questionSheet = ss.getSheetByName('quiz_questions');
    const quizSheet = ss.getSheetByName('quizzes');
    const progressSheet = ss.getSheetByName('progress');

    if (!attemptSheet || !quizSheet) {
        return sendResponse(false, 'Tables missing.', null, 500);
    }

    let total = 0;
    if (questionSheet) {
        const qData = questionSheet.getDataRange().getValues();
        for (let i = 1; i < qData.length; i++) {
            if (qData[i][1] === quizId) total++;
        }
    }

    const attemptData = attemptSheet.getDataRange().getValues();
    let attemptNumber = 1;
    for (let i = 1; i < attemptData.length; i++) {
        if (attemptData[i][1] === userId && attemptData[i][2] === quizId) {
            attemptNumber++;
        }
    }

    const now = new Date();
    attemptSheet.appendRow([
        Utilities.getUuid(),
        userId,
        quizId,
        Number(score || 0),
        total || Number(score || 0),
        Number(percentage || 0),
        Boolean(passed),
        attemptNumber,
        now
    ]);

    // If passed, mark the corresponding chapter as completed in progress!
    if (passed) {
        const quizData = quizSheet.getDataRange().getValues();
        for (let i = 1; i < quizData.length; i++) {
            if (quizData[i][0] === quizId) {
                const chapterId = quizData[i][1];
                if (progressSheet) {
                    const progData = progressSheet.getDataRange().getValues();
                    let updated = false;
                    for (let j = 1; j < progData.length; j++) {
                        if (progData[j][1] === userId && progData[j][2] === chapterId) {
                            progressSheet.getRange(j + 1, 4).setValue(100);
                            progressSheet.getRange(j + 1, 6).setValue(true);
                            progressSheet.getRange(j + 1, 7).setValue(now);
                            updated = true;
                            break;
                        }
                    }
                    if (!updated) {
                        progressSheet.appendRow([
                            Utilities.getUuid(),
                            userId,
                            chapterId,
                            100,
                            '',
                            true,
                            now
                        ]);
                    }
                }
                break;
            }
        }
    }

    logActivity(userId, 'QUIZ_ATTEMPT', 'Completed quiz attempt ' + attemptNumber + ' with score ' + percentage + '% (Passed: ' + passed + ')');
    return sendResponse(true, 'Quiz attempt recorded', { passed: passed, attemptNumber: attemptNumber });
}

function submitQuizAnswer(userId, quizId, questionId, optionId) {
    return sendResponse(true, 'Answer accepted', {
        userId: userId,
        quizId: quizId,
        questionId: questionId,
        optionId: optionId
    });
}

// === STUDENT QUESTIONS & ANSWERS ===

function getQuestions(userId) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);

    const questionSheet = ss.getSheetByName('questions');
    const answerSheet = ss.getSheetByName('question_answers');
    if (!questionSheet) return sendResponse(false, 'Questions table missing.', null, 500);

    const qData = questionSheet.getDataRange().getValues();
    const aData = answerSheet ? answerSheet.getDataRange().getValues() : [];
    const questions = [];

    for (let i = 1; i < qData.length; i++) {
        const row = qData[i];
        if (row[1] === userId) {
            questions.push({
                id: row[0],
                chapterId: row[2],
                sectionId: row[3],
                topic: row[4] || '',
                questionType: row[5] || 'concept',
                questionText: row[6] || '',
                understanding: row[7] || '',
                status: row[8] || 'PENDING',
                createdAt: row[9],
                updatedAt: row[10],
                answer: getAnswerForQuestion(row[0], aData)
            });
        }
    }

    questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sendResponse(true, 'Questions retrieved', questions);
}

function getAllQuestions() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found.', null, 500);

    const questionSheet = ss.getSheetByName('questions');
    const userSheet = ss.getSheetByName('users');
    const answerSheet = ss.getSheetByName('question_answers');
    const chapterSheet = ss.getSheetByName('chapters');
    if (!questionSheet) return sendResponse(false, 'Questions table missing.', null, 500);

    const qData = questionSheet.getDataRange().getValues();
    const uData = userSheet ? userSheet.getDataRange().getValues() : [];
    const aData = answerSheet ? answerSheet.getDataRange().getValues() : [];
    const cData = chapterSheet ? chapterSheet.getDataRange().getValues() : [];

    const userMap = {};
    for (let i = 1; i < uData.length; i++) {
        userMap[uData[i][0]] = uData[i][3] || uData[i][1];
    }
    const chapterMap = {};
    for (let i = 1; i < cData.length; i++) {
        chapterMap[cData[i][0]] = cData[i][3] || '';
    }

    const questions = [];
    for (let i = 1; i < qData.length; i++) {
        const row = qData[i];
        if (row[0]) {
            questions.push({
                id: row[0],
                userId: row[1],
                userName: userMap[row[1]] || 'User',
                chapterId: row[2],
                chapterTitle: chapterMap[row[2]] || '',
                sectionId: row[3],
                topic: row[4] || '',
                questionType: row[5] || 'concept',
                questionText: row[6] || '',
                understanding: row[7] || '',
                status: row[8] || 'PENDING',
                createdAt: row[9],
                updatedAt: row[10],
                answer: getAnswerForQuestion(row[0], aData)
            });
        }
    }

    questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sendResponse(true, 'All questions retrieved', questions);
}

function getPendingQuestions() {
    const res = getAllQuestions();
    if (!res.data) return res;
    const pending = res.data.filter(q => q.status === 'PENDING');
    return sendResponse(true, 'Pending questions retrieved', pending);
}

function submitQuestion(userId, chapterId, sectionId, questionText, understanding, questionType, topic) {
    if (!questionText || !questionText.trim()) {
        return sendResponse(false, 'Question text is required.', null, 400);
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('questions');
    if (!sheet) return sendResponse(false, 'Questions table not found.', null, 500);

    const id = Utilities.getUuid();
    const now = new Date();
    sheet.appendRow([
        id,
        userId,
        chapterId || '',
        sectionId || '',
        topic || '',
        questionType || 'concept',
        questionText.trim(),
        understanding ? understanding.trim() : '',
        'PENDING',
        now,
        now
    ]);

    logActivity(userId, 'QUESTION_ASKED', 'Submitted question on: ' + (topic || 'Python topic'));
    return sendResponse(true, 'Question submitted successfully', { id: id });
}

function answerQuestion(questionId, answer, adminId) {
    if (!answer || !answer.trim()) {
        return sendResponse(false, 'Answer text is required.', null, 400);
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const answerSheet = ss.getSheetByName('question_answers');
    const questionSheet = ss.getSheetByName('questions');
    if (!answerSheet || !questionSheet) return sendResponse(false, 'Tables missing.', null, 500);

    const now = new Date();
    answerSheet.appendRow([
        Utilities.getUuid(),
        questionId,
        adminId,
        answer.trim(),
        now,
        now
    ]);

    const qData = questionSheet.getDataRange().getValues();
    for (let i = 1; i < qData.length; i++) {
        if (qData[i][0] === questionId) {
            questionSheet.getRange(i + 1, 9).setValue('ANSWERED');
            questionSheet.getRange(i + 1, 11).setValue(now);
            break;
        }
    }

    logActivity(adminId || 'admin', 'QUESTION_ANSWERED', 'Answered question ID: ' + questionId);
    return sendResponse(true, 'Answer submitted successfully', null);
}

function getAnswerForQuestion(questionId, answerData) {
    for (let i = answerData.length - 1; i >= 1; i--) {
        if (answerData[i][1] === questionId) {
            return answerData[i][3];
        }
    }
    return '';
}
