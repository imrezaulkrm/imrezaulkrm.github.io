/* Dashboard Page Logic */

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    
    const user = SessionManager.getCurrentUser();
    document.getElementById('displayName').textContent = user.displayName || user.username;

    // Load dashboard data
    await loadDashboard();
    
    // Set up event listeners
    document.getElementById('profileBtn').addEventListener('click', openProfileModal);
    document.getElementById('closeProfileModal').addEventListener('click', closeProfileModal);
    document.getElementById('passwordForm').addEventListener('submit', updatePassword);
    
    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', handleLanguageChange);
    });
});

async function loadDashboard() {
    try {
        const user = SessionManager.getCurrentUser();
        
        // Get user progress
        const progressResponse = await APIClient.getProgress(user.id);
        
        if (progressResponse.success) {
            const progress = progressResponse.data;
            
            // Update statistics
            document.getElementById('chaptersCompleted').textContent = progress.chaptersCompleted || 0;
            document.getElementById('quizAverage').textContent = (progress.quizAverage || 0) + '%';
            document.getElementById('bookmarkCount').textContent = progress.bookmarkCount || 0;
            document.getElementById('questionCount').textContent = progress.questionCount || 0;
            
            // Load current chapter
            if (progress.currentChapterId) {
                const chapterResponse = await APIClient.getChapter(progress.currentChapterId);
                if (chapterResponse.success) {
                    renderCurrentChapter(chapterResponse.data, progress);
                }
            }
        }
        
        // Load all chapters
        const chaptersResponse = await APIClient.getChapters();
        if (chaptersResponse.success) {
            renderChapters(chaptersResponse.data, progressResponse.data);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderCurrentChapter(chapter, progress) {
    const lang = LanguageManager.getCurrentLanguage();
    const currentChapter = document.getElementById('currentChapter');
    
    const percentage = progress.currentProgress || 0;
    const locked = !progress.currentChapterUnlocked;
    
    currentChapter.innerHTML = `
        <div class="chapter-info">
            <h3>${chapter.title[lang]}</h3>
            <p>${lang === 'bn' ? 'অধ্যায়' : 'Chapter'} ${chapter.number}</p>
        </div>
        <div class="chapter-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="progress-percent">${percentage}%</span>
            <a href="reader.html?chapter=${chapter.id}" class="btn btn-primary continue-btn">
                ${lang === 'bn' ? 'চালিয়ে যান' : 'Continue'}
            </a>
        </div>
    `;
    
    currentChapter.classList.remove('loading');
}

function renderChapters(chapters, progress) {
    const lang = LanguageManager.getCurrentLanguage();
    const chaptersList = document.getElementById('chaptersList');
    
    chaptersList.innerHTML = chapters.map(chapter => {
        const isCompleted = progress.completedChapters?.includes(chapter.id);
        const isUnlocked = progress.unlockedChapters?.includes(chapter.id);
        
        return `
            <a href="reader.html?chapter=${chapter.id}" class="chapter-item ${!isUnlocked ? 'locked' : ''}">
                <div class="chapter-number">${lang === 'bn' ? 'অধ্যায়' : 'Chapter'} ${chapter.number}</div>
                <h3 class="chapter-title">${chapter.title[lang]}</h3>
                ${isCompleted ? '<span class="chapter-badge">✓ Completed</span>' : ''}
                ${!isUnlocked ? '<span class="chapter-badge locked">🔒 Locked</span>' : ''}
            </a>
        `;
    }).join('');
}

function openProfileModal() {
    const user = SessionManager.getCurrentUser();
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileDisplayName').textContent = user.displayName || user.username;
    document.getElementById('profileModal').style.display = 'flex';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

async function updatePassword(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('profileMessage');
    
    if (newPassword !== confirmPassword) {
        messageDiv.innerHTML = '<p class="error-message">Passwords do not match.</p>';
        return;
    }
    
    try {
        const user = SessionManager.getCurrentUser();
        const response = await APIClient.updatePassword(user.id, newPassword);
        
        if (response.success) {
            messageDiv.innerHTML = '<p class="success-message">Password updated successfully!</p>';
            document.getElementById('passwordForm').reset();
            setTimeout(() => closeProfileModal(), 2000);
        } else {
            messageDiv.innerHTML = '<p class="error-message">' + (response.error || 'Failed to update password.') + '</p>';
        }
    } catch (error) {
        messageDiv.innerHTML = '<p class="error-message">An error occurred. Please try again.</p>';
    }
}

function handleLanguageChange(e) {
    const lang = e.target.getAttribute('data-lang');
    LanguageManager.setLanguage(lang);
    
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Reload dashboard with new language
    loadDashboard();
}
