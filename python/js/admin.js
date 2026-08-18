/* Admin Panel Full CRUD & Analytics Logic */

let editingUserId = null;
let editingChapterId = null;
let currentSelectedQuizId = null;
let answeringQuestionId = null;

document.addEventListener('DOMContentLoaded', async () => {
    requireAdmin();
    
    const user = SessionManager.getCurrentUser();
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl && user) {
        adminNameEl.textContent = user.displayName || user.username;
    }
    
    // Set up navigation
    document.querySelectorAll('.admin-nav a[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // Switch to initial dashboard view
    switchSection('dashboard');

    // Attach Action Buttons
    setupActionListeners();

    // Listen for language changes from i18n
    window.addEventListener('languageChanged', () => {
        const activeNav = document.querySelector('.admin-nav a.active');
        if (activeNav) {
            const section = activeNav.getAttribute('data-section');
            loadSectionData(section);
        }
    });
});

function switchSection(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    
    const targetSection = document.getElementById(section + 'Section');
    if (targetSection) targetSection.style.display = 'block';
    
    document.querySelectorAll('.admin-nav a[data-section]').forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector(`.admin-nav a[data-section="${section}"]`);
    if (activeItem) activeItem.classList.add('active');
    
    const titles = {
        'dashboard': 'Admin Dashboard',
        'users': 'User Management',
        'chapters': 'Chapter Management',
        'content': 'Content & Sections Management',
        'quizzes': 'Quiz Management',
        'questions': 'Questions & Student Support',
        'progress': 'Learner Progress Inspection',
        'settings': 'Platform Settings'
    };
    const titleEl = document.getElementById('sectionTitle');
    if (titleEl) titleEl.textContent = titles[section] || 'Admin Panel';
    
    loadSectionData(section);
}

async function loadSectionData(section) {
    try {
        switch(section) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'users':
                await loadUsers();
                break;
            case 'chapters':
                await loadChapters();
                break;
            case 'content':
                await loadContentSection();
                break;
            case 'quizzes':
                await loadQuizzes();
                break;
            case 'questions':
                await loadQuestions();
                break;
            case 'progress':
                await loadProgress();
                break;
            case 'settings':
                await loadSettings();
                break;
        }
    } catch (error) {
        console.error('Error loading section data:', error);
    }
}

// === 1. DASHBOARD ===

async function loadDashboard() {
    try {
        const statsRes = await APIClient.getStats();
        if (statsRes.success && statsRes.data) {
            const d = statsRes.data;
            document.getElementById('totalUsers').textContent = d.totalUsers || 0;
            document.getElementById('activeUsers').textContent = d.activeUsers || 0;
            document.getElementById('totalChapters').textContent = d.totalChapters || 0;
            document.getElementById('pendingQuestions').textContent = d.pendingQuestions || 0;
            const quizAvgEl = document.getElementById('quizAverage');
            if (quizAvgEl) quizAvgEl.textContent = (d.quizAverage || 0) + '%';
            
            const activityLog = document.getElementById('activityLog');
            if (activityLog) {
                const logs = d.recentActivity || [];
                if (logs.length === 0) {
                    activityLog.innerHTML = '<p style="color: var(--text-muted);">No activity recorded yet.</p>';
                } else {
                    activityLog.innerHTML = logs.map(a => `
                        <div class="activity-item">
                            <div class="activity-time">${new Date(a.timestamp).toLocaleString()}</div>
                            <div class="activity-text"><strong>${escapeHtml(a.action || 'LOG')}:</strong> ${escapeHtml(a.description || '')}</div>
                        </div>
                    `).join('');
                }
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// === 2. USERS MANAGEMENT ===

async function loadUsers() {
    try {
        const res = await APIClient.getUsers();
        if (res.success) {
            const users = res.data || [];
            const usersList = document.getElementById('usersList');
            usersList.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Display Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td><strong>${escapeHtml(u.username)}</strong></td>
                                <td>${escapeHtml(u.displayName || u.username)}</td>
                                <td><span class="badge ${u.role === 'ADMIN' ? '' : 'green'}">${u.role}</span></td>
                                <td><span class="badge ${u.status === 'ACTIVE' ? 'green' : 'red'}">${u.status}</span></td>
                                <td>
                                    <button class="btn btn-small" onclick="openEditUserModal('${u.id}', '${escapeHtml(u.username)}', '${escapeHtml(u.displayName || '')}', '${u.role}', '${u.status}')">Edit</button>
                                    <button class="btn ${u.status === 'ACTIVE' ? 'btn-danger' : 'btn-outline'} btn-small" onclick="toggleUserStatus('${u.id}', '${u.status}')">
                                        ${u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

window.openEditUserModal = function(id, username, displayName, role, status) {
    editingUserId = id;
    document.getElementById('userModalTitle').textContent = 'Edit User';
    document.getElementById('formUsername').value = username;
    document.getElementById('formUsername').disabled = true;
    document.getElementById('formDisplayName').value = displayName;
    document.getElementById('formRole').value = role;
    document.getElementById('formStatus').value = status;
    document.getElementById('formPassword').value = '';
    document.getElementById('formPasswordLabel').textContent = 'New Password (leave blank to keep current)';
    document.getElementById('userModal').style.display = 'flex';
};

window.toggleUserStatus = async function(id, currentStatus) {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    if (confirm(`Change status to ${newStatus}?`)) {
        await APIClient.updateUser(id, { status: newStatus });
        await loadUsers();
    }
};

// === 3. CHAPTERS MANAGEMENT ===

async function loadChapters() {
    try {
        const lang = LanguageManager.getCurrentLanguage();
        const res = await APIClient.getChapters();
        if (res.success) {
            const chapters = res.data || [];
            const chaptersList = document.getElementById('chaptersList');
            chaptersList.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title (EN)</th>
                            <th>Title (BN)</th>
                            <th>Part</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chapters.map(c => `
                            <tr>
                                <td><strong>${c.number}</strong></td>
                                <td>${escapeHtml(c.title?.en || '')}</td>
                                <td>${escapeHtml(c.title?.bn || '')}</td>
                                <td><span class="badge">${escapeHtml(c.partId || 'fundamentals')}</span></td>
                                <td><span class="badge ${c.status === 'PUBLISHED' ? 'green' : ''}">${c.status}</span></td>
                                <td>
                                    <button class="btn btn-small" onclick="openEditChapterModal('${c.id}')">Edit</button>
                                    <button class="btn btn-outline btn-small" onclick="toggleChapterPublish('${c.id}', '${c.status}')">
                                        ${c.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Error loading chapters:', error);
    }
}

window.openEditChapterModal = async function(chapterId) {
    editingChapterId = chapterId;
    const res = await APIClient.getChapter(chapterId);
    if (!res.success) return;
    const c = res.data;

    document.getElementById('chapterModalTitle').textContent = 'Edit Chapter';
    document.getElementById('formChapterPart').value = c.partId || 'fundamentals';
    document.getElementById('formChapterNumber').value = c.number || 1;
    document.getElementById('formChapterTitleEn').value = c.title?.en || '';
    document.getElementById('formChapterTitleBn').value = c.title?.bn || '';
    document.getElementById('formChapterDescEn').value = c.description?.en || '';
    document.getElementById('formChapterDescBn').value = c.description?.bn || '';
    document.getElementById('formChapterStatus').value = c.status || 'PUBLISHED';
    document.getElementById('chapterModal').style.display = 'flex';
};

window.toggleChapterPublish = async function(chapterId, currentStatus) {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    await APIClient.updateChapter(chapterId, { status: newStatus });
    await loadChapters();
};

// === 4. CONTENT & SECTIONS MANAGEMENT ===

async function loadContentSection() {
    try {
        const lang = LanguageManager.getCurrentLanguage();
        const chRes = await APIClient.getChapters();
        const chapters = chRes.success ? (chRes.data || []) : [];
        const chSelect = document.getElementById('chapterSelect');
        const selectedChId = chSelect.value || (chapters.length > 0 ? chapters[0].id : '');

        chSelect.innerHTML = chapters.map(c => `
            <option value="${c.id}" ${c.id === selectedChId ? 'selected' : ''}>
                Chapter ${c.number}: ${escapeHtml(c.title?.en || '')}
            </option>
        `).join('');

        if (selectedChId) {
            await renderChapterContentAdmin(selectedChId);
        }
    } catch (error) {
        console.error('Error loading content admin:', error);
    }
}

async function renderChapterContentAdmin(chapterId) {
    const lang = LanguageManager.getCurrentLanguage();
    const res = await APIClient.getChapterContent(chapterId);
    const contentList = document.getElementById('contentList');
    if (!res.success || !res.data) {
        contentList.innerHTML = '<p style="color: var(--text-muted); padding: 20px;">No content found for this chapter.</p>';
        return;
    }

    const chapter = res.data;
    const sections = chapter.sections || [];

    if (sections.length === 0) {
        contentList.innerHTML = `
            <div style="padding: 30px; text-align: center; color: var(--text-muted);">
                <p>No sections created for this chapter yet.</p>
                <button class="btn btn-primary" onclick="openCreateSectionModal('${chapterId}')" style="margin-top: 12px;">+ Create First Section</button>
            </div>
        `;
        return;
    }

    contentList.innerHTML = sections.map((sec, sIdx) => `
        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                <div>
                    <span class="badge">Section ${sec.order || (sIdx + 1)}</span>
                    <h3 style="display: inline; margin-left: 10px; font-size: 18px;">${escapeHtml(sec.title?.en || '')} <small style="color: var(--text-muted);">(${escapeHtml(sec.title?.bn || '')})</small></h3>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-small btn-outline" onclick="openAddContentBlockModal('${sec.id}')">+ Add Block</button>
                    <button class="btn btn-small" onclick="editSectionPrompt('${sec.id}', '${escapeHtml(sec.title?.en || '')}', '${escapeHtml(sec.title?.bn || '')}')">Edit Section</button>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${(sec.blocks || []).length === 0 ? '<p style="font-size: 13px; color: var(--text-muted);">No content blocks in this section.</p>' : ''}
                ${(sec.blocks || []).map(b => `
                    <div style="background: var(--bg-secondary); padding: 12px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span class="badge" style="font-size: 10px; text-transform: uppercase;">${b.type}</span>
                            <span style="font-size: 14px; margin-left: 8px; color: var(--text-primary); font-weight: 500;">
                                ${escapeHtml(b.title?.en || b.content?.en?.substring(0, 60) || 'Content block')}...
                            </span>
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn btn-small btn-danger" onclick="deleteContentBlock('${b.id}')">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

window.openCreateSectionModal = function(chapterId) {
    const chSelect = document.getElementById('formSectionChapter');
    chSelect.innerHTML = `<option value="${chapterId}">Current Chapter</option>`;
    document.getElementById('formSectionTitleEn').value = '';
    document.getElementById('formSectionTitleBn').value = '';
    document.getElementById('formSectionOrder').value = 1;
    document.getElementById('sectionModal').style.display = 'flex';
};

window.editSectionPrompt = async function(sectionId, currentEn, currentBn) {
    const titleEn = prompt('Edit English Section Title:', currentEn);
    if (!titleEn) return;
    const titleBn = prompt('Edit Bangla Section Title:', currentBn) || titleEn;
    await APIClient.updateSection(sectionId, { titleEn, titleBn });
    await loadContentSection();
};

window.openAddContentBlockModal = function(sectionId) {
    const secSelect = document.getElementById('formContentSection');
    secSelect.innerHTML = `<option value="${sectionId}">Selected Section</option>`;
    document.getElementById('formContentTitleEn').value = '';
    document.getElementById('formContentTitleBn').value = '';
    document.getElementById('formContentBodyEn').value = '';
    document.getElementById('formContentBodyBn').value = '';
    document.getElementById('formContentOrder').value = 1;
    document.getElementById('contentModal').style.display = 'flex';
};

window.deleteContentBlock = async function(contentId) {
    if (confirm('Delete this content block?')) {
        await APIClient.deleteContent(contentId);
        await loadContentSection();
    }
};

// === 5. QUIZZES MANAGEMENT ===

async function loadQuizzes() {
    try {
        const res = await APIClient.getQuizzes();
        if (res.success) {
            const quizzes = res.data || [];
            const quizzesList = document.getElementById('quizzesList');
            quizzesList.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Chapter</th>
                            <th>Quiz Title</th>
                            <th>Pass Mark</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quizzes.map(q => {
                            const chTitle = q.chapterInfo ? `Chapter ${q.chapterInfo.number}: ${q.chapterInfo.titleEn}` : `Chapter ID: ${q.chapterId}`;
                            return `
                                <tr>
                                    <td><strong>${escapeHtml(chTitle)}</strong></td>
                                    <td>${escapeHtml(q.title?.en || '')}</td>
                                    <td>${q.passPercentage}%</td>
                                    <td><span class="badge ${q.status === 'PUBLISHED' ? 'green' : ''}">${q.status}</span></td>
                                    <td>
                                        <button class="btn btn-primary btn-small" onclick="openManageQuizQuestions('${q.id}')">Manage Questions</button>
                                        <button class="btn btn-outline btn-small" onclick="editQuizPassMarkPrompt('${q.id}', ${q.passPercentage})">Edit Pass %</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Error loading quizzes:', error);
    }
}

window.editQuizPassMarkPrompt = async function(quizId, currentMark) {
    const mark = prompt('Enter new pass mark percentage (10-100):', currentMark);
    if (mark && !isNaN(Number(mark))) {
        await APIClient.updateQuiz(quizId, { passPercentage: Number(mark) });
        await loadQuizzes();
    }
};

window.openManageQuizQuestions = async function(quizId) {
    currentSelectedQuizId = quizId;
    document.getElementById('qqQuestionEn').value = '';
    document.getElementById('qqQuestionBn').value = '';
    document.getElementById('qqExplanationEn').value = '';
    document.getElementById('qqExplanationBn').value = '';
    document.getElementById('qqOpt0En').value = '';
    document.getElementById('qqOpt0Bn').value = '';
    document.getElementById('qqOpt1En').value = '';
    document.getElementById('qqOpt1Bn').value = '';
    document.getElementById('qqOpt2En').value = '';
    document.getElementById('qqOpt2Bn').value = '';
    document.getElementById('qqOpt3En').value = '';
    document.getElementById('qqOpt3Bn').value = '';
    document.getElementById('quizQuestionModal').style.display = 'flex';
};

// === 6. QUESTIONS & STUDENT SUPPORT ===

async function loadQuestions() {
    try {
        const filter = document.getElementById('questionFilter')?.value || 'ALL';
        const res = await APIClient.getAllQuestions();
        if (res.success) {
            let questions = res.data || [];
            if (filter !== 'ALL') {
                questions = questions.filter(q => q.status === filter);
            }

            const questionsList = document.getElementById('questionsList');
            if (questions.length === 0) {
                questionsList.innerHTML = '<p style="color: var(--text-muted); padding: 20px; text-align: center;">No questions matching filter.</p>';
                return;
            }

            questionsList.innerHTML = questions.map(q => {
                const isPending = q.status === 'PENDING';
                return `
                    <div class="question-card">
                        <div class="question-header">
                            <div>
                                <span class="question-user">👤 ${escapeHtml(q.userName)}</span>
                                <span style="color: var(--text-muted); font-size: 12px; margin-left: 10px;">Topic: ${escapeHtml(q.topic || 'Python')}</span>
                            </div>
                            <span class="question-status ${q.status.toLowerCase()}">${q.status}</span>
                        </div>
                        <div class="question-text">
                            <strong>Question:</strong> ${escapeHtml(q.questionText)}
                            ${q.understanding ? `<br><small style="color: var(--text-muted); font-style: italic;">Learner understood: "${escapeHtml(q.understanding)}"</small>` : ''}
                        </div>
                        ${q.answer ? `
                            <div style="background: var(--bg-secondary); padding: 12px 14px; border-radius: 8px; border-left: 3px solid var(--accent-success); margin-bottom: 12px;">
                                <strong style="color: var(--accent-success); font-size: 13px;">Your Answer:</strong>
                                <p style="margin: 4px 0 0; color: var(--text-secondary); font-size: 14px; white-space: pre-wrap;">${escapeHtml(q.answer)}</p>
                            </div>
                        ` : ''}
                        <button class="btn btn-primary btn-small" onclick="openAnswerModal('${q.id}', '${escapeHtml(q.userName)}', '${escapeHtml(q.questionText)}')">
                            ${isPending ? '✍️ Answer Question' : '✏️ Edit Answer'}
                        </button>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

window.openAnswerModal = function(qId, userName, questionText) {
    answeringQuestionId = qId;
    const detailEl = document.getElementById('answerQuestionDetail');
    detailEl.innerHTML = `
        <strong style="color: var(--accent-primary);">${userName} asked:</strong>
        <p style="margin: 6px 0 0; color: var(--text-primary);">${questionText}</p>
    `;
    document.getElementById('answerTextarea').value = '';
    document.getElementById('answerModal').style.display = 'flex';
};

// === 7. LEARNER PROGRESS INSPECTION ===

async function loadProgress() {
    try {
        const usersRes = await APIClient.getUsers();
        const userSelect = document.getElementById('userSelect');
        const users = usersRes.success ? (usersRes.data || []).filter(u => u.role === 'USER') : [];

        userSelect.innerHTML = '<option value="">Select User to Inspect...</option>' + users.map(u => `
            <option value="${u.id}">${escapeHtml(u.displayName || u.username)} (${escapeHtml(u.username)})</option>
        `).join('');

        userSelect.onchange = async (e) => {
            const selectedUserId = e.target.value;
            if (!selectedUserId) {
                document.getElementById('userProgressData').innerHTML = '<p style="color: var(--text-muted); text-align: center;">Select a user to inspect progress.</p>';
                return;
            }

            const pRes = await APIClient.getProgress(selectedUserId);
            if (pRes.success && pRes.data) {
                const p = pRes.data;
                document.getElementById('userProgressData').innerHTML = `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
                        <div class="stat-card">
                            <div class="stat-number">${p.chaptersCompleted || 0} / ${p.totalChapters || 0}</div>
                            <div class="stat-label">Chapters Completed</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${p.overallProgress || 0}%</div>
                            <div class="stat-label">Overall Curriculum Progress</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${p.quizAverage || 0}%</div>
                            <div class="stat-label">Quiz Average Score</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${p.bookmarkCount || 0}</div>
                            <div class="stat-label">Saved Bookmarks</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${p.questionCount || 0}</div>
                            <div class="stat-label">Questions Asked</div>
                        </div>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 18px; border-radius: 10px;">
                        <h4 style="margin: 0 0 10px;">Curriculum Progression Status</h4>
                        <div class="progress-bar" style="height: 10px; margin-bottom: 14px;">
                            <div class="progress-fill" style="width: ${p.overallProgress || 0}%;"></div>
                        </div>
                        <p style="font-size: 14px; color: var(--text-secondary); margin: 0;">
                            Completed Chapter IDs: <code>${(p.completedChapters || []).join(', ') || 'None yet'}</code>
                        </p>
                    </div>
                `;
            }
        };
    } catch (error) {
        console.error('Error loading progress view:', error);
    }
}

// === 8. SETTINGS ===

async function loadSettings() {
    try {
        const res = await APIClient.getSettings();
        if (res.success && res.data) {
            if (res.data.DEFAULT_PASS_MARK) {
                document.getElementById('passMarkSetting').value = res.data.DEFAULT_PASS_MARK;
            }
            if (res.data.PLATFORM_TITLE) {
                document.getElementById('platformTitleSetting').value = res.data.PLATFORM_TITLE;
            }
            if (res.data.DEFAULT_LANGUAGE) {
                document.getElementById('defaultLangSetting').value = res.data.DEFAULT_LANGUAGE;
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Attach Action Listeners
function setupActionListeners() {
    // 1. Create User button
    document.getElementById('createUserBtn')?.addEventListener('click', () => {
        editingUserId = null;
        document.getElementById('userModalTitle').textContent = 'Create User';
        document.getElementById('formUsername').value = '';
        document.getElementById('formUsername').disabled = false;
        document.getElementById('formDisplayName').value = '';
        document.getElementById('formPassword').value = '';
        document.getElementById('formPasswordLabel').textContent = 'Password';
        document.getElementById('userModal').style.display = 'flex';
    });

    document.getElementById('closeUserModal')?.addEventListener('click', () => {
        document.getElementById('userModal').style.display = 'none';
    });

    document.getElementById('userForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('formUsername').value.trim();
        const displayName = document.getElementById('formDisplayName').value.trim();
        const password = document.getElementById('formPassword').value;
        const role = document.getElementById('formRole').value;
        const status = document.getElementById('formStatus').value;

        if (editingUserId) {
            const payload = { displayName, role, status };
            if (password) payload.password = password;
            await APIClient.updateUser(editingUserId, payload);
        } else {
            if (!password) {
                alert('Password is required for new user.');
                return;
            }
            await APIClient.createUser(username, displayName, password, role);
        }

        document.getElementById('userModal').style.display = 'none';
        await loadUsers();
    });

    // 2. Create Chapter button
    document.getElementById('createChapterBtn')?.addEventListener('click', () => {
        editingChapterId = null;
        document.getElementById('chapterModalTitle').textContent = 'Create Chapter';
        document.getElementById('chapterForm').reset();
        document.getElementById('chapterModal').style.display = 'flex';
    });

    document.getElementById('chapterForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            partId: document.getElementById('formChapterPart').value,
            number: Number(document.getElementById('formChapterNumber').value),
            titleEn: document.getElementById('formChapterTitleEn').value.trim(),
            titleBn: document.getElementById('formChapterTitleBn').value.trim(),
            descriptionEn: document.getElementById('formChapterDescEn').value.trim(),
            descriptionBn: document.getElementById('formChapterDescBn').value.trim(),
            status: document.getElementById('formChapterStatus').value
        };

        if (editingChapterId) {
            await APIClient.updateChapter(editingChapterId, payload);
        } else {
            await APIClient.createChapter(payload);
        }

        document.getElementById('chapterModal').style.display = 'none';
        await loadChapters();
    });

    // 3. Section dropdown change in content tab
    document.getElementById('chapterSelect')?.addEventListener('change', (e) => {
        if (e.target.value) renderChapterContentAdmin(e.target.value);
    });

    document.getElementById('createSectionBtn')?.addEventListener('click', () => {
        const chId = document.getElementById('chapterSelect').value;
        if (!chId) { alert('Please select a chapter first.'); return; }
        openCreateSectionModal(chId);
    });

    document.getElementById('sectionForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const chapterId = document.getElementById('chapterSelect').value;
        const titleEn = document.getElementById('formSectionTitleEn').value.trim();
        const titleBn = document.getElementById('formSectionTitleBn').value.trim();
        const order = Number(document.getElementById('formSectionOrder').value);

        await APIClient.createSection({ chapterId, titleEn, titleBn, order, status: 'PUBLISHED' });
        document.getElementById('sectionModal').style.display = 'none';
        await loadContentSection();
    });

    // 4. Content block form
    document.getElementById('createContentBtn')?.addEventListener('click', () => {
        alert('Click "+ Add Block" on the specific section where you want to add content.');
    });

    document.getElementById('contentBlockForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sectionId = document.getElementById('formContentSection').value;
        const contentType = document.getElementById('formContentType').value;
        const titleEn = document.getElementById('formContentTitleEn').value.trim();
        const titleBn = document.getElementById('formContentTitleBn').value.trim();
        const contentEn = document.getElementById('formContentBodyEn').value.trim();
        const contentBn = document.getElementById('formContentBodyBn').value.trim();
        const order = Number(document.getElementById('formContentOrder').value);

        await APIClient.createContent({
            sectionId,
            contentType,
            titleEn,
            titleBn,
            contentEn,
            contentBn,
            order,
            status: 'PUBLISHED'
        });

        document.getElementById('contentModal').style.display = 'none';
        await loadContentSection();
    });

    // 5. Create Quiz button
    document.getElementById('createQuizBtn')?.addEventListener('click', async () => {
        const chRes = await APIClient.getChapters();
        const chapters = chRes.success ? (chRes.data || []) : [];
        if (chapters.length === 0) { alert('Create a chapter first.'); return; }

        const chId = prompt('Enter Chapter ID for this quiz (Available: ' + chapters.map(c => c.id).join(', ') + '):', chapters[0].id);
        if (!chId) return;
        const titleEn = prompt('Enter Quiz Title (English):', 'Chapter Quiz');
        if (!titleEn) return;
        const passPct = Number(prompt('Enter Pass Percentage:', '70') || 70);

        await APIClient.createQuiz({ chapterId: chId, titleEn, passPercentage: passPct, status: 'PUBLISHED' });
        await loadQuizzes();
    });

    // Quiz Question form submit
    document.getElementById('quizQuestionForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentSelectedQuizId) return;

        const questionEn = document.getElementById('qqQuestionEn').value.trim();
        const questionBn = document.getElementById('qqQuestionBn').value.trim();
        const explanationEn = document.getElementById('qqExplanationEn').value.trim();
        const explanationBn = document.getElementById('qqExplanationBn').value.trim();
        const correctRadio = document.querySelector('input[name="qqCorrectRadio"]:checked');
        const correctIndex = correctRadio ? parseInt(correctRadio.value, 10) : 0;

        const options = [
            { en: document.getElementById('qqOpt0En').value.trim(), bn: document.getElementById('qqOpt0Bn').value.trim() },
            { en: document.getElementById('qqOpt1En').value.trim(), bn: document.getElementById('qqOpt1Bn').value.trim() },
            { en: document.getElementById('qqOpt2En').value.trim(), bn: document.getElementById('qqOpt2Bn').value.trim() },
            { en: document.getElementById('qqOpt3En').value.trim(), bn: document.getElementById('qqOpt3Bn').value.trim() }
        ];

        await APIClient.createQuizQuestion({
            quizId: currentSelectedQuizId,
            questionEn,
            questionBn,
            explanationEn,
            explanationBn,
            options,
            correctIndex
        });

        document.getElementById('quizQuestionModal').style.display = 'none';
        alert('Quiz question added successfully!');
    });

    // 6. Question Filter
    document.getElementById('questionFilter')?.addEventListener('change', () => {
        loadQuestions();
    });

    // Answer Submit form
    document.getElementById('answerSubmitForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const answer = document.getElementById('answerTextarea').value.trim();
        if (!answer || !answeringQuestionId) return;

        await APIClient.answerQuestion(answeringQuestionId, answer);
        document.getElementById('answerModal').style.display = 'none';
        alert('Answer submitted to the student!');
        await loadQuestions();
    });

    // 7. Settings form submit
    document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const passMark = Number(document.getElementById('passMarkSetting').value);
        const title = document.getElementById('platformTitleSetting').value.trim();
        const defaultLang = document.getElementById('defaultLangSetting').value;

        const res = await APIClient.updateSettings({
            DEFAULT_PASS_MARK: passMark,
            PLATFORM_TITLE: title,
            DEFAULT_LANGUAGE: defaultLang
        });

        const msgEl = document.getElementById('settingsMessage');
        if (msgEl) {
            msgEl.innerHTML = '<p class="success-message">Settings saved successfully!</p>';
            setTimeout(() => { msgEl.innerHTML = ''; }, 3000);
        }
    });
}

function escapeHtml(str) {
    return String(str || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
