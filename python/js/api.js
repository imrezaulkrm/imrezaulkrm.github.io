/* API Communication with Google Apps Script */

class APIClient {
    static async request(action, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SessionManager.getToken()}`
                }
            };

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }

            // For Google Apps Script, we need to add the action as a parameter
            const url = `${CONFIG.API_URL}?action=${action}${method === 'GET' && data ? '&' + new URLSearchParams(data).toString() : ''}`;

            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'API Error');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication
    static async login(username, password) {
        return await this.request('login', 'POST', { username, password });
    }

    // Users
    static async getUser(userId) {
        return await this.request('getUser', 'GET', { userId });
    }

    static async updatePassword(userId, newPassword) {
        return await this.request('updatePassword', 'POST', { userId, newPassword });
    }

    // Chapters
    static async getChapters() {
        return await this.request('getChapters', 'GET');
    }

    static async getChapter(chapterId) {
        return await this.request('getChapter', 'GET', { chapterId });
    }

    static async getChapterContent(chapterId) {
        return await this.request('getChapterContent', 'GET', { chapterId });
    }

    // Progress
    static async getProgress(userId) {
        return await this.request('getProgress', 'GET', { userId });
    }

    static async updateProgress(userId, chapterId, progress) {
        return await this.request('updateProgress', 'POST', { userId, chapterId, progress });
    }

    // Bookmarks
    static async getBookmarks(userId) {
        return await this.request('getBookmarks', 'GET', { userId });
    }

    static async addBookmark(userId, chapterId, sectionId) {
        return await this.request('addBookmark', 'POST', { userId, chapterId, sectionId });
    }

    static async removeBookmark(bookmarkId) {
        return await this.request('removeBookmark', 'POST', { bookmarkId });
    }

    // Notes
    static async getNotes(userId) {
        return await this.request('getNotes', 'GET', { userId });
    }

    static async addNote(userId, chapterId, sectionId, content) {
        return await this.request('addNote', 'POST', { userId, chapterId, sectionId, content });
    }

    static async updateNote(noteId, content) {
        return await this.request('updateNote', 'POST', { noteId, content });
    }

    static async deleteNote(noteId) {
        return await this.request('deleteNote', 'POST', { noteId });
    }

    // Questions
    static async getQuestions(userId) {
        return await this.request('getQuestions', 'GET', { userId });
    }

    static async submitQuestion(userId, chapterId, sectionId, questionText, understanding) {
        return await this.request('submitQuestion', 'POST', {
            userId,
            chapterId,
            sectionId,
            questionText,
            understanding
        });
    }

    static async getPendingQuestions() {
        return await this.request('getPendingQuestions', 'GET');
    }

    static async answerQuestion(questionId, answer) {
        return await this.request('answerQuestion', 'POST', { questionId, answer });
    }

    // Quizzes
    static async getQuiz(chapterId) {
        return await this.request('getQuiz', 'GET', { chapterId });
    }

    static async submitQuizAnswer(userId, quizId, questionId, optionId) {
        return await this.request('submitQuizAnswer', 'POST', { userId, quizId, questionId, optionId });
    }

    static async completeQuiz(userId, quizId, score, percentage, passed) {
        return await this.request('completeQuiz', 'POST', { userId, quizId, score, percentage, passed });
    }

    // Admin functions
    static async createUser(username, displayName, password, role = 'USER') {
        return await this.request('createUser', 'POST', { username, displayName, password, role });
    }

    static async getUsers() {
        return await this.request('getUsers', 'GET');
    }

    static async updateUser(userId, data) {
        return await this.request('updateUser', 'POST', { userId, ...data });
    }

    static async deleteUser(userId) {
        return await this.request('deleteUser', 'POST', { userId });
    }

    // Stats
    static async getStats() {
        return await this.request('getStats', 'GET');
    }
}

// Error handling utility
function handleAPIError(error) {
    console.error('API Error:', error);
    let message = 'Something went wrong. Please try again.';
    
    if (error.message.includes('Invalid')) {
        message = 'Invalid username or password.';
    } else if (error.message.includes('Permission')) {
        message = 'You don\'t have permission to perform this action.';
    } else if (error.message.includes('Not found')) {
        message = 'The requested resource was not found.';
    }
    
    return message;
}
