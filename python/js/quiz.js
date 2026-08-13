/* Quiz Page Logic */

let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStarted = false;

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    
    const params = new URLSearchParams(window.location.search);
    const quizId = params.get('quiz');
    
    if (quizId) {
        await loadQuiz(quizId);
    }
});

async function loadQuiz(quizId) {
    try {
        document.getElementById('quizLoading').style.display = 'flex';
        
        const response = await APIClient.getQuiz(quizId);
        
        if (response.success) {
            currentQuiz = response.data;
            userAnswers = new Array(currentQuiz.questions.length).fill(null);
            quizStarted = true;
            
            document.getElementById('quizLoading').style.display = 'none';
            document.getElementById('quizInterface').style.display = 'block';
            
            renderQuestion();
        }
    } catch (error) {
        console.error('Error loading quiz:', error);
        document.getElementById('quizLoading').innerHTML = '<p>Error loading quiz. Please try again.</p>';
    }
}

function renderQuestion() {
    const lang = LanguageManager.getCurrentLanguage();
    const question = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
    
    // Update progress bar
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('questionCounter').textContent = `${currentQuestionIndex + 1} / ${currentQuiz.questions.length}`;
    
    // Update question
    document.getElementById('questionText').textContent = question.question[lang];
    
    // Render options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = question.options.map((option, index) => `
        <label class="option-label">
            <input type="radio" name="answer" value="${index}" ${userAnswers[currentQuestionIndex] === index ? 'checked' : ''}>
            <span class="option-text">${option.text[lang]}</span>
        </label>
    `).join('');
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'submitAnswerBtn' && quizStarted) {
        submitAnswer();
    }
    if (e.target.id === 'reviewQuizBtn') {
        currentQuestionIndex = 0;
        document.getElementById('quizResult').style.display = 'none';
        document.getElementById('quizInterface').style.display = 'block';
        renderQuestion();
    }
    if (e.target.id === 'continueBtn') {
        completeQuiz();
    }
});

function submitAnswer() {
    const selected = document.querySelector('input[name="answer"]:checked');
    
    if (!selected) {
        alert('Please select an answer');
        return;
    }
    
    const answerIndex = parseInt(selected.value);
    userAnswers[currentQuestionIndex] = answerIndex;
    
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    const lang = LanguageManager.getCurrentLanguage();
    
    // Calculate score
    let correctCount = 0;
    currentQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctOptionIndex) {
            correctCount++;
        }
    });
    
    const percentage = Math.round((correctCount / currentQuiz.questions.length) * 100);
    const passed = percentage >= (currentQuiz.passPercentage || CONFIG.DEFAULT_PASS_MARK);
    
    // Update result display
    document.getElementById('scorePercentage').textContent = percentage + '%';
    document.getElementById('scoreCount').textContent = `${correctCount} / ${currentQuiz.questions.length}`;
    
    const resultStatus = document.getElementById('resultStatus');
    if (passed) {
        resultStatus.className = 'result-status';
        resultStatus.innerHTML = `
            <p class="status-title">${lang === 'bn' ? 'সফল' : 'Passed'} ✓</p>
            <p class="status-message">${lang === 'bn' ? 'পরবর্তী অধ্যায় আনলক হয়েছে!' : 'Next chapter unlocked!'}</p>
        `;
    } else {
        resultStatus.className = 'result-status failed';
        resultStatus.innerHTML = `
            <p class="status-title">${lang === 'bn' ? 'ব্যর্থ' : 'Failed'} ✗</p>
            <p class="status-message">${lang === 'bn' ? 'দয়া করে অধ্যায় পর্যালোচনা করুন এবং আবার চেষ্টা করুন।' : 'Please review the chapter and try again.'}</p>
        `;
    }
    
    // Render detailed results
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = currentQuiz.questions.map((question, index) => {
        const isCorrect = userAnswers[index] === question.correctOptionIndex;
        const selectedOption = question.options[userAnswers[index]];
        const correctOption = question.options[question.correctOptionIndex];
        
        return `
            <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-question">
                    <span class="result-icon">${isCorrect ? '✓' : '✗'}</span>
                    <div class="result-text">
                        <strong>${question.question[lang]}</strong>
                    </div>
                </div>
                <div class="user-answer">
                    ${lang === 'bn' ? 'আপনার উত্তর' : 'Your answer'}: ${selectedOption.text[lang]}
                </div>
                ${!isCorrect ? `
                    <div class="correct-answer">
                        ${lang === 'bn' ? 'সঠিক উত্তর' : 'Correct answer'}: ${correctOption.text[lang]}
                    </div>
                ` : ''}
                <div class="explanation">
                    ${question.explanation[lang]}
                </div>
            </div>
        `;
    }).join('');
    
    // Save quiz attempt
    const user = SessionManager.getCurrentUser();
    APIClient.completeQuiz(user.id, currentQuiz.id, correctCount, percentage, passed);
    
    document.getElementById('quizInterface').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';
}

function completeQuiz() {
    window.location.href = 'dashboard.html';
}
