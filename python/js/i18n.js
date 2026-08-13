/* Internationalization (i18n) */

const translations = {
    en: {
        // Common
        'loading': 'Loading...',
        'save': 'Save',
        'cancel': 'Cancel',
        'delete': 'Delete',
        'edit': 'Edit',
        'close': 'Close',
        'submit': 'Submit',
        'continue': 'Continue',
        'next': 'Next',
        'previous': 'Previous',
        
        // Login
        'login': 'Login',
        'username': 'Username',
        'password': 'Password',
        'logout': 'Logout',
        
        // Dashboard
        'welcome': 'Welcome',
        'dashboard': 'Dashboard',
        'continue_journey': 'Continue your Python journey',
        'your_progress': 'Your Progress',
        'current_chapter': 'Current Chapter',
        'chapters_completed': 'Chapters Completed',
        'quiz_average': 'Quiz Average',
        'bookmarks': 'Bookmarks',
        'questions_asked': 'Questions Asked',
        'quick_actions': 'Quick Actions',
        'continue_reading': 'Continue Reading',
        'my_bookmarks': 'My Bookmarks',
        'my_notes': 'My Notes',
        'my_questions': 'My Questions',
        'all_chapters': 'All Chapters',
        'user_profile': 'User Profile',
        'change_password': 'Change Password',
        'new_password': 'New Password',
        'confirm_password': 'Confirm Password',
        'update_password': 'Update Password',
        'display_name': 'Display Name',
        
        // Reader
        'contents': 'Contents',
        'reading_tools': 'Reading Tools',
        'bookmark_section': 'Bookmark Section',
        'add_note': 'Add Note',
        'ask_question': 'Ask Question',
        'add_personal_note': 'Add Personal Note',
        'save_note': 'Save Note',
        'ask_question_title': 'Ask a Question',
        'question_type': 'Question Type',
        'what_confused': 'What did you not understand?',
        'what_understand': 'What do you understand so far?',
        'submit_question': 'Submit Question',
        
        // Quiz
        'quiz_complete': 'Quiz Complete!',
        'passed': 'Passed ✓',
        'failed': 'Failed ✗',
        'chapter_unlocked': 'Next chapter unlocked!',
        'try_again': 'Please review the chapter and try again.',
        'correct': 'Correct',
        'detailed_results': 'Detailed Results',
        'review_quiz': 'Review Quiz',
        'loading_quiz': 'Loading quiz...',
        
        // Admin
        'admin_panel': 'Admin Panel',
        'users': 'Users',
        'chapters': 'Chapters',
        'content': 'Content',
        'quizzes': 'Quizzes',
        'questions': 'Questions',
        'progress': 'Progress',
        'settings': 'Settings',
        'create_user': 'Create User',
        'role': 'Role',
        'status': 'Status',
        'active': 'Active',
        'disabled': 'Disabled',
    },
    bn: {
        // Common
        'loading': 'লোড হচ্ছে...',
        'save': 'সংরক্ষণ করুন',
        'cancel': 'বাতিল করুন',
        'delete': 'মুছুন',
        'edit': 'সম্পাদনা করুন',
        'close': 'বন্ধ করুন',
        'submit': 'জমা দিন',
        'continue': 'চালিয়ে যান',
        'next': 'পরবর্তী',
        'previous': 'আগেরটা',
        
        // Login
        'login': 'লগইন করুন',
        'username': 'ব্যবহারকারীর নাম',
        'password': 'পাসওয়ার্ড',
        'logout': 'লগআউট করুন',
        
        // Dashboard
        'welcome': 'স্বাগতম',
        'dashboard': 'ড্যাশবোর্ড',
        'continue_journey': 'আপনার Python যাত্রা চালিয়ে যান',
        'your_progress': 'আপনার অগ্রগতি',
        'current_chapter': 'বর্তমান অধ্যায়',
        'chapters_completed': 'সম্পন্ন অধ্যায়',
        'quiz_average': 'কুইজ গড়',
        'bookmarks': 'বুকমার্ক',
        'questions_asked': 'জিজ্ঞাসা করা প্রশ্ন',
        'quick_actions': 'দ্রুত পদক্ষেপ',
        'continue_reading': 'পড়া চালিয়ে যান',
        'my_bookmarks': 'আমার বুকমার্ক',
        'my_notes': 'আমার নোট',
        'my_questions': 'আমার প্রশ্ন',
        'all_chapters': 'সব অধ্যায়',
        'user_profile': 'ব্যবহারকারীর প্রোফাইল',
        'change_password': 'পাসওয়ার্ড পরিবর্তন করুন',
        'new_password': 'নতুন পাসওয়ার্ড',
        'confirm_password': 'পাসওয়ার্ড নিশ্চিত করুন',
        'update_password': 'আপডেট পাসওয়ার্ড',
        'display_name': 'প্রদর্শন নাম',
        
        // Reader
        'contents': 'বিষয়বস্তু',
        'reading_tools': 'পড়ার সরঞ্জাম',
        'bookmark_section': 'বিভাগ চিহ্নিত করুন',
        'add_note': 'নোট যোগ করুন',
        'ask_question': 'প্রশ্ন জিজ্ঞাসা করুন',
        'add_personal_note': 'ব্যক্তিগত নোট যোগ করুন',
        'save_note': 'নোট সংরক্ষণ করুন',
        'ask_question_title': 'একটি প্রশ্ন জিজ্ঞাসা করুন',
        'question_type': 'প্রশ্নের ধরন',
        'what_confused': 'আপনি কী বুঝতে পারলেন না?',
        'what_understand': 'আপনি এ পর্যন্ত কী বুঝেছেন?',
        'submit_question': 'প্রশ্ন জমা দিন',
        
        // Quiz
        'quiz_complete': 'কুইজ সম্পন্ন!',
        'passed': 'সফল ✓',
        'failed': 'ব্যর্থ ✗',
        'chapter_unlocked': 'পরবর্তী অধ্যায় আনলক হয়েছে!',
        'try_again': 'দয়া করে অধ্যায় পর্যালোচনা করুন এবং আবার চেষ্টা করুন।',
        'correct': 'সঠিক',
        'detailed_results': 'বিস্তারিত ফলাফল',
        'review_quiz': 'কুইজ পর্যালোচনা করুন',
        'loading_quiz': 'কুইজ লোড হচ্ছে...',
        
        // Admin
        'admin_panel': 'প্রশাসক প্যানেল',
        'users': 'ব্যবহারকারী',
        'chapters': 'অধ্যায়',
        'content': 'বিষয়বস্তু',
        'quizzes': 'কুইজ',
        'questions': 'প্রশ্ন',
        'progress': 'অগ্রগতি',
        'settings': 'সেটিংস',
        'create_user': 'ব্যবহারকারী তৈরি করুন',
        'role': 'ভূমিকা',
        'status': 'অবস্থা',
        'active': 'সক্রিয়',
        'disabled': 'অক্ষম',
    }
};

function t(key) {
    const lang = LanguageManager.getCurrentLanguage();
    return translations[lang]?.[key] || translations['en']?.[key] || key;
}

function updatePageTranslations() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const text = t(key);
        
        if (element.tagName === 'INPUT' || element.tagName === 'BUTTON') {
            element.placeholder = text;
            element.value = text;
        } else {
            element.textContent = text;
        }
    });
}

// Set up language switchers
document.addEventListener('DOMContentLoaded', () => {
    const langBtns = document.querySelectorAll('.lang-btn');
    
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            LanguageManager.setLanguage(lang);
            
            // Update active state
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update all translations
            updatePageTranslations();
        });
    });
    
    // Set initial language
    const currentLang = LanguageManager.getCurrentLanguage();
    const activeBtn = document.querySelector(`[data-lang="${currentLang}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    updatePageTranslations();
});
