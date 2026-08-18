/* Shared app configuration, session helpers, language helpers, and API client.
   Supports live Google Apps Script Web App API and automatic fallback mock storage
   for seamless offline preview and instant testing before deployment. */

const CONFIG = window.CONFIG || {
    // Paste your deployed Google Apps Script Web App URL here after deployment.
    // Example: https://script.google.com/macros/s/AKfycbx.../exec
    API_URL: 'https://script.google.com/macros/s/AKfycbwWxnAvgbu-RAls83UyZs-K9OheOEWsBU0ihdoREzLCABSVDvKIo3a3rlc944V3Qogr/exec',
    DEFAULT_PASS_MARK: 70,
    SESSION_KEY: 'pythonJourneySession',
    LANGUAGE_KEY: 'pythonJourneyLanguage',
    MOCK_DB_KEY: 'pythonJourneyMockDB'
};

const SessionManager = {
    getSession() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.SESSION_KEY) || 'null');
        } catch (_) {
            return null;
        }
    },

    setSession(user) {
        const normalized = {
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.display_name || user.username,
            role: user.role || 'USER',
            status: user.status || 'ACTIVE',
            token: user.token || 'mock_token_' + Date.now(),
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(CONFIG.SESSION_KEY, JSON.stringify(normalized));
    },

    clearSession() {
        localStorage.removeItem(CONFIG.SESSION_KEY);
    },

    getCurrentUser() {
        return this.getSession();
    },

    getToken() {
        return this.getSession()?.token || '';
    },

    isAuthenticated() {
        const user = this.getSession();
        return Boolean(user && user.token && user.status !== 'DISABLED');
    },

    isAdmin() {
        const user = this.getSession();
        return Boolean(this.isAuthenticated() && user.role === 'ADMIN');
    }
};

const LanguageManager = {
    getCurrentLanguage() {
        return localStorage.getItem(CONFIG.LANGUAGE_KEY) || 'en';
    },

    setLanguage(lang) {
        const safeLang = lang === 'bn' ? 'bn' : 'en';
        localStorage.setItem(CONFIG.LANGUAGE_KEY, safeLang);
        document.documentElement.lang = safeLang;
    }
};

// =========================================================
// MOCK STORAGE ENGINE (Enables full offline/local testing)
// =========================================================

const MockDB = {
    getInitialData() {
        const now = new Date().toISOString();
        const adminId = 'usr_admin_001';
        const rezaId = 'usr_reza_002';
        const karimId = 'usr_karim_003';

        const ch1 = 'ch_001';
        const ch2 = 'ch_002';
        const ch3 = 'ch_003';

        const sec1_1 = 'sec_001_1';
        const sec1_2 = 'sec_001_2';
        const sec2_1 = 'sec_002_1';
        const sec2_2 = 'sec_002_2';
        const sec3_1 = 'sec_003_1';
        const sec3_2 = 'sec_003_2';

        const quiz1 = 'qz_001';
        const quiz2 = 'qz_002';
        const quiz3 = 'qz_003';

        return {
            users: [
                { id: adminId, username: 'admin', password: 'admin123', displayName: 'Administrator', role: 'ADMIN', status: 'ACTIVE', createdAt: now },
                { id: rezaId, username: 'reza', password: 'demo123', displayName: 'Rezaul Karim', role: 'USER', status: 'ACTIVE', createdAt: now },
                { id: karimId, username: 'karim', password: 'demo123', displayName: 'Karim Islam', role: 'USER', status: 'DISABLED', createdAt: now }
            ],
            chapters: [
                {
                    id: ch1, partId: 'fundamentals', number: 1, order: 1, status: 'PUBLISHED',
                    title: { en: 'What is Python?', bn: 'Python কী?' },
                    description: {
                        en: 'Understand what Python is, why it is popular, and write your first program.',
                        bn: 'Python কী, কেন এটি এত জনপ্রিয় এবং আপনার প্রথম প্রোগ্রাম কীভাবে লিখবেন তা শিখুন।'
                    }
                },
                {
                    id: ch2, partId: 'fundamentals', number: 2, order: 2, status: 'PUBLISHED',
                    title: { en: 'Variables & Data Types', bn: 'Variables ও Data Types' },
                    description: {
                        en: 'Learn how Python represents values, names variables, and handles fundamental types.',
                        bn: 'Python কীভাবে বিভিন্ন মান সংরক্ষণ করে এবং ডেটা টাইপ নিয়ে কাজ করে তা জানুন।'
                    }
                },
                {
                    id: ch3, partId: 'fundamentals', number: 3, order: 3, status: 'PUBLISHED',
                    title: { en: 'Conditions & Logic', bn: 'শর্ত এবং Logic' },
                    description: {
                        en: 'Make decisions in code using if, elif, else and Boolean logic.',
                        bn: 'if, elif, else এবং বুলিয়ান লজিক ব্যবহার করে সিদ্ধান্তমূলক কোড লেখা শিখুন।'
                    }
                }
            ],
            sections: [
                { id: sec1_1, chapterId: ch1, title: { en: 'Introduction to Python', bn: 'Python পরিচিতি' }, order: 1, status: 'PUBLISHED' },
                { id: sec1_2, chapterId: ch1, title: { en: 'Your First Python Program', bn: 'আপনার প্রথম Python প্রোগ্রাম' }, order: 2, status: 'PUBLISHED' },
                { id: sec2_1, chapterId: ch2, title: { en: 'Variables and Memory Model', bn: 'Variable এবং মেমোরি ধারণা' }, order: 1, status: 'PUBLISHED' },
                { id: sec2_2, chapterId: ch2, title: { en: 'Fundamental Data Types', bn: 'মৌলিক Data Types' }, order: 2, status: 'PUBLISHED' },
                { id: sec3_1, chapterId: ch3, title: { en: 'Conditional Statements (if / elif / else)', bn: 'শর্তাধীন স্টেটমেন্ট (if / elif / else)' }, order: 1, status: 'PUBLISHED' },
                { id: sec3_2, chapterId: ch3, title: { en: 'Logical Operators & Decisions', bn: 'Logical Operators এবং সিদ্ধান্ত গ্রহণ' }, order: 2, status: 'PUBLISHED' }
            ],
            content: [
                {
                    id: 'cnt_1_1', sectionId: sec1_1, type: 'paragraph', order: 1, status: 'PUBLISHED',
                    title: { en: '', bn: '' },
                    content: {
                        en: '<p>Python is a readable, high-level, interpreted programming language created by Guido van Rossum. Its design philosophy emphasizes code readability and simplicity with clean syntax.</p>',
                        bn: '<p>Python একটি সহজে পাঠযোগ্য, উচ্চস্তরের এবং ইন্টারপ্রেটেড প্রোগ্রামিং ভাষা। এর ডিজাইন দর্শন কোডের সরলতা এবং পরিচ্ছন্ন সিনট্যাক্সকে অগ্রাধিকার দেয়।</p>'
                    }
                },
                {
                    id: 'cnt_1_2', sectionId: sec1_1, type: 'callout', order: 2, status: 'PUBLISHED',
                    title: { en: 'Key Idea', bn: 'মূল ধারণা' },
                    content: {
                        en: '<p>Python is dynamically typed and garbage-collected, which allows developers to focus on logic rather than memory management.</p>',
                        bn: '<p>Python ডায়নামিক টাইপড এবং স্বয়ংক্রিয় মেমোরি ম্যানেজমেন্ট প্রদান করে, যা সরাসরি লজিকে মনোযোগ দিতে সাহায্য করে।</p>'
                    }
                },
                {
                    id: 'cnt_1_3', sectionId: sec1_2, type: 'paragraph', order: 1, status: 'PUBLISHED',
                    title: { en: '', bn: '' },
                    content: {
                        en: '<p>The simplest way to start is using the <code>print()</code> function, which outputs information to the terminal or console.</p>',
                        bn: '<p>Python শেখা শুরু করার সহজতম উপায় হলো <code>print()</code> ফাংশন ব্যবহার করা, যা কনসোলে আউটপুট প্রদর্শন করে।</p>'
                    }
                },
                {
                    id: 'cnt_1_4', sectionId: sec1_2, type: 'code', order: 2, status: 'PUBLISHED',
                    title: { en: 'Hello World Example', bn: 'Hello World উদাহরণ' },
                    content: {
                        en: '# Output a friendly message to the screen\nprint("Hello, Python Learning Journey!")\n\nmessage = "Think in code."\nprint(message)',
                        bn: '# স্ক্রিনে একটি বার্তা প্রদর্শন করুন\nprint("Hello, Python Learning Journey!")\n\nmessage = "Think in code."\nprint(message)'
                    }
                },
                {
                    id: 'cnt_2_1', sectionId: sec2_1, type: 'paragraph', order: 1, status: 'PUBLISHED',
                    title: { en: '', bn: '' },
                    content: {
                        en: '<p>In Python, a variable is not a container that holds a value; it is a label (or reference) that points to an object in memory.</p>',
                        bn: '<p>Python-এ variable কোনো বাক্সের মতো নয়; এটি মেমোরিতে থাকা একটি বস্তুর দিকে নির্দেশকারী লেবেল বা রেফারেন্স।</p>'
                    }
                },
                {
                    id: 'cnt_2_2', sectionId: sec2_1, type: 'code', order: 2, status: 'PUBLISHED',
                    title: { en: 'Variables Example', bn: 'Variable উদাহরণ' },
                    content: {
                        en: 'user_name = "Reza"\nscore = 95\nis_enrolled = True\n\nprint(f"User: {user_name}, Score: {score}, Active: {is_enrolled}")',
                        bn: 'user_name = "Reza"\nscore = 95\nis_enrolled = True\n\nprint(f"User: {user_name}, Score: {score}, Active: {is_enrolled}")'
                    }
                },
                {
                    id: 'cnt_2_3', sectionId: sec2_2, type: 'callout', order: 1, status: 'PUBLISHED',
                    title: { en: 'Important Concept', bn: 'গুরুত্বপূর্ণ ধারণা' },
                    content: {
                        en: '<p>Python provides four basic scalar types: <code>int</code>, <code>float</code>, <code>str</code>, and <code>bool</code>. You can inspect an object\'s type using <code>type()</code>.</p>',
                        bn: '<p>Python-এর চারটি মৌলিক স্কেলার টাইপ রয়েছে: <code>int</code>, <code>float</code>, <code>str</code>, এবং <code>bool</code>। টাইপ জানতে <code>type()</code> ফাংশন ব্যবহার করুন।</p>'
                    }
                },
                {
                    id: 'cnt_3_1', sectionId: sec3_1, type: 'code', order: 1, status: 'PUBLISHED',
                    title: { en: 'Condition Example', bn: 'Condition উদাহরণ' },
                    content: {
                        en: 'score = 85\n\nif score >= 90:\n    print("Grade: A")\nelif score >= 70:\n    print("Grade: B (Passed!)")\nelse:\n    print("Please review and retry.")',
                        bn: 'score = 85\n\nif score >= 90:\n    print("Grade: A")\nelif score >= 70:\n    print("Grade: B (Passed!)")\nelse:\n    print("Please review and retry.")'
                    }
                },
                {
                    id: 'cnt_3_2', sectionId: sec3_2, type: 'paragraph', order: 1, status: 'PUBLISHED',
                    title: { en: '', bn: '' },
                    content: {
                        en: '<p>Use <code>and</code>, <code>or</code>, and <code>not</code> to compose composite conditions cleanly without nested clauses.</p>',
                        bn: '<p>জটিল সিদ্ধান্ত গ্রহণের জন্য <code>and</code>, <code>or</code>, এবং <code>not</code> লজিক্যাল অপারেটর ব্যবহার করুন।</p>'
                    }
                }
            ],
            quizzes: [
                { id: quiz1, chapterId: ch1, title: { en: 'What is Python? Quiz', bn: 'Python কী? কুইজ' }, passPercentage: 70, status: 'PUBLISHED' },
                { id: quiz2, chapterId: ch2, title: { en: 'Variables & Types Quiz', bn: 'Variables ও Types কুইজ' }, passPercentage: 70, status: 'PUBLISHED' },
                { id: quiz3, chapterId: ch3, title: { en: 'Conditions & Logic Quiz', bn: 'Conditions ও Logic কুইজ' }, passPercentage: 70, status: 'PUBLISHED' }
            ],
            quiz_questions: [
                {
                    id: 'qq_1_1', quizId: quiz1, order: 1,
                    question: { en: 'Which function is used to output text to the console in Python?', bn: 'Python-এ কনসোলে টেক্সট আউটপুট দিতে কোন ফাংশন ব্যবহৃত হয়?' },
                    explanation: { en: 'The print() built-in function outputs string representations to standard output.', bn: 'print() বিল্ট-ইন ফাংশন টেক্সট কনসোলে প্রদর্শন করে।' },
                    options: [
                        { id: 'opt_1_1_1', text: { en: 'echo()', bn: 'echo()' } },
                        { id: 'opt_1_1_2', text: { en: 'print()', bn: 'print()' } },
                        { id: 'opt_1_1_3', text: { en: 'console.log()', bn: 'console.log()' } },
                        { id: 'opt_1_1_4', text: { en: 'write()', bn: 'write()' } }
                    ],
                    correctOptionIndex: 1
                },
                {
                    id: 'qq_1_2', quizId: quiz1, order: 2,
                    question: { en: 'How is code block indentation defined in Python?', bn: 'Python-এ কোড ব্লকের ইন্ডেন্টেশন কীভাবে নির্ধারিত হয়?' },
                    explanation: { en: 'Python relies on whitespace indentation instead of curly braces {} to define scope.', bn: 'Python কার্লি ব্র্যাকেটের বদলে স্পেস বা ইন্ডেন্টেশন দিয়ে কোড ব্লক নির্ধারণ করে।' },
                    options: [
                        { id: 'opt_1_2_1', text: { en: 'Curly braces {}', bn: 'কার্লি ব্র্যাকেট {}' } },
                        { id: 'opt_1_2_2', text: { en: 'Whitespace / Indentation', bn: 'স্পেস / ইন্ডেন্টেশন' } },
                        { id: 'opt_1_2_3', text: { en: 'Parentheses ()', bn: 'প্যারেন্থেসিস ()' } },
                        { id: 'opt_1_2_4', text: { en: 'Semicolons ;', bn: 'সেমিকোলন ;' } }
                    ],
                    correctOptionIndex: 1
                },
                {
                    id: 'qq_2_1', quizId: quiz2, order: 1,
                    question: { en: 'What is a Python variable conceptually?', bn: 'Python-এ variable ধারণাগতভাবে কী?' },
                    explanation: { en: 'A variable is a name that references an object in memory.', bn: 'Variable হলো একটি নাম যা মেমোরিতে থাকা অবজেক্টের রেফারেন্স নির্দেশ করে।' },
                    options: [
                        { id: 'opt_2_1_1', text: { en: 'A fixed memory register', bn: 'একটি ফিক্সড মেমোরি রেজিস্টার' } },
                        { id: 'opt_2_1_2', text: { en: 'A name bound to an object reference', bn: 'একটি অবজেক্টের সাথে যুক্ত নামের রেফারেন্স' } },
                        { id: 'opt_2_1_3', text: { en: 'A database table column', bn: 'একটি ডেটাবেস কলাম' } },
                        { id: 'opt_2_1_4', text: { en: 'A static constant', bn: 'একটি স্ট্যাটিক কনস্ট্যান্ট' } }
                    ],
                    correctOptionIndex: 1
                },
                {
                    id: 'qq_2_2', quizId: quiz2, order: 2,
                    question: { en: 'Which of the following is a Boolean literal in Python?', bn: 'নিচের কোনটি Python-এ বুলিয়ান লিটারেল?' },
                    explanation: { en: 'In Python, True and False are capitalized keywords.', bn: 'Python-এ True এবং False বড় হাতের অক্ষর দিয়ে শুরু হওয়া কিওয়ার্ড।' },
                    options: [
                        { id: 'opt_2_2_1', text: { en: 'true', bn: 'true' } },
                        { id: 'opt_2_2_2', text: { en: 'True', bn: 'True' } },
                        { id: 'opt_2_2_3', text: { en: 'TRUE', bn: 'TRUE' } },
                        { id: 'opt_2_2_4', text: { en: '1_bool', bn: '1_bool' } }
                    ],
                    correctOptionIndex: 1
                },
                {
                    id: 'qq_3_1', quizId: quiz3, order: 1,
                    question: { en: 'Which keyword is used for "else if" in Python?', bn: 'Python-এ "else if"-এর জন্য কোন কিওয়ার্ড ব্যবহৃত হয়?' },
                    explanation: { en: 'Python uses the elif keyword for multiple conditional branches.', bn: 'Python-এ একাধিক শর্তের জন্য elif কিওয়ার্ড ব্যবহৃত হয়।' },
                    options: [
                        { id: 'opt_3_1_1', text: { en: 'elseif', bn: 'elseif' } },
                        { id: 'opt_3_1_2', text: { en: 'else if', bn: 'else if' } },
                        { id: 'opt_3_1_3', text: { en: 'elif', bn: 'elif' } },
                        { id: 'opt_3_1_4', text: { en: 'elsif', bn: 'elsif' } }
                    ],
                    correctOptionIndex: 2
                }
            ],
            progress: [
                { id: 'prg_1', userId: rezaId, chapterId: ch1, progressPercentage: 100, completed: true, updatedAt: now },
                { id: 'prg_2', userId: rezaId, chapterId: ch2, progressPercentage: 50, completed: false, updatedAt: now }
            ],
            bookmarks: [
                { id: 'bm_1', userId: rezaId, chapterId: ch1, sectionId: sec1_2, createdAt: now },
                { id: 'bm_2', userId: rezaId, chapterId: ch2, sectionId: sec2_1, createdAt: now }
            ],
            notes: [
                { id: 'nt_1', userId: rezaId, chapterId: ch1, sectionId: sec1_2, content: 'Remember that print() is a function in Python 3, not a statement.', createdAt: now },
                { id: 'nt_2', userId: rezaId, chapterId: ch2, sectionId: sec2_1, content: 'Variables point to objects; reassigning just moves the reference pointer.', createdAt: now }
            ],
            questions: [
                {
                    id: 'qs_1', userId: rezaId, chapterId: ch2, sectionId: sec2_1,
                    topic: 'Variables & Types', questionType: 'concept',
                    questionText: 'Why does Python allow changing the type of value a variable points to?',
                    understanding: 'I understand variables are labels, but is there any type safety concern with dynamic rebinding?',
                    status: 'ANSWERED', createdAt: now,
                    answer: 'Great question! In Python, types are attached to objects in memory, not to the variable name itself. Variable names are simply references. Dynamic rebinding gives great flexibility, while type hints can be used when you want static analysis check.'
                }
            ],
            quiz_attempts: [
                { id: 'qa_1', userId: rezaId, quizId: quiz1, score: 2, total: 2, percentage: 100, passed: true, attemptNumber: 1, createdAt: now }
            ],
            activity_logs: [
                { id: 'log_1', userId: adminId, action: 'SETUP', description: 'Interactive Python Learning Journey initialized.', timestamp: now }
            ],
            settings: {
                DEFAULT_PASS_MARK: 70,
                PLATFORM_TITLE: 'My Python Journey',
                DEFAULT_LANGUAGE: 'en'
            }
        };
    },

    getDB() {
        try {
            const raw = localStorage.getItem(CONFIG.MOCK_DB_KEY);
            if (raw) return JSON.parse(raw);
        } catch (_) {}
        const initial = this.getInitialData();
        this.saveDB(initial);
        return initial;
    },

    saveDB(db) {
        try {
            localStorage.setItem(CONFIG.MOCK_DB_KEY, JSON.stringify(db));
        } catch (e) {
            console.warn('Storage save note:', e);
        }
    }
};

// =========================================================
// API CLIENT
// =========================================================

class APIClient {
    static isLive() {
        return Boolean(CONFIG.API_URL && CONFIG.API_URL.trim().startsWith('http'));
    }

    static async request(action, method = 'POST', data = null) {
        if (!this.isLive()) {
            return this.mockHandler(action, data || {});
        }

        try {
            const payload = {
                ...(data || {}),
                token: SessionManager.getToken()
            };

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            };

            const url = `${CONFIG.API_URL}?action=${encodeURIComponent(action)}`;
            const response = await fetch(url, options);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || result.message || 'API Error');
            }

            return result;
        } catch (error) {
            console.warn('Live API request failed, falling back to local storage engine:', error.message);
            // Graceful fallback to local mock engine if remote script is unreachable
            return this.mockHandler(action, data || {});
        }
    }

    // Mock handler for immediate local execution & offline development
    static mockHandler(action, data) {
        const db = MockDB.getDB();
        const currentUser = SessionManager.getCurrentUser();
        const userId = data.userId || currentUser?.id || 'usr_reza_002';
        const now = new Date().toISOString();

        switch (action) {
            case 'login': {
                const username = String(data.username || '').trim().toLowerCase();
                const user = db.users.find(u => u.username.toLowerCase() === username);
                if (!user || user.password !== data.password) {
                    return { success: false, error: 'Invalid username or password.', data: null };
                }
                if (user.status !== 'ACTIVE') {
                    return { success: false, error: 'This account is disabled. Please contact admin.', data: null };
                }
                const token = 'mock_token_' + Date.now();
                return {
                    success: true,
                    data: {
                        id: user.id,
                        username: user.username,
                        displayName: user.displayName,
                        role: user.role,
                        status: user.status,
                        token: token
                    }
                };
            }

            case 'getUser': {
                const user = db.users.find(u => u.id === (data.userId || userId));
                if (!user) return { success: false, error: 'User not found.', data: null };
                return { success: true, data: { id: user.id, username: user.username, displayName: user.displayName, role: user.role, status: user.status } };
            }

            case 'updatePassword': {
                const user = db.users.find(u => u.id === (data.userId || userId));
                if (!user) return { success: false, error: 'User not found.', data: null };
                user.password = data.newPassword;
                MockDB.saveDB(db);
                return { success: true, message: 'Password updated.', data: null };
            }

            case 'createUser': {
                const exists = db.users.some(u => u.username.toLowerCase() === String(data.username || '').trim().toLowerCase());
                if (exists) return { success: false, error: 'Username already exists.', data: null };
                const newUser = {
                    id: 'usr_' + Date.now(),
                    username: data.username.trim(),
                    displayName: data.displayName.trim(),
                    password: data.password || 'demo123',
                    role: data.role || 'USER',
                    status: 'ACTIVE',
                    createdAt: now
                };
                db.users.push(newUser);
                db.activity_logs.unshift({ id: 'log_' + Date.now(), userId: currentUser?.id, action: 'USER_CREATED', description: `Created user ${newUser.username}`, timestamp: now });
                MockDB.saveDB(db);
                return { success: true, data: newUser };
            }

            case 'getUsers': {
                return { success: true, data: db.users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName, role: u.role, status: u.status, createdAt: u.createdAt })) };
            }

            case 'updateUser': {
                const user = db.users.find(u => u.id === data.userId);
                if (!user) return { success: false, error: 'User not found.', data: null };
                if (data.displayName) user.displayName = data.displayName;
                if (data.role) user.role = data.role;
                if (data.status) user.status = data.status;
                if (data.password) user.password = data.password;
                MockDB.saveDB(db);
                return { success: true, message: 'User updated.', data: null };
            }

            case 'deleteUser': {
                const user = db.users.find(u => u.id === data.userId);
                if (!user) return { success: false, error: 'User not found.', data: null };
                user.status = 'DISABLED';
                MockDB.saveDB(db);
                return { success: true, message: 'User disabled.', data: null };
            }

            case 'getChapters': {
                const chapters = db.chapters
                    .filter(c => c.status === 'PUBLISHED' || currentUser?.role === 'ADMIN')
                    .sort((a, b) => a.order - b.order);
                return { success: true, data: chapters };
            }

            case 'getChapter': {
                const chapter = db.chapters.find(c => c.id === data.chapterId);
                if (!chapter) return { success: false, error: 'Chapter not found.', data: null };
                return { success: true, data: chapter };
            }

            case 'getChapterContent': {
                const chapter = db.chapters.find(c => c.id === data.chapterId);
                if (!chapter) return { success: false, error: 'Chapter not found.', data: null };

                const sections = db.sections
                    .filter(s => s.chapterId === data.chapterId && (s.status === 'PUBLISHED' || currentUser?.role === 'ADMIN'))
                    .sort((a, b) => a.order - b.order)
                    .map(sec => {
                        const blocks = db.content
                            .filter(cnt => cnt.sectionId === sec.id && (cnt.status === 'PUBLISHED' || currentUser?.role === 'ADMIN'))
                            .sort((a, b) => a.order - b.order);
                        return {
                            id: sec.id,
                            title: sec.title,
                            order: sec.order,
                            status: sec.status,
                            blocks: blocks,
                            content: {
                                en: blocks.map(b => b.content.en).join('\n'),
                                bn: blocks.map(b => b.content.bn).join('\n')
                            }
                        };
                    });

                return {
                    success: true,
                    data: {
                        ...chapter,
                        sections: sections
                    }
                };
            }

            case 'createChapter': {
                const newChapter = {
                    id: 'ch_' + Date.now(),
                    partId: data.partId || 'fundamentals',
                    number: Number(data.number || db.chapters.length + 1),
                    order: Number(data.order || db.chapters.length + 1),
                    status: data.status || 'PUBLISHED',
                    title: { en: data.titleEn || data.title?.en || 'New Chapter', bn: data.titleBn || data.title?.bn || data.titleEn || 'নতুন অধ্যায়' },
                    description: { en: data.descriptionEn || data.description?.en || '', bn: data.descriptionBn || data.description?.bn || '' }
                };
                db.chapters.push(newChapter);
                MockDB.saveDB(db);
                return { success: true, data: newChapter };
            }

            case 'updateChapter': {
                const chapter = db.chapters.find(c => c.id === data.chapterId);
                if (!chapter) return { success: false, error: 'Chapter not found.', data: null };
                if (data.titleEn !== undefined) chapter.title.en = data.titleEn;
                if (data.titleBn !== undefined) chapter.title.bn = data.titleBn;
                if (data.descriptionEn !== undefined) chapter.description.en = data.descriptionEn;
                if (data.descriptionBn !== undefined) chapter.description.bn = data.descriptionBn;
                if (data.number !== undefined) chapter.number = Number(data.number);
                if (data.order !== undefined) chapter.order = Number(data.order);
                if (data.status !== undefined) chapter.status = data.status;
                MockDB.saveDB(db);
                return { success: true, message: 'Chapter updated.', data: null };
            }

            case 'deleteChapter': {
                const chapter = db.chapters.find(c => c.id === data.chapterId);
                if (chapter) chapter.status = 'DRAFT';
                MockDB.saveDB(db);
                return { success: true, message: 'Chapter unpublished.', data: null };
            }

            case 'getSections': {
                const sections = db.sections
                    .filter(s => !data.chapterId || s.chapterId === data.chapterId)
                    .sort((a, b) => a.order - b.order);
                return { success: true, data: sections };
            }

            case 'createSection': {
                const newSec = {
                    id: 'sec_' + Date.now(),
                    chapterId: data.chapterId,
                    title: { en: data.titleEn || 'New Section', bn: data.titleBn || data.titleEn || 'নতুন সেকশন' },
                    order: Number(data.order || 1),
                    status: data.status || 'PUBLISHED'
                };
                db.sections.push(newSec);
                MockDB.saveDB(db);
                return { success: true, data: newSec };
            }

            case 'updateSection': {
                const sec = db.sections.find(s => s.id === data.sectionId);
                if (!sec) return { success: false, error: 'Section not found.', data: null };
                if (data.titleEn !== undefined) sec.title.en = data.titleEn;
                if (data.titleBn !== undefined) sec.title.bn = data.titleBn;
                if (data.order !== undefined) sec.order = Number(data.order);
                if (data.status !== undefined) sec.status = data.status;
                MockDB.saveDB(db);
                return { success: true, message: 'Section updated.', data: null };
            }

            case 'deleteSection': {
                const sec = db.sections.find(s => s.id === data.sectionId);
                if (sec) sec.status = 'DRAFT';
                MockDB.saveDB(db);
                return { success: true, message: 'Section unpublished.', data: null };
            }

            case 'createContent': {
                const newContent = {
                    id: 'cnt_' + Date.now(),
                    sectionId: data.sectionId,
                    type: data.contentType || data.type || 'paragraph',
                    title: { en: data.titleEn || '', bn: data.titleBn || '' },
                    content: { en: data.contentEn || '', bn: data.contentBn || data.contentEn || '' },
                    order: Number(data.order || 1),
                    status: data.status || 'PUBLISHED'
                };
                db.content.push(newContent);
                MockDB.saveDB(db);
                return { success: true, data: newContent };
            }

            case 'updateContent': {
                const cnt = db.content.find(c => c.id === data.contentId);
                if (!cnt) return { success: false, error: 'Content not found.', data: null };
                if (data.contentType) cnt.type = data.contentType;
                if (data.titleEn !== undefined) cnt.title.en = data.titleEn;
                if (data.titleBn !== undefined) cnt.title.bn = data.titleBn;
                if (data.contentEn !== undefined) cnt.content.en = data.contentEn;
                if (data.contentBn !== undefined) cnt.content.bn = data.contentBn;
                if (data.order !== undefined) cnt.order = Number(data.order);
                if (data.status !== undefined) cnt.status = data.status;
                MockDB.saveDB(db);
                return { success: true, message: 'Content updated.', data: null };
            }

            case 'deleteContent': {
                const cnt = db.content.find(c => c.id === data.contentId);
                if (cnt) cnt.status = 'DRAFT';
                MockDB.saveDB(db);
                return { success: true, message: 'Content deleted.', data: null };
            }

            case 'getProgress': {
                const userProgress = db.progress.filter(p => p.userId === userId);
                const completedChapters = userProgress.filter(p => p.completed).map(p => p.chapterId);
                const publishedChapters = db.chapters.filter(c => c.status === 'PUBLISHED').sort((a, b) => a.order - b.order);

                const unlockedChapters = [];
                for (let i = 0; i < publishedChapters.length; i++) {
                    if (i === 0 || completedChapters.includes(publishedChapters[i - 1].id)) {
                        unlockedChapters.push(publishedChapters[i].id);
                    }
                }

                const userAttempts = db.quiz_attempts.filter(qa => qa.userId === userId);
                const quizAvg = userAttempts.length > 0
                    ? Math.round(userAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / userAttempts.length)
                    : 0;

                const bookmarks = db.bookmarks.filter(b => b.userId === userId);
                const questions = db.questions.filter(q => q.userId === userId);

                const latest = userProgress[userProgress.length - 1];
                const currentChapterId = latest ? latest.chapterId : (publishedChapters[0]?.id || null);

                return {
                    success: true,
                    data: {
                        chaptersCompleted: completedChapters.length,
                        totalChapters: publishedChapters.length,
                        quizAverage: quizAvg,
                        bookmarkCount: bookmarks.length,
                        questionCount: questions.length,
                        currentChapterId: currentChapterId,
                        currentProgress: latest ? latest.progressPercentage : 0,
                        currentChapterUnlocked: unlockedChapters.includes(currentChapterId),
                        completedChapters: completedChapters,
                        unlockedChapters: unlockedChapters,
                        overallProgress: publishedChapters.length > 0 ? Math.round((completedChapters.length / publishedChapters.length) * 100) : 0
                    }
                };
            }

            case 'updateProgress': {
                let rec = db.progress.find(p => p.userId === userId && p.chapterId === data.chapterId);
                if (!rec) {
                    rec = { id: 'prg_' + Date.now(), userId: userId, chapterId: data.chapterId, progressPercentage: 0, completed: false, updatedAt: now };
                    db.progress.push(rec);
                }
                rec.progressPercentage = Number(data.progress || 0);
                rec.updatedAt = now;
                MockDB.saveDB(db);
                return { success: true, message: 'Progress updated.', data: null };
            }

            case 'getBookmarks': {
                const list = db.bookmarks.filter(b => b.userId === userId);
                return { success: true, data: list };
            }

            case 'addBookmark': {
                const exists = db.bookmarks.find(b => b.userId === userId && b.chapterId === data.chapterId && b.sectionId === data.sectionId);
                if (exists) return { success: true, message: 'Already bookmarked', data: exists };
                const newBm = { id: 'bm_' + Date.now(), userId: userId, chapterId: data.chapterId, sectionId: data.sectionId, createdAt: now };
                db.bookmarks.push(newBm);
                MockDB.saveDB(db);
                return { success: true, data: newBm };
            }

            case 'removeBookmark': {
                db.bookmarks = db.bookmarks.filter(b => b.id !== data.bookmarkId);
                MockDB.saveDB(db);
                return { success: true, message: 'Bookmark removed.', data: null };
            }

            case 'getNotes': {
                const list = db.notes.filter(n => n.userId === userId);
                return { success: true, data: list };
            }

            case 'addNote': {
                const newNote = {
                    id: 'nt_' + Date.now(),
                    userId: userId,
                    chapterId: data.chapterId,
                    sectionId: data.sectionId || '',
                    content: data.content,
                    createdAt: now,
                    updatedAt: now
                };
                db.notes.push(newNote);
                MockDB.saveDB(db);
                return { success: true, data: newNote };
            }

            case 'updateNote': {
                const note = db.notes.find(n => n.id === data.noteId);
                if (!note) return { success: false, error: 'Note not found.', data: null };
                note.content = data.content;
                note.updatedAt = now;
                MockDB.saveDB(db);
                return { success: true, message: 'Note updated.', data: null };
            }

            case 'deleteNote': {
                db.notes = db.notes.filter(n => n.id !== data.noteId);
                MockDB.saveDB(db);
                return { success: true, message: 'Note deleted.', data: null };
            }

            case 'getQuestions': {
                const list = db.questions.filter(q => q.userId === userId);
                return { success: true, data: list };
            }

            case 'getAllQuestions': {
                const userMap = {};
                db.users.forEach(u => { userMap[u.id] = u.displayName || u.username; });
                const list = db.questions.map(q => ({
                    ...q,
                    userName: userMap[q.userId] || 'User'
                }));
                return { success: true, data: list };
            }

            case 'getPendingQuestions': {
                const res = this.mockHandler('getAllQuestions', {});
                return { success: true, data: res.data.filter(q => q.status === 'PENDING') };
            }

            case 'submitQuestion': {
                const newQ = {
                    id: 'qs_' + Date.now(),
                    userId: userId,
                    chapterId: data.chapterId,
                    sectionId: data.sectionId,
                    topic: data.topic || 'Python',
                    questionType: data.questionType || 'concept',
                    questionText: data.questionText,
                    understanding: data.understanding,
                    status: 'PENDING',
                    createdAt: now,
                    updatedAt: now,
                    answer: ''
                };
                db.questions.push(newQ);
                MockDB.saveDB(db);
                return { success: true, data: newQ };
            }

            case 'answerQuestion': {
                const q = db.questions.find(item => item.id === data.questionId);
                if (!q) return { success: false, error: 'Question not found.', data: null };
                q.answer = data.answer;
                q.status = 'ANSWERED';
                q.updatedAt = now;
                MockDB.saveDB(db);
                return { success: true, message: 'Answer submitted.', data: null };
            }

            case 'getQuiz': {
                const quiz = db.quizzes.find(q => q.chapterId === data.chapterId || q.id === data.chapterId);
                if (!quiz) return { success: false, error: 'Quiz not found.', data: null };
                const questions = db.quiz_questions.filter(qq => qq.quizId === quiz.id).sort((a, b) => a.order - b.order);
                return {
                    success: true,
                    data: {
                        id: quiz.id,
                        chapterId: quiz.chapterId,
                        title: quiz.title,
                        passPercentage: quiz.passPercentage || 70,
                        questions: questions
                    }
                };
            }

            case 'getQuizzes': {
                const chapterMap = {};
                db.chapters.forEach(c => { chapterMap[c.id] = { number: c.number, titleEn: c.title.en, titleBn: c.title.bn }; });
                const list = db.quizzes.map(q => ({
                    ...q,
                    chapterInfo: chapterMap[q.chapterId] || null
                }));
                return { success: true, data: list };
            }

            case 'createQuiz': {
                const newQuiz = {
                    id: 'qz_' + Date.now(),
                    chapterId: data.chapterId,
                    title: { en: data.titleEn || 'Chapter Quiz', bn: data.titleBn || data.titleEn || 'অধ্যায় কুইজ' },
                    passPercentage: Number(data.passPercentage || 70),
                    status: data.status || 'PUBLISHED'
                };
                db.quizzes.push(newQuiz);
                MockDB.saveDB(db);
                return { success: true, data: newQuiz };
            }

            case 'updateQuiz': {
                const quiz = db.quizzes.find(q => q.id === data.quizId);
                if (!quiz) return { success: false, error: 'Quiz not found.', data: null };
                if (data.passPercentage !== undefined) quiz.passPercentage = Number(data.passPercentage);
                if (data.titleEn !== undefined) quiz.title.en = data.titleEn;
                if (data.titleBn !== undefined) quiz.title.bn = data.titleBn;
                if (data.status !== undefined) quiz.status = data.status;
                MockDB.saveDB(db);
                return { success: true, message: 'Quiz updated.', data: null };
            }

            case 'deleteQuiz': {
                const quiz = db.quizzes.find(q => q.id === data.quizId);
                if (quiz) quiz.status = 'DRAFT';
                MockDB.saveDB(db);
                return { success: true, message: 'Quiz deleted.', data: null };
            }

            case 'getQuizQuestions': {
                const questions = db.quiz_questions.filter(qq => qq.quizId === data.quizId).sort((a, b) => a.order - b.order);
                return { success: true, data: questions };
            }

            case 'createQuizQuestion': {
                const newQQ = {
                    id: 'qq_' + Date.now(),
                    quizId: data.quizId,
                    order: Number(data.order || 1),
                    question: { en: data.questionEn || '', bn: data.questionBn || data.questionEn || '' },
                    explanation: { en: data.explanationEn || '', bn: data.explanationBn || data.explanationEn || '' },
                    options: (data.options || []).map((opt, idx) => ({
                        id: 'opt_' + idx,
                        text: typeof opt === 'string' ? { en: opt, bn: opt } : { en: opt.en || opt.text, bn: opt.bn || opt.en || opt.text }
                    })),
                    correctOptionIndex: Number(data.correctIndex || 0)
                };
                db.quiz_questions.push(newQQ);
                MockDB.saveDB(db);
                return { success: true, data: newQQ };
            }

            case 'updateQuizQuestion': {
                const qq = db.quiz_questions.find(q => q.id === data.questionId);
                if (!qq) return { success: false, error: 'Question not found.', data: null };
                if (data.questionEn !== undefined) qq.question.en = data.questionEn;
                if (data.questionBn !== undefined) qq.question.bn = data.questionBn;
                if (data.explanationEn !== undefined) qq.explanation.en = data.explanationEn;
                if (data.explanationBn !== undefined) qq.explanation.bn = data.explanationBn;
                if (data.correctIndex !== undefined) qq.correctOptionIndex = Number(data.correctIndex);
                if (data.options) {
                    qq.options = data.options.map((opt, idx) => ({
                        id: 'opt_' + idx,
                        text: typeof opt === 'string' ? { en: opt, bn: opt } : { en: opt.en || opt.text, bn: opt.bn || opt.en || opt.text }
                    }));
                }
                MockDB.saveDB(db);
                return { success: true, message: 'Question updated.', data: null };
            }

            case 'deleteQuizQuestion': {
                db.quiz_questions = db.quiz_questions.filter(q => q.id !== data.questionId);
                MockDB.saveDB(db);
                return { success: true, message: 'Question deleted.', data: null };
            }

            case 'completeQuiz': {
                const quiz = db.quizzes.find(q => q.id === data.quizId);
                const attemptNumber = db.quiz_attempts.filter(qa => qa.userId === userId && qa.quizId === data.quizId).length + 1;

                db.quiz_attempts.push({
                    id: 'qa_' + Date.now(),
                    userId: userId,
                    quizId: data.quizId,
                    score: data.score,
                    percentage: data.percentage,
                    passed: data.passed,
                    attemptNumber: attemptNumber,
                    createdAt: now
                });

                if (data.passed && quiz) {
                    let prog = db.progress.find(p => p.userId === userId && p.chapterId === quiz.chapterId);
                    if (!prog) {
                        prog = { id: 'prg_' + Date.now(), userId: userId, chapterId: quiz.chapterId, progressPercentage: 100, completed: true, updatedAt: now };
                        db.progress.push(prog);
                    } else {
                        prog.completed = true;
                        prog.progressPercentage = 100;
                        prog.updatedAt = now;
                    }
                }

                MockDB.saveDB(db);
                return { success: true, message: 'Quiz completed.', data: { passed: data.passed, attemptNumber } };
            }

            case 'getStats': {
                const totalUsers = db.users.length;
                const activeUsers = db.users.filter(u => u.status === 'ACTIVE').length;
                const totalChapters = db.chapters.length;
                const publishedChapters = db.chapters.filter(c => c.status === 'PUBLISHED').length;
                const pendingQuestions = db.questions.filter(q => q.status === 'PENDING').length;
                const totalQuestions = db.questions.length;
                const quizAvg = db.quiz_attempts.length > 0
                    ? Math.round(db.quiz_attempts.reduce((a, b) => a + b.percentage, 0) / db.quiz_attempts.length)
                    : 0;

                return {
                    success: true,
                    data: {
                        totalUsers,
                        activeUsers,
                        totalChapters,
                        publishedChapters,
                        pendingQuestions,
                        totalQuestions,
                        quizAverage: quizAvg,
                        quizAttempts: db.quiz_attempts.length,
                        recentActivity: db.activity_logs.slice(0, 15)
                    }
                };
            }

            case 'getSettings': {
                return { success: true, data: db.settings };
            }

            case 'updateSettings': {
                db.settings = { ...db.settings, ...(data || {}) };
                MockDB.saveDB(db);
                return { success: true, message: 'Settings saved.', data: db.settings };
            }

            case 'getActivityLogs': {
                return { success: true, data: db.activity_logs };
            }

            default:
                return { success: false, error: 'Unknown action: ' + action, data: null };
        }
    }

    // Authentication API
    static async login(username, password) {
        return await this.request('login', 'POST', { username, password });
    }

    // User Management API
    static async getUser(userId) {
        return await this.request('getUser', 'GET', { userId });
    }

    static async updatePassword(userId, newPassword) {
        return await this.request('updatePassword', 'POST', { userId, newPassword });
    }

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

    // Chapter API
    static async getChapters() {
        return await this.request('getChapters', 'GET');
    }

    static async getChapter(chapterId) {
        return await this.request('getChapter', 'GET', { chapterId });
    }

    static async getChapterContent(chapterId) {
        return await this.request('getChapterContent', 'GET', { chapterId });
    }

    static async createChapter(data) {
        return await this.request('createChapter', 'POST', data);
    }

    static async updateChapter(chapterId, data) {
        return await this.request('updateChapter', 'POST', { chapterId, ...data });
    }

    static async deleteChapter(chapterId) {
        return await this.request('deleteChapter', 'POST', { chapterId });
    }

    // Section & Content API
    static async getSections(chapterId) {
        return await this.request('getSections', 'GET', { chapterId });
    }

    static async createSection(data) {
        return await this.request('createSection', 'POST', data);
    }

    static async updateSection(sectionId, data) {
        return await this.request('updateSection', 'POST', { sectionId, ...data });
    }

    static async deleteSection(sectionId) {
        return await this.request('deleteSection', 'POST', { sectionId });
    }

    static async createContent(data) {
        return await this.request('createContent', 'POST', data);
    }

    static async updateContent(contentId, data) {
        return await this.request('updateContent', 'POST', { contentId, ...data });
    }

    static async deleteContent(contentId) {
        return await this.request('deleteContent', 'POST', { contentId });
    }

    // Progress API
    static async getProgress(userId) {
        return await this.request('getProgress', 'GET', { userId });
    }

    static async updateProgress(userId, chapterId, progress, sectionId) {
        return await this.request('updateProgress', 'POST', { userId, chapterId, progress, sectionId });
    }

    // Bookmarks API
    static async getBookmarks(userId) {
        return await this.request('getBookmarks', 'GET', { userId });
    }

    static async addBookmark(userId, chapterId, sectionId) {
        return await this.request('addBookmark', 'POST', { userId, chapterId, sectionId });
    }

    static async removeBookmark(bookmarkId) {
        return await this.request('removeBookmark', 'POST', { bookmarkId });
    }

    // Notes API
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

    // Student Questions API
    static async getQuestions(userId) {
        return await this.request('getQuestions', 'GET', { userId });
    }

    static async getAllQuestions() {
        return await this.request('getAllQuestions', 'GET');
    }

    static async getPendingQuestions() {
        return await this.request('getPendingQuestions', 'GET');
    }

    static async submitQuestion(userId, chapterId, sectionId, questionText, understanding, questionType = 'concept', topic = '') {
        return await this.request('submitQuestion', 'POST', {
            userId,
            chapterId,
            sectionId,
            questionText,
            understanding,
            questionType,
            topic
        });
    }

    static async answerQuestion(questionId, answer) {
        return await this.request('answerQuestion', 'POST', { questionId, answer });
    }

    // Quiz API
    static async getQuiz(chapterId) {
        return await this.request('getQuiz', 'GET', { chapterId });
    }

    static async getQuizzes() {
        return await this.request('getQuizzes', 'GET');
    }

    static async createQuiz(data) {
        return await this.request('createQuiz', 'POST', data);
    }

    static async updateQuiz(quizId, data) {
        return await this.request('updateQuiz', 'POST', { quizId, ...data });
    }

    static async deleteQuiz(quizId) {
        return await this.request('deleteQuiz', 'POST', { quizId });
    }

    static async getQuizQuestions(quizId) {
        return await this.request('getQuizQuestions', 'GET', { quizId });
    }

    static async createQuizQuestion(data) {
        return await this.request('createQuizQuestion', 'POST', data);
    }

    static async updateQuizQuestion(questionId, data) {
        return await this.request('updateQuizQuestion', 'POST', { questionId, ...data });
    }

    static async deleteQuizQuestion(questionId) {
        return await this.request('deleteQuizQuestion', 'POST', { questionId });
    }

    static async submitQuizAnswer(userId, quizId, questionId, optionId) {
        return await this.request('submitQuizAnswer', 'POST', { userId, quizId, questionId, optionId });
    }

    static async completeQuiz(userId, quizId, score, percentage, passed) {
        return await this.request('completeQuiz', 'POST', { userId, quizId, score, percentage, passed });
    }

    // Platform Stats & Settings API
    static async getStats() {
        return await this.request('getStats', 'GET');
    }

    static async getSettings() {
        return await this.request('getSettings', 'GET');
    }

    static async updateSettings(settings) {
        return await this.request('updateSettings', 'POST', settings);
    }

    static async getActivityLogs() {
        return await this.request('getActivityLogs', 'GET');
    }
}

// User-friendly Error Formatting
function handleAPIError(error) {
    console.error('API Handler Error:', error);
    const lang = LanguageManager.getCurrentLanguage();
    const msg = error && error.message ? error.message : '';

    if (msg.includes('Invalid') || msg.includes('credentials')) {
        return lang === 'bn' ? 'ব্যবহারকারীর নাম বা পাসওয়ার্ড সঠিক নয়।' : 'Invalid username or password.';
    }
    if (msg.includes('Permission') || msg.includes('Unauthorized') || msg.includes('denied')) {
        return lang === 'bn' ? 'আপনার এই কাজটি করার অনুমতি নেই।' : 'You do not have permission to perform this action.';
    }
    if (msg.includes('locked')) {
        return lang === 'bn' ? 'এই অধ্যায়টি লক করা আছে। অনুগ্রহ করে আগের কুইজ সম্পন্ন করুন।' : 'Chapter is locked. Please complete the previous chapter quiz first.';
    }
    if (msg.includes('exists')) {
        return lang === 'bn' ? 'এই ব্যবহারকারী নামটি ইতিমধ্যে ব্যবহার করা হয়েছে।' : 'Username already exists.';
    }
    return lang === 'bn' ? 'কিছু ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Something went wrong. Please try again.';
}
