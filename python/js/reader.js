/* Reader Page Logic */

let currentChapterId = null;
let currentSectionId = null;
let allChapters = [];

document.addEventListener('DOMContentLoaded', async () => {
    requireAuth();
    
    // Get chapter ID from URL
    const params = new URLSearchParams(window.location.search);
    currentChapterId = params.get('chapter');
    
    if (!currentChapterId) {
        // Load first unlocked chapter
        await loadFirstUnlockedChapter();
    } else {
        await loadChapter(currentChapterId);
    }
    
    // Set up event listeners
    document.getElementById('bookmarkBtn').addEventListener('click', bookmarkCurrentSection);
    document.getElementById('noteBtn').addEventListener('click', openNoteModal);
    document.getElementById('questionBtn').addEventListener('click', openQuestionModal);
    
    document.getElementById('closeNoteModal').addEventListener('click', () => {
        document.getElementById('noteModal').style.display = 'none';
    });
    document.getElementById('closeQuestionModal').addEventListener('click', () => {
        document.getElementById('questionModal').style.display = 'none';
    });
    
    document.getElementById('noteForm').addEventListener('submit', submitNote);
    document.getElementById('questionForm').addEventListener('submit', submitQuestion);
});

async function loadFirstUnlockedChapter() {
    try {
        const chaptersResponse = await APIClient.getChapters();
        if (chaptersResponse.success) {
            const firstChapter = chaptersResponse.data[0];
            currentChapterId = firstChapter.id;
            await loadChapter(firstChapter.id);
        }
    } catch (error) {
        console.error('Error loading chapters:', error);
    }
}

async function loadChapter(chapterId) {
    try {
        const response = await APIClient.getChapterContent(chapterId);
        
        if (response.success) {
            const chapter = response.data;
            renderChapterContent(chapter);
            loadTableOfContents();
        }
    } catch (error) {
        console.error('Error loading chapter:', error);
    }
}

function renderChapterContent(chapter) {
    const lang = LanguageManager.getCurrentLanguage();
    const content = document.getElementById('readerContent');
    
    const htmlContent = `
        <h1>${chapter.title[lang]}</h1>
        ${chapter.sections.map(section => `
            <section id="section-${section.id}">
                <h2>${section.title[lang]}</h2>
                <div class="section-content">
                    ${section.content[lang]}
                </div>
                <div class="reading-tools">
                    <button class="tool-btn" onclick="bookmarkSection('${section.id}')">🔖 Bookmark</button>
                    <button class="tool-btn" onclick="openNoteModal('${section.id}')">📝 Note</button>
                    <button class="tool-btn" onclick="openQuestionModal('${section.id}')">❓ Question</button>
                </div>
            </section>
        `).join('')}
    `;
    
    content.innerHTML = htmlContent;
    
    // Update progress
    const user = SessionManager.getCurrentUser();
    APIClient.updateProgress(user.id, chapter.id, 100);
}

function loadTableOfContents() {
    // Implementation for loading table of contents
}

async function bookmarkCurrentSection() {
    const user = SessionManager.getCurrentUser();
    try {
        const response = await APIClient.addBookmark(user.id, currentChapterId, currentSectionId);
        if (response.success) {
            alert('Section bookmarked!');
        }
    } catch (error) {
        console.error('Error bookmarking section:', error);
    }
}

function bookmarkSection(sectionId) {
    currentSectionId = sectionId;
    bookmarkCurrentSection();
}

function openNoteModal(sectionId) {
    if (sectionId) currentSectionId = sectionId;
    document.getElementById('noteModal').style.display = 'flex';
}

function openQuestionModal(sectionId) {
    if (sectionId) currentSectionId = sectionId;
    document.getElementById('questionModal').style.display = 'flex';
}

async function submitNote(e) {
    e.preventDefault();
    
    const content = document.getElementById('noteContent').value;
    const user = SessionManager.getCurrentUser();
    
    try {
        const response = await APIClient.addNote(user.id, currentChapterId, currentSectionId, content);
        
        if (response.success) {
            alert('Note saved!');
            document.getElementById('noteForm').reset();
            document.getElementById('noteModal').style.display = 'none';
        }
    } catch (error) {
        console.error('Error saving note:', error);
    }
}

async function submitQuestion(e) {
    e.preventDefault();
    
    const questionText = document.getElementById('questionText').value;
    const understanding = document.getElementById('understanding').value;
    const user = SessionManager.getCurrentUser();
    
    try {
        const response = await APIClient.submitQuestion(
            user.id,
            currentChapterId,
            currentSectionId,
            questionText,
            understanding
        );
        
        if (response.success) {
            alert('Question submitted!');
            document.getElementById('questionForm').reset();
            document.getElementById('questionModal').style.display = 'none';
        }
    } catch (error) {
        console.error('Error submitting question:', error);
    }
}
