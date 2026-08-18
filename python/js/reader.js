/* Reader Page Logic - Interactive Digital Book */

let currentChapterId = null;
let currentSectionId = null;
let allChapters = [];
let currentChapter = null;
let userBookmarks = new Set();

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    
    // Parse query params
    const params = new URLSearchParams(window.location.search);
    currentChapterId = params.get('chapter');
    const viewParam = params.get('view');
    
    // Initial fetch of chapters and bookmarks
    await loadInitialData();

    if (!currentChapterId) {
        await loadFirstUnlockedChapter();
    } else {
        await loadChapter(currentChapterId);
    }
    
    // Handle view query param (e.g. ?view=notes, ?view=bookmarks, ?view=questions)
    if (viewParam === 'bookmarks') openBookmarksDrawer();
    if (viewParam === 'notes') openNotesDrawer();
    if (viewParam === 'questions') openQuestionsDrawer();

    // Set up event listeners
    setupEventListeners();

    // Listen for language changes from i18n
    window.addEventListener('languageChanged', () => {
        if (currentChapter) {
            renderChapterContent(currentChapter);
            loadTableOfContents();
        }
    });

    // Reading progress on scroll
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
});

async function loadInitialData() {
    try {
        const user = SessionManager.getCurrentUser();
        const [chRes, bmRes] = await Promise.all([
            APIClient.getChapters(),
            APIClient.getBookmarks(user.id)
        ]);

        if (chRes.success) allChapters = chRes.data || [];
        if (bmRes.success && Array.isArray(bmRes.data)) {
            userBookmarks = new Set(bmRes.data.map(b => b.sectionId ? `${b.chapterId}_${b.sectionId}` : b.chapterId));
        }
    } catch (err) {
        console.error('Error loading initial reader data:', err);
    }
}

async function loadFirstUnlockedChapter() {
    try {
        const user = SessionManager.getCurrentUser();
        const progRes = await APIClient.getProgress(user.id);
        const unlocked = progRes.success ? (progRes.data.unlockedChapters || []) : [];

        if (unlocked.length > 0) {
            currentChapterId = unlocked[unlocked.length - 1];
        } else if (allChapters.length > 0) {
            currentChapterId = allChapters[0].id;
        }

        if (currentChapterId) {
            await loadChapter(currentChapterId);
        }
    } catch (error) {
        console.error('Error loading first unlocked chapter:', error);
    }
}

async function loadChapter(chapterId) {
    try {
        const readerContent = document.getElementById('readerContent');
        if (readerContent) {
            readerContent.innerHTML = `<div class="loading-message">${t('loading')}</div>`;
        }

        const response = await APIClient.getChapterContent(chapterId);
        
        if (response.success && response.data) {
            currentChapter = response.data;
            currentChapterId = currentChapter.id;
            renderChapterContent(currentChapter);
            await loadTableOfContents();
            updateNavigationButtons();
            window.scrollTo(0, 0);
        } else {
            throw new Error(response.error || 'Failed to load chapter');
        }
    } catch (error) {
        console.error('Error loading chapter:', error);
        const readerContent = document.getElementById('readerContent');
        if (readerContent) {
            readerContent.innerHTML = `
                <div class="callout warning" style="margin-top: 40px;">
                    <h3>${t('chapter_locked_msg')}</h3>
                    <p style="margin-top: 10px;">${handleAPIError(error)}</p>
                    <a href="dashboard.html" class="btn btn-primary" style="margin-top: 15px;">← ${t('nav_dashboard')}</a>
                </div>
            `;
        }
    }
}

function renderChapterContent(chapter) {
    const lang = LanguageManager.getCurrentLanguage();
    const content = document.getElementById('readerContent');
    if (!content || !chapter) return;
    
    const title = chapter.title ? (chapter.title[lang] || chapter.title.en) : 'Chapter';
    const desc = chapter.description ? (chapter.description[lang] || chapter.description.en || '') : '';
    const chapterNum = String(chapter.number || 1).padStart(2, '0');
    const partName = chapter.partId ? chapter.partId.toUpperCase() : 'PYTHON';

    const htmlContent = `
        <div class="chapter-header">
            <div class="chapter-kicker">${escapeHtml(partName)} · ${lang === 'bn' ? 'অধ্যায়' : 'CHAPTER'} ${chapterNum}</div>
            <h1 class="chapter-title">${escapeHtml(title)}</h1>
            ${desc ? `<p class="chapter-intro">${escapeHtml(desc)}</p>` : ''}
            
            <div class="reading-progress-track">
                <div id="readingProgressBar" class="reading-progress-fill"></div>
            </div>

            <div class="tools-bar">
                <button class="btn btn-outline small-tool-btn ${isChapterBookmarked(chapter.id) ? 'active' : ''}" onclick="toggleChapterBookmark('${chapter.id}')">
                    <span class="tool-icon">🔖</span> ${isChapterBookmarked(chapter.id) ? t('bookmarked') : t('bookmark_section')}
                </button>
                <button class="btn btn-outline small-tool-btn" onclick="openNotesDrawer('${chapter.id}')">
                    <span class="tool-icon">📝</span> ${t('my_notes')}
                </button>
                <button class="btn btn-outline small-tool-btn" onclick="openQuestionsDrawer('${chapter.id}')">
                    <span class="tool-icon">❓</span> ${t('ask_question')}
                </button>
            </div>
        </div>

        <article class="book-article">
            ${(chapter.sections || []).map((section, sIdx) => {
                const secTitle = section.title ? (section.title[lang] || section.title.en) : `Section ${sIdx + 1}`;
                const isSecBookmarked = isSectionBookmarked(chapter.id, section.id);

                return `
                    <section id="section-${section.id}" class="book-section" data-section-id="${section.id}">
                        <div class="section-title-wrap">
                            <h2>${escapeHtml(secTitle)}</h2>
                            <button class="icon-btn-bookmark ${isSecBookmarked ? 'bookmarked' : ''}" 
                                    title="${t('bookmark_section')}" 
                                    onclick="toggleSectionBookmark('${chapter.id}', '${section.id}')">
                                🔖
                            </button>
                        </div>
                        
                        <div class="section-body">
                            ${renderSectionContent(section, lang)}
                        </div>

                        <div class="section-inline-tools">
                            <button class="btn btn-outline" style="font-size: 12px; padding: 5px 10px;" onclick="openAddNoteModal('${chapter.id}', '${section.id}')">
                                📝 ${t('add_note')}
                            </button>
                            <button class="btn btn-outline" style="font-size: 12px; padding: 5px 10px;" onclick="openQuestionModal('${chapter.id}', '${section.id}', '${escapeHtml(secTitle)}')">
                                ❓ ${t('ask_question')}
                            </button>
                        </div>
                    </section>
                `;
            }).join('')}
        </article>
    `;
    
    content.innerHTML = htmlContent;
    currentSectionId = chapter.sections && chapter.sections.length > 0 ? chapter.sections[0].id : null;
    
    // Attach code block copy listeners
    attachCodeCopyButtons();

    // Auto-update reading progress in background
    const user = SessionManager.getCurrentUser();
    if (user) {
        APIClient.updateProgress(user.id, chapter.id, 25, currentSectionId).catch(console.warn);
    }
}

function renderSectionContent(section, lang) {
    if (Array.isArray(section.blocks) && section.blocks.length > 0) {
        return section.blocks.map(block => renderContentBlock(block, lang)).join('');
    }
    return section.content ? (section.content[lang] || section.content.en || '') : '';
}

function renderContentBlock(block, lang) {
    const title = block.title && (block.title[lang] || block.title.en) ? block.title[lang] || block.title.en : '';
    const body = block.content ? (block.content[lang] || block.content.en || '') : '';
    const titleHtml = title ? `<h3>${escapeHtml(title)}</h3>` : '';

    switch (block.type) {
        case 'code':
            return `
                <div class="code-block-wrapper">
                    ${title ? `<div class="code-header"><span>${escapeHtml(title)}</span><button class="btn-copy-code" onclick="copyCodeSnippet(this)">${t('copy_code')}</button></div>` : `<div class="code-header"><span>Python</span><button class="btn-copy-code" onclick="copyCodeSnippet(this)">${t('copy_code')}</button></div>`}
                    <pre class="code-block"><code class="language-python">${escapeHtml(body)}</code></pre>
                </div>
            `;
        case 'callout':
        case 'important':
            return `
                <div class="callout">
                    ${title ? `<strong>💡 ${escapeHtml(title)}:</strong> ` : ''}
                    <div style="display: inline;">${body}</div>
                </div>
            `;
        case 'quote':
            return `<blockquote>${titleHtml}<p>${escapeHtml(body)}</p></blockquote>`;
        case 'heading':
            return `<h3>${escapeHtml(title || body)}</h3>`;
        case 'example':
            return `
                <div class="callout success">
                    ${title ? `<strong>✨ ${escapeHtml(title)}</strong>` : ''}
                    <div>${body}</div>
                </div>
            `;
        default:
            return `${titleHtml}${body}`;
    }
}

function attachCodeCopyButtons() {
    // Buttons are already inline with onclick handlers
}

window.copyCodeSnippet = function(button) {
    const wrapper = button.closest('.code-block-wrapper');
    const codeEl = wrapper ? wrapper.querySelector('code') : null;
    if (codeEl) {
        navigator.clipboard.writeText(codeEl.textContent).then(() => {
            const originalText = button.textContent;
            button.textContent = t('copied');
            button.classList.add('copied');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 1800);
        }).catch(() => {
            alert('Failed to copy code.');
        });
    }
};

async function loadTableOfContents() {
    const lang = LanguageManager.getCurrentLanguage();
    const contentsList = document.getElementById('contentsList');
    if (!contentsList) return;

    const user = SessionManager.getCurrentUser();
    const progRes = await APIClient.getProgress(user.id);
    const progress = progRes.data || {};
    const unlocked = new Set(progress.unlockedChapters || []);
    const completed = new Set(progress.completedChapters || []);

    contentsList.innerHTML = allChapters.map((ch, idx) => {
        const isCurrent = ch.id === currentChapterId;
        const isCompleted = completed.has(ch.id);
        const isUnlocked = unlocked.has(ch.id) || idx === 0 || Number(ch.number) === 1;
        const title = ch.title ? (ch.title[lang] || ch.title.en) : '';
        const marker = isCompleted ? '✓' : isUnlocked ? '→' : '🔒';

        return `
            <a class="contents-item ${isCurrent ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}" 
               href="${isUnlocked ? `reader.html?chapter=${encodeURIComponent(ch.id)}` : 'javascript:void(0)'}" 
               ${!isUnlocked ? 'onclick="alert(\'' + (lang === 'bn' ? 'আগের কুইজ পাস করে এই অধ্যায় আনলক করুন।' : 'Pass previous chapter quiz to unlock.') + '\')"' : ''}>
                <span class="toc-marker">${marker}</span>
                <span class="toc-text">${ch.number}. ${escapeHtml(title)}</span>
            </a>
        `;
    }).join('');
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!prevBtn || !nextBtn) return;

    const currentIndex = allChapters.findIndex(c => c.id === currentChapterId);
    
    if (currentIndex > 0) {
        prevBtn.style.visibility = 'visible';
        prevBtn.onclick = () => {
            window.location.href = `reader.html?chapter=${encodeURIComponent(allChapters[currentIndex - 1].id)}`;
        };
    } else {
        prevBtn.style.visibility = 'hidden';
    }

    nextBtn.textContent = t('take_quiz');
    nextBtn.onclick = () => {
        window.location.href = `quiz.html?chapter=${encodeURIComponent(currentChapterId)}`;
    };
}

function updateScrollProgress() {
    const article = document.querySelector('.book-article');
    const progressBar = document.getElementById('readingProgressBar');
    if (!article || !progressBar) return;

    const totalHeight = article.scrollHeight - window.innerHeight + 200;
    const progress = Math.min(100, Math.max(5, (window.scrollY / totalHeight) * 100));
    progressBar.style.width = progress + '%';
}

// === BOOKMARKS ===

function isChapterBookmarked(chId) {
    return userBookmarks.has(chId);
}

function isSectionBookmarked(chId, secId) {
    return userBookmarks.has(`${chId}_${secId}`);
}

async function toggleChapterBookmark(chId) {
    const user = SessionManager.getCurrentUser();
    if (userBookmarks.has(chId)) {
        // Find bookmark id
        const res = await APIClient.getBookmarks(user.id);
        const match = res.success ? (res.data || []).find(b => b.chapterId === chId && !b.sectionId) : null;
        if (match) await APIClient.removeBookmark(match.id);
        userBookmarks.delete(chId);
    } else {
        await APIClient.addBookmark(user.id, chId, '');
        userBookmarks.add(chId);
    }
    renderChapterContent(currentChapter);
}

async function toggleSectionBookmark(chId, secId) {
    const user = SessionManager.getCurrentUser();
    const key = `${chId}_${secId}`;
    if (userBookmarks.has(key)) {
        const res = await APIClient.getBookmarks(user.id);
        const match = res.success ? (res.data || []).find(b => b.chapterId === chId && b.sectionId === secId) : null;
        if (match) await APIClient.removeBookmark(match.id);
        userBookmarks.delete(key);
    } else {
        await APIClient.addBookmark(user.id, chId, secId);
        userBookmarks.add(key);
    }
    renderChapterContent(currentChapter);
}

// === NOTES DRAWER & MODAL ===

async function openNotesDrawer(chapterId) {
    const lang = LanguageManager.getCurrentLanguage();
    const user = SessionManager.getCurrentUser();
    const modal = getOrCreateReaderModal('readerNotesModal', t('my_notes'));
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `<div class="loading-message">${t('loading')}</div>`;
    modal.style.display = 'flex';

    try {
        const res = await APIClient.getNotes(user.id);
        const notes = res.success ? (res.data || []) : [];
        const chapterNotes = chapterId ? notes.filter(n => n.chapterId === chapterId) : notes;

        modalBody.innerHTML = `
            <div style="margin-bottom: 16px; display: flex; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="openAddNoteModal('${chapterId || currentChapterId}', '${currentSectionId || ''}')">
                    + ${t('add_note')}
                </button>
            </div>
            ${chapterNotes.length === 0 ? `<p style="text-align: center; color: var(--text-muted); padding: 20px 0;">${t('no_notes')}</p>` : `
                <div style="display: flex; flex-direction: column; gap: 12px; max-height: 420px; overflow-y: auto;">
                    ${chapterNotes.map(n => `
                        <div style="background: var(--bg-tertiary); padding: 14px; border-radius: 8px; border-left: 3px solid var(--accent-success);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <small style="color: var(--text-muted);">${new Date(n.createdAt).toLocaleDateString()}</small>
                                <button class="btn btn-outline" style="padding: 2px 8px; font-size: 11px;" onclick="deleteReaderNote('${n.id}')">${t('delete')}</button>
                            </div>
                            <p style="margin: 0; font-size: 14px; color: var(--text-primary); white-space: pre-wrap;">${escapeHtml(n.content)}</p>
                        </div>
                    `).join('')}
                </div>
            `}
        `;
    } catch (err) {
        modalBody.innerHTML = `<p class="error-message show">${handleAPIError(err)}</p>`;
    }
}

function openAddNoteModal(chapterId, sectionId) {
    const modal = getOrCreateReaderModal('addNoteModal', t('add_personal_note'));
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <form id="readerNoteForm">
            <div class="form-group">
                <textarea id="readerNoteContent" placeholder="${t('note_placeholder')}" required style="min-height: 130px;"></textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" class="btn btn-outline" onclick="document.getElementById('addNoteModal').style.display='none'">${t('cancel')}</button>
                <button type="submit" class="btn btn-primary">${t('save_note')}</button>
            </div>
        </form>
    `;
    modal.style.display = 'flex';

    document.getElementById('readerNoteForm').onsubmit = async (e) => {
        e.preventDefault();
        const content = document.getElementById('readerNoteContent').value.trim();
        if (!content) return;
        const user = SessionManager.getCurrentUser();
        await APIClient.addNote(user.id, chapterId || currentChapterId, sectionId || '', content);
        modal.style.display = 'none';
        openNotesDrawer(chapterId || currentChapterId);
    };
}

window.deleteReaderNote = async function(noteId) {
    if (confirm(t('delete') + '?')) {
        await APIClient.deleteNote(noteId);
        openNotesDrawer(currentChapterId);
    }
};

// === QUESTIONS MODAL & DRAWER ===

function openQuestionModal(chapterId, sectionId, secTitle) {
    const modal = getOrCreateReaderModal('readerAskQuestionModal', t('ask_question_title'));
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `
        <form id="readerQuestionForm">
            <div class="form-group">
                <label style="font-size: 12px; color: var(--text-muted);">${t('section')}</label>
                <input type="text" value="${escapeHtml(secTitle || 'General Topic')}" disabled style="background: var(--bg-secondary); color: var(--text-secondary);">
            </div>
            <div class="form-group">
                <label>${t('question_type')}</label>
                <select id="readerQuestionType">
                    <option value="concept">${t('type_concept')}</option>
                    <option value="code">${t('type_code')}</option>
                    <option value="example">${t('type_example')}</option>
                    <option value="difference">${t('type_difference')}</option>
                    <option value="other">${t('type_other')}</option>
                </select>
            </div>
            <div class="form-group">
                <label>${t('what_confused')}</label>
                <textarea id="readerQuestionText" placeholder="${t('what_confused_placeholder')}" required></textarea>
            </div>
            <div class="form-group">
                <label>${t('what_understand')}</label>
                <textarea id="readerUnderstanding" placeholder="${t('what_understand_placeholder')}"></textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" class="btn btn-outline" onclick="document.getElementById('readerAskQuestionModal').style.display='none'">${t('cancel')}</button>
                <button type="submit" class="btn btn-primary">${t('submit_question')}</button>
            </div>
        </form>
    `;
    modal.style.display = 'flex';

    document.getElementById('readerQuestionForm').onsubmit = async (e) => {
        e.preventDefault();
        const text = document.getElementById('readerQuestionText').value.trim();
        const understanding = document.getElementById('readerUnderstanding').value.trim();
        const qType = document.getElementById('readerQuestionType').value;
        if (!text) return;

        const user = SessionManager.getCurrentUser();
        await APIClient.submitQuestion(
            user.id,
            chapterId || currentChapterId,
            sectionId || '',
            text,
            understanding,
            qType,
            secTitle || 'General'
        );

        modal.style.display = 'none';
        alert(t('saved'));
    };
}

async function openQuestionsDrawer() {
    const lang = LanguageManager.getCurrentLanguage();
    const user = SessionManager.getCurrentUser();
    const modal = getOrCreateReaderModal('readerQuestionsDrawer', t('my_questions'));
    const modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `<div class="loading-message">${t('loading')}</div>`;
    modal.style.display = 'flex';

    try {
        const res = await APIClient.getQuestions(user.id);
        const questions = res.success ? (res.data || []) : [];

        modalBody.innerHTML = `
            <div style="margin-bottom: 16px; display: flex; justify-content: flex-end;">
                <button class="btn btn-primary" onclick="openQuestionModal('${currentChapterId}', '${currentSectionId || ''}', '')">
                    + ${t('ask_question')}
                </button>
            </div>
            ${questions.length === 0 ? `<p style="text-align: center; color: var(--text-muted); padding: 20px 0;">${t('no_questions')}</p>` : `
                <div style="display: flex; flex-direction: column; gap: 14px; max-height: 450px; overflow-y: auto;">
                    ${questions.map(q => {
                        const isAns = q.status === 'ANSWERED';
                        return `
                            <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 10px; border: 1px solid var(--border-color);">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                    <span class="badge ${isAns ? 'green' : ''}">${isAns ? t('status_answered') : t('status_pending')}</span>
                                    <small style="color: var(--text-muted);">${new Date(q.createdAt).toLocaleDateString()}</small>
                                </div>
                                <h4 style="margin: 0 0 6px; font-size: 15px;">❓ ${escapeHtml(q.questionText)}</h4>
                                ${q.understanding ? `<p style="font-size: 13px; color: var(--text-muted); margin: 0 0 8px; font-style: italic;">"${escapeHtml(q.understanding)}"</p>` : ''}
                                ${isAns && q.answer ? `
                                    <div style="background: var(--bg-secondary); padding: 10px 12px; border-radius: 6px; border-left: 3px solid var(--accent-primary); margin-top: 8px;">
                                        <strong style="color: var(--accent-primary); font-size: 12px; display: block; margin-bottom: 3px;">💬 Instructor Answer:</strong>
                                        <p style="margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(q.answer)}</p>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        `;
    } catch (err) {
        modalBody.innerHTML = `<p class="error-message show">${handleAPIError(err)}</p>`;
    }
}

function openBookmarksDrawer() {
    window.location.href = 'dashboard.html';
}

function setupEventListeners() {
    const toggleSidebarBtn = document.getElementById('toggleSidebar');
    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.classList.toggle('open');
        });
    }
}

function getOrCreateReaderModal(modalId, titleText) {
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 620px;">
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
