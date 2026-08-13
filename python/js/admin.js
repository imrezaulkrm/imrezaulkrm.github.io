/* Admin Panel Logic */

document.addEventListener('DOMContentLoaded', async () => {
    requireAdmin();
    
    const user = SessionManager.getCurrentUser();
    document.getElementById('adminName').textContent = user.displayName || user.username;
    
    // Set up navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // Load initial dashboard
    switchSection('dashboard');
});

function switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    
    // Show selected section
    document.getElementById(section + 'Section').style.display = 'block';
    
    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Update title
    const titles = {
        'dashboard': 'Admin Dashboard',
        'users': 'User Management',
        'chapters': 'Chapter Management',
        'content': 'Content Management',
        'quizzes': 'Quiz Management',
        'questions': 'Questions',
        'progress': 'User Progress',
        'settings': 'Settings'
    };
    document.getElementById('sectionTitle').textContent = titles[section] || 'Admin Panel';
    
    // Load section data
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
            case 'questions':
                await loadQuestions();
                break;
            case 'progress':
                await loadProgress();
                break;
        }
    } catch (error) {
        console.error('Error loading section:', error);
    }
}

async function loadDashboard() {
    try {
        const stats = await APIClient.getStats();
        if (stats.success) {
            document.getElementById('totalUsers').textContent = stats.data.totalUsers || 0;
            document.getElementById('activeUsers').textContent = stats.data.activeUsers || 0;
            document.getElementById('totalChapters').textContent = stats.data.totalChapters || 0;
            document.getElementById('pendingQuestions').textContent = stats.data.pendingQuestions || 0;
            
            // Display recent activity
            const activityLog = document.getElementById('activityLog');
            activityLog.innerHTML = (stats.data.recentActivity || []).map(activity => `
                <div class="activity-item">
                    <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                    <div class="activity-text">${activity.description}</div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadUsers() {
    try {
        const users = await APIClient.getUsers();
        if (users.success) {
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
                        ${(users.data || []).map(user => `
                            <tr>
                                <td>${user.username}</td>
                                <td>${user.displayName}</td>
                                <td>${user.role}</td>
                                <td>${user.status}</td>
                                <td>
                                    <button class="btn btn-small" onclick="editUser('${user.id}')">Edit</button>
                                    <button class="btn btn-danger btn-small" onclick="deleteUser('${user.id}')">Delete</button>
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

async function loadChapters() {
    try {
        const chapters = await APIClient.getChapters();
        if (chapters.success) {
            const lang = LanguageManager.getCurrentLanguage();
            const chaptersList = document.getElementById('chaptersList');
            chaptersList.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Chapter</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(chapters.data || []).map(chapter => `
                            <tr>
                                <td>${chapter.number}</td>
                                <td>${chapter.title[lang]}</td>
                                <td>${chapter.status}</td>
                                <td>
                                    <button class="btn btn-small" onclick="editChapter('${chapter.id}')">Edit</button>
                                    <button class="btn btn-danger btn-small" onclick="deleteChapter('${chapter.id}')">Delete</button>
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

async function loadQuestions() {
    try {
        const questions = await APIClient.getPendingQuestions();
        if (questions.success) {
            const lang = LanguageManager.getCurrentLanguage();
            const questionsList = document.getElementById('questionsList');
            questionsList.innerHTML = (questions.data || []).map(question => `
                <div class="question-card">
                    <div class="question-header">
                        <div class="question-user">${question.userName} asked:</div>
                        <span class="question-status ${question.status.toLowerCase()}">${question.status}</span>
                    </div>
                    <div class="question-text">${question.questionText}</div>
                    ${question.status === 'PENDING' ? `
                        <form class="answer-form" onsubmit="answerQuestion(event, '${question.id}')">
                            <textarea name="answer" placeholder="Your answer..." required></textarea>
                            <button type="submit" class="btn btn-primary">Submit Answer</button>
                        </form>
                    ` : `
                        <div class="answer-text">
                            <strong>Answer:</strong>
                            <p>${question.answer}</p>
                        </div>
                    `}
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

async function loadProgress() {
    try {
        const users = await APIClient.getUsers();
        const userSelect = document.getElementById('userSelect');
        userSelect.innerHTML = '<option value="">Select User</option>' + (users.data || []).map(user => `
            <option value="${user.id}">${user.displayName} (${user.username})</option>
        `).join('');
        
        userSelect.addEventListener('change', async (e) => {
            if (e.target.value) {
                const progress = await APIClient.getProgress(e.target.value);
                displayUserProgress(progress.data);
            }
        });
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

function displayUserProgress(progress) {
    const progressData = document.getElementById('userProgressData');
    progressData.innerHTML = `
        <div class="progress-item">
            <h3>Chapters Completed: ${progress.chaptersCompleted || 0}</h3>
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.overallProgress || 0}%"></div>
                </div>
                <span>${progress.overallProgress || 0}%</span>
            </div>
        </div>
    `;
}

async function answerQuestion(e, questionId) {
    e.preventDefault();
    const answer = e.target.querySelector('textarea[name="answer"]').value;
    
    try {
        const response = await APIClient.answerQuestion(questionId, answer);
        if (response.success) {
            alert('Answer submitted!');
            await loadQuestions();
        }
    } catch (error) {
        console.error('Error submitting answer:', error);
    }
}

function editUser(userId) {
    // Open user edit modal
    alert('Edit user: ' + userId);
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await APIClient.deleteUser(userId);
            if (response.success) {
                alert('User deleted!');
                await loadUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
}

function editChapter(chapterId) {
    alert('Edit chapter: ' + chapterId);
}

async function deleteChapter(chapterId) {
    if (confirm('Are you sure you want to delete this chapter?')) {
        alert('Chapter deleted: ' + chapterId);
    }
}
