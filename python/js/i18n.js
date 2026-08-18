/* Internationalization (i18n) Engine
   Bilingual English (EN) and Bengali (বাংলা) dictionaries for all screens. */

const translations = {
    en: {
        // App / Brand
        'app_title': 'My Python Journey',
        'tagline': 'Interactive Python Learning Journey',
        'subtitle': 'Learn. Build. Think in Code.',

        // Common Actions
        'loading': 'Loading...',
        'save': 'Save',
        'saved': 'Saved!',
        'cancel': 'Cancel',
        'delete': 'Delete',
        'edit': 'Edit',
        'close': 'Close',
        'submit': 'Submit',
        'continue': 'Continue',
        'continue_reading': 'Continue Reading',
        'next': 'Next',
        'previous': 'Previous',
        'actions': 'Actions',
        'search': 'Search topics...',
        'copy_code': 'Copy Code',
        'copied': 'Copied!',

        // Navigation
        'nav_home': 'Home',
        'nav_dashboard': 'Dashboard',
        'nav_reader': 'Reader',
        'nav_profile': 'Profile',
        'nav_admin': 'Admin Panel',
        'logout': 'Logout',
        'login': 'Login',
        'back_to_home': '← Back to Home',

        // Landing Page
        'hero_badge': 'A Structured Python Learning Book',
        'hero_heading': 'Learn Python the Right Way.',
        'hero_desc': 'A private, interactive digital learning book where Python concepts are mastered chapter-by-chapter through structured explanations, executable examples, private notes, and mandatory quizzes.',
        'read_the_journey': 'Read the Journey',
        'explore_roadmap': 'Explore Roadmap',
        'why_title': 'Why this learning book?',
        'why_structured_title': 'Structured Progression',
        'why_structured_desc': 'From fundamentals to advanced patterns with verified quiz-gated progression.',
        'why_bilingual_title': 'True Bilingual Learning',
        'why_bilingual_desc': 'Seamlessly toggle between English and Bengali across both UI and actual book content.',
        'why_personal_title': 'Personal Study Space',
        'why_personal_desc': 'Keep private per-topic notes, save bookmarks, and ask structured context-aware questions.',
        'roadmap_title': 'Structured Curriculum',

        // Login Page
        'login_title': 'Welcome Back',
        'login_subtitle': 'Enter your credentials to continue your Python journey.',
        'login_private_notice': 'Private learning platform. User accounts are created by the administrator. There is no public registration.',
        'username': 'Username',
        'password': 'Password',
        'login_button': 'Sign In',
        'logging_in': 'Signing in...',
        'demo_creds': 'Demo accounts: admin / admin123 (Admin) or reza / demo123 (Learner)',

        // Dashboard
        'welcome': 'Welcome back,',
        'continue_journey': 'Continue your Python learning journey',
        'your_progress': 'Your Progress',
        'current_chapter': 'Current Chapter',
        'chapters_completed': 'Chapters Completed',
        'quiz_average': 'Quiz Average',
        'bookmarks': 'Bookmarks',
        'questions_asked': 'Questions Asked',
        'quick_actions': 'Quick Actions',
        'my_bookmarks': 'My Bookmarks',
        'my_notes': 'My Notes',
        'my_questions': 'My Questions',
        'all_chapters': 'Curriculum Chapters',
        'overall_progress': 'Overall Progress',
        'no_bookmarks': 'No bookmarks yet. Save important sections while reading.',
        'no_notes': 'No personal notes yet. Add your thoughts and summaries while reading.',
        'no_questions': 'No questions submitted yet. Ask whenever you encounter a tricky topic.',

        // User Profile & Password
        'user_profile': 'User Profile',
        'display_name': 'Display Name',
        'role': 'Role',
        'account_status': 'Account Status',
        'change_password': 'Change Password',
        'new_password': 'New Password',
        'confirm_password': 'Confirm Password',
        'update_password': 'Update Password',
        'passwords_dont_match': 'New password and confirm password do not match.',
        'password_updated': 'Password updated successfully!',

        // Reader Interface
        'contents': 'Contents',
        'chapter': 'Chapter',
        'section': 'Section',
        'reading_tools': 'Reading Tools',
        'bookmark_section': 'Bookmark Section',
        'bookmarked': 'Bookmarked',
        'add_note': 'Add Note',
        'edit_note': 'Edit Note',
        'add_personal_note': 'Add Personal Note',
        'note_placeholder': 'Write your private note about this topic here...',
        'save_note': 'Save Note',
        'ask_question': 'Ask Question',
        'ask_question_title': 'Ask a Specific Question',
        'question_type': 'Question Type',
        'type_concept': 'Concept Understanding',
        'type_code': 'Code Behavior',
        'type_example': 'Example Application',
        'type_difference': 'Difference / Comparison',
        'type_other': 'Other Question',
        'what_confused': 'What did you not understand?',
        'what_confused_placeholder': 'Explain exactly what part felt confusing...',
        'what_understand': 'What do you understand so far?',
        'what_understand_placeholder': 'Helps the instructor provide a targeted answer...',
        'submit_question': 'Submit Question',
        'take_quiz': 'Take Chapter Quiz →',
        'chapter_locked_msg': 'This chapter is locked. Please pass the previous chapter quiz to unlock it.',

        // Quiz Interface
        'chapter_quiz': 'Chapter Quiz',
        'quiz_question_counter': 'Question',
        'pass_mark': 'Pass Mark',
        'submit_answer': 'Submit Answer',
        'select_an_option': 'Please select an option to proceed.',
        'quiz_complete': 'Quiz Complete!',
        'passed': 'Passed ✓',
        'failed': 'Try Again ✗',
        'chapter_unlocked': 'Next chapter unlocked! Great job.',
        'try_again': 'Please review the chapter material and try again.',
        'correct': 'Correct',
        'wrong': 'Wrong',
        'your_answer': 'Your answer',
        'correct_answer': 'Correct answer',
        'explanation': 'Explanation',
        'detailed_results': 'Detailed Results & Explanations',
        'review_quiz': 'Review Quiz',
        'retry_quiz': 'Retry Quiz',
        'loading_quiz': 'Loading quiz...',

        // Admin Panel
        'admin_panel': 'Admin Control Panel',
        'admin_dashboard': 'Admin Dashboard',
        'users_mgmt': 'User Management',
        'chapters_mgmt': 'Chapter Management',
        'content_mgmt': 'Content Management',
        'quizzes_mgmt': 'Quiz Management',
        'questions_mgmt': 'Questions & Support',
        'progress_mgmt': 'Learner Progress',
        'settings_mgmt': 'Platform Settings',
        'total_users': 'Total Users',
        'active_users': 'Active Users',
        'total_chapters': 'Total Chapters',
        'published_chapters': 'Published Chapters',
        'pending_questions': 'Pending Questions',
        'recent_activity': 'Recent Activity',
        'create_user': 'Create User',
        'create_chapter': 'Create Chapter',
        'add_content_block': 'Add Content Block',
        'create_quiz': 'Create Quiz',
        'add_question': 'Add Question',
        'answer_question': 'Answer Question',
        'admin_answer_placeholder': 'Write your clear explanation for the student...',
        'status_active': 'Active',
        'status_disabled': 'Disabled',
        'status_published': 'Published',
        'status_draft': 'Draft',
        'status_pending': 'Pending',
        'status_answered': 'Answered'
    },
    bn: {
        // App / Brand
        'app_title': 'My Python Journey',
        'tagline': 'ইন্টারঅ্যাক্টিভ পাইথন লার্নিং জার্নি',
        'subtitle': 'শিখুন। তৈরি করুন। কোডে চিন্তা করুন।',

        // Common Actions
        'loading': 'লোড হচ্ছে...',
        'save': 'সংরক্ষণ করুন',
        'saved': 'সংরক্ষিত!',
        'cancel': 'বাতিল করুন',
        'delete': 'মুছুন',
        'edit': 'সম্পাদনা করুন',
        'close': 'বন্ধ করুন',
        'submit': 'জমা দিন',
        'continue': 'চালিয়ে যান',
        'continue_reading': 'পড়া চালিয়ে যান',
        'next': 'পরবর্তী',
        'previous': 'পূর্ববর্তী',
        'actions': 'অ্যাকশন',
        'search': 'বিষয় খুঁজুন...',
        'copy_code': 'কোড কপি করুন',
        'copied': 'কপি হয়েছে!',

        // Navigation
        'nav_home': 'হোম',
        'nav_dashboard': 'ড্যাশবোর্ড',
        'nav_reader': 'রিডার',
        'nav_profile': 'প্রোফাইল',
        'nav_admin': 'অ্যাডমিন প্যানেল',
        'logout': 'লগআউট',
        'login': 'লগইন',
        'back_to_home': '← হোমে ফিরে যান',

        // Landing Page
        'hero_badge': 'একটি সুবিন্যস্ত পাইথন লার্নিং বই',
        'hero_heading': 'সঠিক উপায়ে পাইথন শিখুন।',
        'hero_desc': 'একটি আধুনিক ডিজিটাল লার্নিং প্ল্যাটফর্ম যেখানে পাইথনের প্রতিটি ধারণা অধ্যায়ভিত্তিক ব্যাখ্যা, এক্সিকিউটেবল কোড, ব্যক্তিগত নোট এবং বাধ্যতামূলক কুইজের মাধ্যমে আত্মস্থ করা যায়।',
        'read_the_journey': 'লার্নিং জার্নি পড়ুন',
        'explore_roadmap': 'রোডম্যাপ দেখুন',
        'why_title': 'কেন এই লার্নিং বই?',
        'why_structured_title': 'ধাপে ধাপে অগ্রগতি',
        'why_structured_desc': 'মৌলিক থেকে শুরু করে অ্যাডভান্সড পাইথন প্যাটার্ন এবং কুইজ পাসের মাধ্যমে পরবর্তী অধ্যায় আনলক।',
        'why_bilingual_title': 'সম্পূর্ণ দ্বিভাষিক পদ্ধতি',
        'why_bilingual_desc': 'ইন্টারফেস ও মূল বইয়ের কনটেন্ট উভয়ই ইংরেজি ও বাংলায় এক ক্লিকেই পরিবর্তনযোগ্য।',
        'why_personal_title': 'ব্যক্তিগত পড়ার পরিবেশ',
        'why_personal_desc': 'টপিকভিত্তিক ব্যক্তিগত নোট সংরক্ষণ, বুকমার্ক ও সুনির্দিষ্ট প্রশ্ন করার পূর্ণাঙ্গ সুবিধা।',
        'roadmap_title': 'পাঠ্যক্রম রোডম্যাপ',

        // Login Page
        'login_title': 'স্বাগতম',
        'login_subtitle': 'আপনার পাইথন লার্নিং অ্যাকাউন্টে প্রবেশ করুন।',
        'login_private_notice': 'এটি একটি ব্যক্তিগত লার্নিং প্ল্যাটফর্ম। শুধুমাত্র অ্যাডমিনিস্ট্রেটর অ্যাকাউন্ট তৈরি করতে পারেন। কোনো পাবলিক রেজিস্ট্রেশন নেই।',
        'username': 'ব্যবহারকারীর নাম (Username)',
        'password': 'পাসওয়ার্ড (Password)',
        'login_button': 'লগইন করুন',
        'logging_in': 'লগইন হচ্ছে...',
        'demo_creds': 'ডেমো অ্যাকাউন্ট: admin / admin123 (অ্যাডমিন) অথবা reza / demo123 (লার্নার)',

        // Dashboard
        'welcome': 'স্বাগতম,',
        'continue_journey': 'আপনার পাইথন শেখার যাত্রা চালিয়ে যান',
        'your_progress': 'আপনার অগ্রগতি',
        'current_chapter': 'বর্তমান অধ্যায়',
        'chapters_completed': 'সম্পন্ন অধ্যায়',
        'quiz_average': 'কুইজ গড় নম্বর',
        'bookmarks': 'সংরক্ষিত বুকমার্ক',
        'questions_asked': 'জিজ্ঞাসা করা প্রশ্ন',
        'quick_actions': 'দ্রুত পদক্ষেপ',
        'my_bookmarks': 'আমার বুকমার্ক',
        'my_notes': 'আমার ব্যক্তিগত নোট',
        'my_questions': 'আমার প্রশ্নসমূহ',
        'all_chapters': 'সম্পূর্ণ পাঠ্যক্রম',
        'overall_progress': 'সামগ্রিক অগ্রগতি',
        'no_bookmarks': 'এখনও কোনো বুকমার্ক সংরক্ষণ করা হয়নি। পড়ার সময় গুরুত্বপূর্ণ সেকশন বুকমার্ক করুন।',
        'no_notes': 'কোনো নোট নেই। পড়ার সময় আপনার ভাবনা বা সারাংশ লিখে রাখুন।',
        'no_questions': 'কোনো প্রশ্ন করা হয়নি। কোনো বিষয় অস্পষ্ট লাগলে প্রশ্ন করুন।',

        // User Profile & Password
        'user_profile': 'ব্যবহারকারীর প্রোফাইল',
        'display_name': 'প্রদর্শন নাম (Display Name)',
        'role': 'ভূমিকা (Role)',
        'account_status': 'অ্যাকাউন্টের অবস্থা',
        'change_password': 'পাসওয়ার্ড পরিবর্তন',
        'new_password': 'নতুন পাসওয়ার্ড',
        'confirm_password': 'পাসওয়ার্ড নিশ্চিত করুন',
        'update_password': 'পাসওয়ার্ড আপডেট করুন',
        'passwords_dont_match': 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।',
        'password_updated': 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!',

        // Reader Interface
        'contents': 'সূচিপত্র',
        'chapter': 'অধ্যায়',
        'section': 'সেকশন',
        'reading_tools': 'পড়ার সরঞ্জাম',
        'bookmark_section': 'সেকশন বুকমার্ক করুন',
        'bookmarked': 'বুকমার্ক করা হয়েছে',
        'add_note': 'নোট যোগ করুন',
        'edit_note': 'নোট সম্পাদনা করুন',
        'add_personal_note': 'ব্যক্তিগত নোট যোগ করুন',
        'note_placeholder': 'এই বিষয়টি নিয়ে আপনার ব্যক্তিগত নোট এখানে লিখুন...',
        'save_note': 'নোট সংরক্ষণ করুন',
        'ask_question': 'প্রশ্ন জিজ্ঞাসা করুন',
        'ask_question_title': 'সুনির্দিষ্ট প্রশ্ন করুন',
        'question_type': 'প্রশ্নের ধরন',
        'type_concept': 'ধারণা বোঝা (Concept)',
        'type_code': 'কোড আচরণ (Code)',
        'type_example': 'বাস্তব প্রয়োগ (Example)',
        'type_difference': 'পার্থক্য / তুলনা (Difference)',
        'type_other': 'অন্যান্য প্রশ্ন (Other)',
        'what_confused': 'কোথায় বুঝতে সমস্যা হয়েছে?',
        'what_confused_placeholder': 'কোন বিষয়টি স্পষ্ট নয় তা পরিষ্কারভাবে লিখুন...',
        'what_understand': 'এ পর্যন্ত আপনি কী বুঝেছেন?',
        'what_understand_placeholder': 'এটি শিক্ষককে দ্রুত ও লক্ষ্যভিত্তিক উত্তর দিতে সাহায্য করে...',
        'submit_question': 'প্রশ্ন জমা দিন',
        'take_quiz': 'অধ্যায় কুইজ দিন →',
        'chapter_locked_msg': 'এই অধ্যায়টি এখনও লক করা আছে। এটি খুলতে পূর্ববর্তী অধ্যায়ের কুইজে উত্তীর্ণ হন।',

        // Quiz Interface
        'chapter_quiz': 'অধ্যায়ভিত্তিক কুইজ',
        'quiz_question_counter': 'প্রশ্ন',
        'pass_mark': 'পাস মার্ক',
        'submit_answer': 'উত্তর জমা দিন',
        'select_an_option': 'অনুগ্রহ করে একটি বিকল্প নির্বাচন করুন।',
        'quiz_complete': 'কুইজ সম্পন্ন!',
        'passed': 'উত্তীর্ণ হয়েছেন ✓',
        'failed': 'আবার চেষ্টা করুন ✗',
        'chapter_unlocked': 'পরবর্তী অধ্যায় আনলক হয়েছে! দারুণ কাজ।',
        'try_again': 'অনুগ্রহ করে অধ্যায়টি পুনরায় পড়ে আবার কুইজ দিন।',
        'correct': 'সঠিক',
        'wrong': 'ভুল',
        'your_answer': 'আপনার উত্তর',
        'correct_answer': 'সঠিক উত্তর',
        'explanation': 'ব্যাখ্যা',
        'detailed_results': 'বিস্তারিত ফলাফল ও ব্যাখ্যা',
        'review_quiz': 'কুইজ পর্যালোচনা করুন',
        'retry_quiz': 'পুনরায় কুইজ দিন',
        'loading_quiz': 'কুইজ লোড হচ্ছে...',

        // Admin Panel
        'admin_panel': 'অ্যাডমিন কন্ট্রোল প্যানেল',
        'admin_dashboard': 'অ্যাডমিন ড্যাশবোর্ড',
        'users_mgmt': 'ব্যবহারকারী ব্যবস্থাপনা',
        'chapters_mgmt': 'অধ্যায় ব্যবস্থাপনা',
        'content_mgmt': 'কনটেন্ট ব্যবস্থাপনা',
        'quizzes_mgmt': 'কুইজ ব্যবস্থাপনা',
        'questions_mgmt': 'প্রশ্নোত্তর সাপোর্ট',
        'progress_mgmt': 'লার্নার অগ্রগতি',
        'settings_mgmt': 'প্ল্যাটফর্ম সেটিংস',
        'total_users': 'মোট ব্যবহারকারী',
        'active_users': 'সক্রিয় ব্যবহারকারী',
        'total_chapters': 'মোট অধ্যায়',
        'published_chapters': 'প্রকাশিত অধ্যায়',
        'pending_questions': 'অপেক্ষমান প্রশ্ন',
        'recent_activity': 'সাম্প্রতিক কার্যক্রম',
        'create_user': 'নতুন ইউজার তৈরি করুন',
        'create_chapter': 'নতুন অধ্যায় তৈরি করুন',
        'add_content_block': 'কনটেন্ট ব্লক যোগ করুন',
        'create_quiz': 'কুইজ তৈরি করুন',
        'add_question': 'প্রশ্ন যোগ করুন',
        'answer_question': 'প্রশ্নের উত্তর দিন',
        'admin_answer_placeholder': 'শিক্ষার্থীর জন্য বিশদ ও প্রাঞ্জল ব্যাখ্যা লিখুন...',
        'status_active': 'সক্রিয়',
        'status_disabled': 'অক্ষম',
        'status_published': 'প্রকাশিত',
        'status_draft': 'খসড়া',
        'status_pending': 'অপেক্ষমান',
        'status_answered': 'উত্তর দেওয়া হয়েছে'
    }
};

function t(key) {
    const lang = LanguageManager.getCurrentLanguage();
    return translations[lang]?.[key] || translations['en']?.[key] || key;
}

function updatePageTranslations() {
    const lang = LanguageManager.getCurrentLanguage();
    document.documentElement.lang = lang;

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const text = t(key);
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = text;
        } else if (element.tagName === 'BUTTON' || element.tagName === 'A' || element.tagName === 'SPAN' || element.tagName === 'P' || element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3' || element.tagName === 'H4' || element.tagName === 'DIV' || element.tagName === 'LABEL') {
            element.textContent = text;
        }
    });

    // Update placeholders with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });

    // Update active class on language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Language switcher auto-attacher
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = btn.getAttribute('data-lang');
            LanguageManager.setLanguage(lang);
            updatePageTranslations();
            // Dispatch a global event so page scripts can react and re-render dynamic content
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
        });
    });

    updatePageTranslations();
});
