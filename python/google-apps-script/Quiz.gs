// Google Apps Script - Quiz Functions

function getQuiz(chapterId) {
    const quizSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('quizzes');
    const quizData = quizSheet.getDataRange().getValues();
    
    // Find quiz for this chapter
    let quizId = null;
    for (let i = 1; i < quizData.length; i++) {
        if (quizData[i][1] === chapterId) {
            quizId = quizData[i][0];
            break;
        }
    }
    
    if (!quizId) {
        return sendResponse(false, 'Quiz not found', null, 404);
    }
    
    // Get questions
    const questionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('quiz_questions');
    const questionData = questionSheet.getDataRange().getValues();
    const questions = [];
    
    for (let i = 1; i < questionData.length; i++) {
        const row = questionData[i];
        if (row[1] === quizId) {
            const questionId = row[0];
            
            // Get options for this question
            const optionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('quiz_options');
            const optionData = optionSheet.getDataRange().getValues();
            const options = [];
            
            let correctOptionIndex = 0;
            for (let j = 1; j < optionData.length; j++) {
                const optRow = optionData[j];
                if (optRow[1] === questionId) {
                    options.push({
                        id: optRow[0],
                        text: {
                            en: optRow[2],
                            bn: optRow[3]
                        }
                    });
                    
                    if (optRow[4]) {
                        correctOptionIndex = options.length - 1;
                    }
                }
            }
            
            questions.push({
                id: questionId,
                question: {
                    en: row[2],
                    bn: row[3]
                },
                explanation: {
                    en: row[4],
                    bn: row[5]
                },
                options: options,
                correctOptionIndex: correctOptionIndex
            });
        }
    }
    
    return sendResponse(true, 'Quiz retrieved', {
        id: quizId,
        chapterId: chapterId,
        questions: questions,
        passPercentage: 70
    });
}

function completeQuiz(userId, quizId, score, percentage, passed) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('quiz_attempts');
    
    // Get attempt number
    const data = sheet.getDataRange().getValues();
    let attemptNumber = 1;
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][1] === userId && data[i][2] === quizId) {
            attemptNumber++;
        }
    }
    
    sheet.appendRow([
        Utilities.getUuid(),
        userId,
        quizId,
        score,
        score * 2, // total (assuming each question is worth 2 points)
        percentage,
        passed,
        attemptNumber,
        new Date()
    ]);
    
    // If passed, mark chapter as complete
    if (passed) {
        const quizSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('quizzes');
        const quizData = quizSheet.getDataRange().getValues();
        
        for (let i = 1; i < quizData.length; i++) {
            if (quizData[i][0] === quizId) {
                const chapterId = quizData[i][1];
                
                // Mark progress as completed
                const progressSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('progress');
                const progressData = progressSheet.getDataRange().getValues();
                
                for (let j = 1; j < progressData.length; j++) {
                    if (progressData[j][1] === userId && progressData[j][2] === chapterId) {
                        progressSheet.getRange(j + 1, 6).setValue(true); // completed
                        break;
                    }
                }
                break;
            }
        }
    }
    
    return sendResponse(true, 'Quiz attempt recorded', null);
}

// Questions
function getQuestions(userId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('questions');
    const data = sheet.getDataRange().getValues();
    const questions = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[1] === userId) {
            questions.push({
                id: row[0],
                chapterId: row[2],
                sectionId: row[3],
                topic: row[4],
                questionText: row[6],
                understanding: row[7],
                status: row[8],
                createdAt: row[9]
            });
        }
    }
    
    return sendResponse(true, 'Questions retrieved', questions);
}

function submitQuestion(userId, chapterId, sectionId, questionText, understanding) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('questions');
    sheet.appendRow([
        Utilities.getUuid(),
        userId,
        chapterId,
        sectionId,
        '', // topic
        '', // question_type
        questionText,
        understanding,
        'PENDING',
        new Date(),
        new Date()
    ]);
    
    return sendResponse(true, 'Question submitted', null);
}

function getPendingQuestions() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('questions');
    const data = sheet.getDataRange().getValues();
    const questions = [];
    
    const userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const userData = userSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[8] === 'PENDING') { // status
            // Get user name
            let userName = '';
            for (let j = 1; j < userData.length; j++) {
                if (userData[j][0] === row[1]) {
                    userName = userData[j][3]; // display_name
                    break;
                }
            }
            
            questions.push({
                id: row[0],
                userId: row[1],
                userName: userName,
                questionText: row[6],
                understanding: row[7],
                status: row[8],
                createdAt: row[9]
            });
        }
    }
    
    return sendResponse(true, 'Pending questions retrieved', questions);
}

function answerQuestion(questionId, answer) {
    const answerSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('question_answers');
    answerSheet.appendRow([
        Utilities.getUuid(),
        questionId,
        '', // admin_id
        answer,
        new Date(),
        new Date()
    ]);
    
    // Update question status
    const questionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('questions');
    const data = questionSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === questionId) {
            questionSheet.getRange(i + 1, 9).setValue('ANSWERED'); // status
            break;
        }
    }
    
    return sendResponse(true, 'Answer submitted', null);
}
