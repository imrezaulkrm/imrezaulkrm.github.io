/* Quiz Page Logic - Mandatory Progressive Assessment */

let currentQuiz = null;
let currentChapterId = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStarted = false;
let quizCompleted = false;

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    
    const params = new URLSearchParams(window.location.search);
    currentChapterId = params.get('chapter') || params.get('quiz');
    
    if (currentChapterId) {
        await loadQuiz(currentChapterId);
    } else {
        const loadingEl = document.getElementById('quizLoading');
        if (loadingEl) {
            loadingEl.innerHTML = `
                <p style="color: var(--text-muted);">No chapter selected for this quiz.</p>
                <a href="dashboard.html" class="btn btn-primary" style="margin-top: 14px;">← ${t('nav_dashboard')}</a>
            `;
        }
    }

    // Set up click handlers
    document.addEventListener('click', (e) => {
        if (e.target.id === 'submitAnswerBtn' && quizStarted) {
            submitAnswer();
        }
        if (e.target.id === 'reviewQuizBtn') {
            currentQuestionIndex = 0;
            const resEl = document.getElementById('quizResult');
            const ifaceEl = document.getElementById('quizInterface');
            if (resEl) resEl.style.display = 'none';
            if (ifaceEl) ifaceEl.style.display = 'block';
            renderQuestion();
        }
        if (e.target.id === 'continueBtn') {
            completeAndProceed();
        }
        if (e.target.id === 'retryQuizBtn') {
            retryQuiz();
        }
    });

    // Listen for language changes from i18n
    window.addEventListener('languageChanged', () => {
        if (currentQuiz) {
            updateQuizTitle();
            if (!quizCompleted) {
                renderQuestion();
            } else {
                showResults();
            }
        }
    });
});

async function loadQuiz(chapterId) {
    try {
        const loadingEl = document.getElementById('quizLoading');
        if (loadingEl) loadingEl.style.display = 'flex';
        
        const response = await APIClient.getQuiz(chapterId);
        
        if (response.success && response.data) {
            currentQuiz = response.data;
            userAnswers = new Array(currentQuiz.questions.length).fill(null);
            currentQuestionIndex = 0;
            quizStarted = true;
            quizCompleted = false;

            updateQuizTitle();
            
            if (loadingEl) loadingEl.style.display = 'none';
            const ifaceEl = document.getElementById('quizInterface');
            if (ifaceEl) ifaceEl.style.display = 'block';
            
            renderQuestion();
        } else {
            throw new Error(response.error || 'Quiz not found');
        }
    } catch (error) {
        console.error('Error loading quiz:', error);
        const loadingEl = document.getElementById('quizLoading');
        if (loadingEl) {
            loadingEl.innerHTML = `
                <div class="callout warning" style="max-width: 500px; text-align: center;">
                    <h3>${handleAPIError(error)}</h3>
                    <a href="dashboard.html" class="btn btn-primary" style="margin-top: 16px;">← ${t('nav_dashboard')}</a>
                </div>
            `;
        }
    }
}

function updateQuizTitle() {
    const lang = LanguageManager.getCurrentLanguage();
    const quizTitleEl = document.getElementById('quizTitle');
    if (quizTitleEl && currentQuiz) {
        const titleText = currentQuiz.title ? (currentQuiz.title[lang] || currentQuiz.title.en) : t('chapter_quiz');
        quizTitleEl.textContent = titleText;
    }
}

function renderQuestion() {
    if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) return;

    const lang = LanguageManager.getCurrentLanguage();
    const question = currentQuiz.questions[currentQuestionIndex];
    const totalQ = currentQuiz.questions.length;
    const progressPct = ((currentQuestionIndex + 1) / totalQ) * 100;
    
    // Update progress bar & counter
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = progressPct + '%';

    const qCounter = document.getElementById('questionCounter');
    if (qCounter) qCounter.textContent = `${t('quiz_question_counter')} ${currentQuestionIndex + 1} / ${totalQ}`;
    
    // Question Text
    const qTextEl = document.getElementById('questionText');
    if (qTextEl) {
        const qStr = question.question ? (question.question[lang] || question.question.en || '') : '';
        qTextEl.textContent = qStr;
    }
    
    // Options
    const optionsContainer = document.getElementById('optionsContainer');
    if (optionsContainer) {
        optionsContainer.innerHTML = (question.options || []).map((option, index) => {
            const optText = option.text ? (option.text[lang] || option.text.en || '') : (typeof option === 'string' ? option : '');
            const isChecked = userAnswers[currentQuestionIndex] === index;
            const letter = String.fromCharCode(65 + index);

            return `
                <label class="option-label ${isChecked ? 'selected' : ''}">
                    <input type="radio" name="answer" value="${index}" ${isChecked ? 'checked' : ''} onchange="selectOption(${index})">
                    <span class="option-letter" style="font-weight: 700; color: var(--accent-primary); margin-right: 12px;">${letter}.</span>
                    <span class="option-text">${escapeHtml(optText)}</span>
                </label>
            `;
        }).join('');
    }

    // Submit button label
    const submitBtn = document.getElementById('submitAnswerBtn');
    if (submitBtn) {
        submitBtn.textContent = currentQuestionIndex === totalQ - 1 ? (lang === 'bn' ? 'কুইজ সম্পন্ন করুন' : 'Finish Quiz') : (lang === 'bn' ? 'পরবর্তী প্রশ্ন →' : 'Next Question →');
    }
}

window.selectOption = function(index) {
    userAnswers[currentQuestionIndex] = index;
    document.querySelectorAll('.option-label').forEach((lbl, idx) => {
        if (idx === index) lbl.classList.add('selected');
        else lbl.classList.remove('selected');
    });
};

function submitAnswer() {
    const selected = document.querySelector('input[name="answer"]:checked');
    
    if (!selected && userAnswers[currentQuestionIndex] === null) {
        alert(t('select_an_option'));
        return;
    }
    
    if (selected) {
        userAnswers[currentQuestionIndex] = parseInt(selected.value, 10);
    }
    
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    } else {
        showResults();
    }
}

async function showResults() {
    quizCompleted = true;
    const lang = LanguageManager.getCurrentLanguage();
    
    // Calculate score
    let correctCount = 0;
    currentQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correctOptionIndex) {
            correctCount++;
        }
    });
    
    const total = currentQuiz.questions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const passMark = currentQuiz.passPercentage || CONFIG.DEFAULT_PASS_MARK;
    const passed = percentage >= passMark;
    
    // Update score display
    const scorePctEl = document.getElementById('scorePercentage');
    if (scorePctEl) scorePctEl.textContent = percentage + '%';

    const scoreCountEl = document.getElementById('scoreCount');
    if (scoreCountEl) scoreCountEl.textContent = `${correctCount} / ${total}`;
    
    const resultStatus = document.getElementById('resultStatus');
    if (resultStatus) {
        if (passed) {
            resultStatus.className = 'result-status';
            resultStatus.innerHTML = `
                <p class="status-title">${t('passed')}</p>
                <p class="status-message">${t('chapter_unlocked')}</p>
            `;
        } else {
            resultStatus.className = 'result-status failed';
            resultStatus.innerHTML = `
                <p class="status-title">${t('failed')}</p>
                <p class="status-message">${t('try_again')} (${t('pass_mark')}: ${passMark}%)</p>
            `;
        }
    }
    
    // Render detailed results with explanations
    const resultsList = document.getElementById('resultsList');
    if (resultsList) {
        resultsList.innerHTML = currentQuiz.questions.map((question, index) => {
            const isCorrect = userAnswers[index] === question.correctOptionIndex;
            const selectedOpt = question.options ? question.options[userAnswers[index]] : null;
            const correctOpt = question.options ? question.options[question.correctOptionIndex] : null;

            const selectedText = selectedOpt ? (selectedOpt.text ? (selectedOpt.text[lang] || selectedOpt.text.en) : selectedOpt) : '-';
            const correctText = correctOpt ? (correctOpt.text ? (correctOpt.text[lang] || correctOpt.text.en) : correctOpt) : '-';
            const qText = question.question ? (question.question[lang] || question.question.en) : '';
            const explanationText = question.explanation ? (question.explanation[lang] || question.explanation.en) : '';

            return `
                <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="result-question">
                        <span class="result-icon">${isCorrect ? '✓' : '✗'}</span>
                        <div class="result-text">
                            <strong>${index + 1}. ${escapeHtml(qText)}</strong>
                        </div>
                    </div>
                    <div class="user-answer">
                        ${t('your_answer')}: <span style="font-weight: 600; color: ${isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)'};">${escapeHtml(selectedText)}</span>
                    </div>
                    ${!isCorrect ? `
                        <div class="correct-answer">
                            ${t('correct_answer')}: <strong style="color: var(--accent-success);">${escapeHtml(correctText)}</strong>
                        </div>
                    ` : ''}
                    ${explanationText ? `
                        <div class="explanation">
                            <strong>💡 ${t('explanation')}:</strong> ${escapeHtml(explanationText)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Save quiz attempt in background
    const user = SessionManager.getCurrentUser();
    if (user) {
        APIClient.completeQuiz(user.id, currentQuiz.id, correctCount, percentage, passed).catch(console.warn);
    }
    
    // Toggle displays
    const ifaceEl = document.getElementById('quizInterface');
    const resEl = document.getElementById('quizResult');
    if (ifaceEl) ifaceEl.style.display = 'none';
    if (resEl) resEl.style.display = 'block';

    // Action buttons
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.textContent = passed ? (lang === 'bn' ? 'পড়া চালিয়ে যান →' : 'Continue Reading →') : (lang === 'bn' ? 'অধ্যায় পর্যালোচনা করুন' : 'Review Chapter');
    }

    window.scrollTo(0, 0);
}

function retryQuiz() {
    userAnswers = new Array(currentQuiz.questions.length).fill(null);
    currentQuestionIndex = 0;
    quizCompleted = false;

    const resEl = document.getElementById('quizResult');
    const ifaceEl = document.getElementById('quizInterface');
    if (resEl) resEl.style.display = 'none';
    if (ifaceEl) ifaceEl.style.display = 'block';

    renderQuestion();
    window.scrollTo(0, 0);
}

function completeAndProceed() {
    window.location.href = `reader.html?chapter=${encodeURIComponent(currentChapterId)}`;
}

function escapeHtml(str) {
    return String(str || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
