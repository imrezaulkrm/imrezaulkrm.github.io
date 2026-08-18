/* Dashboard Page Logic */

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    
    const user = SessionManager.getCurrentUser();
    const displayNameEl = document.getElementById('displayName');
    if (displayNameEl) {
        displayNameEl.textContent = user.displayName || user.username;
    }

    // Load initial dashboard data
    await loadDashboard();
    
    // Set up event listeners
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) profileBtn.addEventListener('click', (e) => { e.preventDefault(); openProfileModal(); });

    const closeProfileBtn = document.getElementById('closeProfileModal');
    if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeProfileModal);

    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) passwordForm.addEventListener('submit', updatePassword);

    // Quick Action Modals
    setupQuickActionListeners();

    // Listen for language changes from i18n
    window.addEventListener('languageChanged', () => {
        loadDashboard();
    });
});

async function loadDashboard() {
    try {
        const user = SessionManager.getCurrentUser();
        if (!user) return;

        // Fetch user progress
        const progressResponse = await APIClient.getProgress(user.id);
        const progress = progressResponse.success ? (progressResponse.data || {}) : {};

        // Update statistics
        const chCompleted = document.getElementById('chaptersCompleted');
        if (chCompleted) chCompleted.textContent = progress.chaptersCompleted || 0;

        const quizAvg = document.getElementById('quizAverage');
        if (quizAvg) quizAvg.textContent = (progress.quizAverage || 0) + '%';

        const bmCount = document.getElementById('bookmarkCount');
        if (bmCount) bmCount.textContent = progress.bookmarkCount || 0;

        const qCount = document.getElementById('questionCount');
        if (qCount) qCount.textContent = progress.questionCount || 0;

        // Load all chapters
        const chaptersResponse = await APIClient.getChapters();
        if (chaptersResponse.success && chaptersResponse.data) {
            const allChapters = chaptersResponse.data;

            // Render current chapter card
            if (progress.currentChapterId) {
                const cur = allChapters.find(c => c.id === progress.currentChapterId) || allChapters[0];
                renderCurrentChapter(cur, progress);
            } else if (allChapters.length > 0) {
                renderCurrentChapter(allChapters[0], {
                    currentProgress: 0,
                    currentChapterUnlocked: true
                });
            }

            // Render full chapters curriculum
            renderChapters(allChapters, progress);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        const currentChapterEl = document.getElementById('currentChapter');
        if (currentChapterEl) {
            currentChapterEl.innerHTML = `<p class="error-message show">${t('loading')} ${handleAPIError(error)}</p>`;
            currentChapterEl.classList.remove('loading');
        }
    }
}

function renderCurrentChapter(chapter, progress) {
    const lang = LanguageManager.getCurrentLanguage();
    const currentChapter = document.getElementById('currentChapter');
    if (!currentChapter || !chapter) return;
    
    const percentage = Number(progress.currentProgress || 0);
    const title = chapter.title ? (chapter.title[lang] || chapter.title.en || 'Chapter') : 'Chapter';
    const desc = chapter.description ? (chapter.description[lang] || chapter.description.en || '') : '';
    const chapterNum = chapter.number || 1;
    const isUnlocked = progress.currentChapterUnlocked !== false;

    currentChapter.innerHTML = `
        <div class="chapter-info">
            <div class="eyebrow" style="margin-bottom: 6px;">${lang === 'bn' ? 'অধ্যায়' : 'Chapter'} ${String(chapterNum).padStart(2, '0')}</div>
            <h3 style="font-size: 22px; margin-bottom: 6px;">${escapeHtml(title)}</h3>
            <p style="color: var(--text-muted); font-size: 14px;">${escapeHtml(desc)}</p>
        </div>
        <div class="chapter-progress">
            <div class="progress-bar" style="width: 180px; max-width: 100%;">
                <div class="progress-fill" style="width: ${percentage}%;"></div>
            </div>
            <span class="progress-percent">${percentage}%</span>
            <a href="${isUnlocked ? `reader.html?chapter=${encodeURIComponent(chapter.id)}` : '#'}" 
               class="btn btn-primary continue-btn ${!isUnlocked ? 'locked' : ''}">
                ${isUnlocked ? (lang === 'bn' ? 'পড়া চালিয়ে যান →' : 'Continue Reading →') : '🔒 Locked'}
            </a>
        </div>
    `;
    
    currentChapter.classList.remove('loading');
}

function renderChapters(chapters, progress) {
    const lang = LanguageManager.getCurrentLanguage();
    const chaptersList = document.getElementById('chaptersList');
    if (!chaptersList) return;

    const completed = new Set(progress.completedChapters || []);
    const unlocked = new Set(progress.unlockedChapters || []);
    
    chaptersList.innerHTML = chapters.map((chapter, idx) => {
        const isCompleted = completed.has(chapter.id);
        const isUnlocked = unlocked.has(chapter.id) || idx === 0 || Number(chapter.number) === 1;
        const title = chapter.title ? (chapter.title[lang] || chapter.title.en || '') : '';
        const desc = chapter.description ? (chapter.description[lang] || chapter.description.en || '') : '';

        return `
            <a href="${isUnlocked ? `reader.html?chapter=${encodeURIComponent(chapter.id)}` : 'javascript:void(0)'}" 
               class="chapter-item ${!isUnlocked ? 'locked' : ''}" 
               ${!isUnlocked ? 'onclick="alert(\'' + (lang === 'bn' ? 'আগের কুইজ পাস করে এই অধ্যায় আনলক করুন।' : 'Pass the previous chapter quiz to unlock this chapter.') + '\')"' : ''}>
                <div class="chapter-number">${lang === 'bn' ? 'অধ্যায়' : 'Chapter'} ${String(chapter.number || (idx + 1)).padStart(2, '0')}</div>
                <h3 class="chapter-title">${escapeHtml(title)}</h3>
                <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">${escapeHtml(desc)}</p>
                <div>
                    ${isCompleted ? `<span class="chapter-badge">✓ ${lang === 'bn' ? 'সম্পন্ন' : 'Completed'}</span>` : ''}
                    ${!isUnlocked ? `<span class="chapter-badge locked">🔒 ${lang === 'bn' ? 'লক করা' : 'Locked'}</span>` : ''}
                    ${isUnlocked && !isCompleted ? `<span class="chapter-badge" style="background: var(--accent-primary);">${lang === 'bn' ? 'উন্মুক্ত' : 'Unlocked'}</span>` : ''}
                </div>
            </a>
        `;
    }).join('');
}

// Quick Actions Listeners for Bookmarks, Notes, and Questions
function setupQuickActionListeners() {
    const bmAction = document.querySelector('a[href*="view=bookmarks"]');
    if (bmAction) {
        bmAction.addEventListener('click', (e) => {
            e.preventDefault();
            openBookmarksModal();
        });
    }

    const notesAction = document.querySelector('a[href*="view=notes"]');
    if (notesAction) {
        notesAction.addEventListener('click', (e) => {
            e.preventDefault();
            openNotesModal();
        });
    }

    const questionsAction = document.querySelector('a[href*="view=questions"]');
    if (questionsAction) {
        questionsAction.addEventListener('click', (e) => {
            e.preventDefault();
            openQuestionsModal();
        });
    }
}

// Modals: Bookmarks
async function openBookmarksModal() {
    const lang = LanguageManager.getCurrentLanguage();
    const user = SessionManager.getCurrentUser();
    const modal = getOrCreateModal('bookmarksModal', t('my_bookmarks'));
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `<div class="loading-message">${t('loading')}</div>`;
    modal.style.display = 'flex';

    try {
        const [bmRes, chRes] = await Promise.all([
            APIClient.getBookmarks(user.id),
            APIClient.getChapters()
        ]);

        const bookmarks = bmRes.success ? (bmRes.data || []) : [];
        const chapters = chRes.success ? (chRes.data || []) : [];
        const chMap = {};
        chapters.forEach(c => { chMap[c.id] = c; });

        if (bookmarks.length === 0) {
            modalBody.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 24px 0;">${t('no_bookmarks')}</p>`;
            return;
        }

        modalBody.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${bookmarks.map(bm => {
                    const chapter = chMap[bm.chapterId];
                    const chTitle = chapter ? (chapter.title[lang] || chapter.title.en) : (lang === 'bn' ? 'অধ্যায়' : 'Chapter');
                    const chNum = chapter ? chapter.number : '';
                    return `
                        <div style="background: var(--bg-tertiary); padding: 14px 18px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-size: 11px; color: var(--accent-primary); text-transform: uppercase; font-weight: 700;">${lang === 'bn' ? 'অধ্যায়' : 'Chapter'} ${chNum}</span>
                                <h4 style="margin: 4px 0; font-size: 16px;">🔖 ${escapeHtml(chTitle)}</h4>
                                <small style="color: var(--text-muted);">${new Date(bm.createdAt).toLocaleDateString()}</small>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <a href="reader.html?chapter=${encodeURIComponent(bm.chapterId)}" class="btn btn-primary" style="padding: 6px 12px; font-size: 13px;">${t('continue')}</a>
                                <button class="btn btn-outline" style="padding: 6px 10px; font-size: 13px;" onclick="deleteBookmark('${bm.id}')">✕</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (err) {
        modalBody.innerHTML = `<p class="error-message show">${handleAPIError(err)}</p>`;
    }
}

window.deleteBookmark = async function(id) {
    if (confirm(t('delete') + '?')) {
        await APIClient.removeBookmark(id);
        openBookmarksModal();
        loadDashboard();
    }
};

// Modals: Notes
async function openNotesModal() {
    const lang = LanguageManager.getCurrentLanguage();
    const user = SessionManager.getCurrentUser();
    const modal = getOrCreateModal('notesModal', t('my_notes'));
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `<div class="loading-message">${t('loading')}</div>`;
    modal.style.display = 'flex';

    try {
        const [notesRes, chRes] = await Promise.all([
            APIClient.getNotes(user.id),
            APIClient.getChapters()
        ]);

        const notes = notesRes.success ? (notesRes.data || []) : [];
        const chapters = chRes.success ? (chRes.data || []) : [];
        const chMap = {};
        chapters.forEach(c => { chMap[c.id] = c; });

        if (notes.length === 0) {
            modalBody.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 24px 0;">${t('no_notes')}</p>`;
            return;
        }

        modalBody.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 14px;">
                ${notes.map(note => {
                    const chapter = chMap[note.chapterId];
                    const chTitle = chapter ? (chapter.title[lang] || chapter.title.en) : (lang === 'bn' ? 'অধ্যায়' : 'Chapter');
                    return `
                        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 10px; border-left: 3px solid var(--accent-success);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <strong style="color: var(--text-primary); font-size: 14px;">📝 ${escapeHtml(chTitle)}</strong>
                                <small style="color: var(--text-muted);">${new Date(note.createdAt).toLocaleDateString()}</small>
                            </div>
                            <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(note.content)}</p>
                            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                                <a href="reader.html?chapter=${encodeURIComponent(note.chapterId)}" class="btn btn-outline" style="padding: 4px 10px; font-size: 12px;">${t('continue')}</a>
                                <button class="btn btn-danger" style="padding: 4px 10px; font-size: 12px;" onclick="deleteUserNote('${note.id}')">${t('delete')}</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (err) {
        modalBody.innerHTML = `<p class="error-message show">${handleAPIError(err)}</p>`;
    }
}

window.deleteUserNote = async function(id) {
    if (confirm(t('delete') + '?')) {
        await APIClient.deleteNote(id);
        openNotesModal();
    }
};

// Modals: Questions & Answers
async function openQuestionsModal() {
    const lang = LanguageManager.getCurrentLanguage();
    const user = SessionManager.getCurrentUser();
    const modal = getOrCreateModal('questionsModal', t('my_questions'));
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `<div class="loading-message">${t('loading')}</div>`;
    modal.style.display = 'flex';

    try {
        const qRes = await APIClient.getQuestions(user.id);
        const questions = qRes.success ? (qRes.data || []) : [];

        if (questions.length === 0) {
            modalBody.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 24px 0;">${t('no_questions')}</p>`;
            return;
        }

        modalBody.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 16px;">
                ${questions.map(q => {
                    const isAnswered = q.status === 'ANSWERED';
                    return `
                        <div style="background: var(--bg-tertiary); padding: 18px; border-radius: 12px; border: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                                <span class="badge ${isAnswered ? 'green' : ''}">${isAnswered ? t('status_answered') : t('status_pending')}</span>
                                <small style="color: var(--text-muted);">${new Date(q.createdAt).toLocaleDateString()}</small>
                            </div>
                            <h4 style="margin: 0 0 6px; font-size: 15px; color: var(--text-primary);">❓ ${escapeHtml(q.questionText)}</h4>
                            ${q.understanding ? `<p style="font-size: 13px; color: var(--text-muted); margin: 0 0 10px; font-style: italic;">"${escapeHtml(q.understanding)}"</p>` : ''}
                            ${isAnswered && q.answer ? `
                                <div style="background: var(--bg-secondary); padding: 12px 14px; border-radius: 8px; border-left: 3px solid var(--accent-primary); margin-top: 10px;">
                                    <strong style="color: var(--accent-primary); font-size: 13px; display: block; margin-bottom: 4px;">💬 Instructor Answer:</strong>
                                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(q.answer)}</p>
                                </div>
                            ` : `
                                <p style="color: var(--text-muted); font-size: 12px; margin: 8px 0 0;">⏳ An instructor will answer this question soon.</p>
                            `}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (err) {
        modalBody.innerHTML = `<p class="error-message show">${handleAPIError(err)}</p>`;
    }
}

// User Profile Modal
function openProfileModal() {
    const user = SessionManager.getCurrentUser();
    if (!user) return;

    const usernameEl = document.getElementById('profileUsername');
    if (usernameEl) usernameEl.textContent = user.username;

    const displayNameEl = document.getElementById('profileDisplayName');
    if (displayNameEl) displayNameEl.textContent = user.displayName || user.username;

    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'flex';
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
}

async function updatePassword(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('profileMessage');
    
    if (!newPassword || newPassword.length < 6) {
        messageDiv.innerHTML = `<p class="error-message show">Password must be at least 6 characters.</p>`;
        return;
    }

    if (newPassword !== confirmPassword) {
        messageDiv.innerHTML = `<p class="error-message show">${t('passwords_dont_match')}</p>`;
        return;
    }
    
    try {
        const user = SessionManager.getCurrentUser();
        const response = await APIClient.updatePassword(user.id, newPassword);
        
        if (response.success) {
            messageDiv.innerHTML = `<p class="success-message">${t('password_updated')}</p>`;
            document.getElementById('passwordForm').reset();
            setTimeout(() => closeProfileModal(), 1800);
        } else {
            messageDiv.innerHTML = `<p class="error-message show">${handleAPIError(response)}</p>`;
        }
    } catch (error) {
        messageDiv.innerHTML = `<p class="error-message show">${handleAPIError(error)}</p>`;
    }
}

// Helper: Modal creation utility
function getOrCreateModal(modalId, titleText) {
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 650px;">
                <div class="modal-header">
                    <h2>${escapeHtml(titleText)}</h2>
                    <button class="modal-close" onclick="document.getElementById('${modalId}').style.display='none'">&times;</button>
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.querySelector('.modal-header h2').textContent = titleText;
    }
    return modal;
}

function escapeHtml(str) {
    return String(str || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
