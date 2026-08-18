// Google Apps Script - Complete Database Schema & Demo Data Initializer
// Run setupDatabase() once from the Apps Script editor after pasting all files.

function setupDatabase() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('No active spreadsheet found. Open the Google Sheet bound to this script.');

    const schemas = {
        users: ['id', 'username', 'password_hash', 'display_name', 'role', 'status', 'created_at', 'updated_at'],
        chapters: ['id', 'part_id', 'chapter_number', 'title_en', 'title_bn', 'description_en', 'description_bn', 'order_no', 'status', 'created_at', 'updated_at'],
        sections: ['id', 'chapter_id', 'title_en', 'title_bn', 'order_no', 'status'],
        content: ['id', 'section_id', 'content_type', 'title_en', 'title_bn', 'content_en', 'content_bn', 'order_no', 'status'],
        quizzes: ['id', 'chapter_id', 'title_en', 'title_bn', 'pass_percentage', 'status'],
        quiz_questions: ['id', 'quiz_id', 'question_en', 'question_bn', 'explanation_en', 'explanation_bn', 'order_no'],
        quiz_options: ['id', 'question_id', 'option_en', 'option_bn', 'is_correct'],
        progress: ['id', 'user_id', 'chapter_id', 'progress_percentage', 'last_position', 'completed', 'updated_at'],
        bookmarks: ['id', 'user_id', 'chapter_id', 'section_id', 'created_at'],
        notes: ['id', 'user_id', 'chapter_id', 'section_id', 'content', 'created_at', 'updated_at'],
        questions: ['id', 'user_id', 'chapter_id', 'section_id', 'topic', 'question_type', 'question_text', 'understanding_text', 'status', 'created_at', 'updated_at'],
        question_answers: ['id', 'question_id', 'admin_id', 'answer', 'created_at', 'updated_at'],
        quiz_attempts: ['id', 'user_id', 'quiz_id', 'score', 'total', 'percentage', 'passed', 'attempt_number', 'created_at'],
        activity_logs: ['id', 'user_id', 'action', 'description', 'timestamp'],
        settings: ['setting_key', 'setting_value', 'description', 'updated_at']
    };

    Object.keys(schemas).forEach(name => {
        let sheet = ss.getSheetByName(name);
        if (!sheet) sheet = ss.insertSheet(name);
        sheet.clear();
        sheet.getRange(1, 1, 1, schemas[name].length).setValues([schemas[name]]);
        sheet.setFrozenRows(1);
    });

    seedDemoData(ss);
    return 'Database schema and demo data initialized successfully!';
}

function seedDemoData(ss) {
    const now = new Date();
    const adminId = Utilities.getUuid();
    const rezaId = Utilities.getUuid();
    const karimId = Utilities.getUuid();

    // 1. Users
    ss.getSheetByName('users').getRange(2, 1, 3, 8).setValues([
        [adminId, 'admin', bytesToString(hashPassword('admin123')), 'Administrator', 'ADMIN', 'ACTIVE', now, now],
        [rezaId, 'reza', bytesToString(hashPassword('demo123')), 'Rezaul Karim', 'USER', 'ACTIVE', now, now],
        [karimId, 'karim', bytesToString(hashPassword('demo123')), 'Karim Islam', 'USER', 'DISABLED', now, now]
    ]);

    // 2. Chapters
    const ch1 = Utilities.getUuid();
    const ch2 = Utilities.getUuid();
    const ch3 = Utilities.getUuid();

    ss.getSheetByName('chapters').getRange(2, 1, 3, 11).setValues([
        [
            ch1, 'fundamentals', 1,
            'What is Python?', 'Python কী?',
            'Understand what Python is, why it is popular, and write your first program.',
            'Python কী, কেন এটি এত জনপ্রিয় এবং আপনার প্রথম প্রোগ্রাম কীভাবে লিখবেন তা শিখুন।',
            1, 'PUBLISHED', now, now
        ],
        [
            ch2, 'fundamentals', 2,
            'Variables & Data Types', 'Variables ও Data Types',
            'Learn how Python represents values, names variables, and handles fundamental types.',
            'Python কীভাবে বিভিন্ন মান সংরক্ষণ করে এবং ডেটা টাইপ নিয়ে কাজ করে তা জানুন।',
            2, 'PUBLISHED', now, now
        ],
        [
            ch3, 'fundamentals', 3,
            'Conditions & Logic', 'শর্ত এবং Logic',
            'Make decisions in code using if, elif, else and Boolean logic.',
            'if, elif, else এবং বুলিয়ান লজিক ব্যবহার করে সিদ্ধান্তমূলক কোড লেখা শিখুন।',
            3, 'PUBLISHED', now, now
        ]
    ]);

    // 3. Sections
    const sec1_1 = Utilities.getUuid();
    const sec1_2 = Utilities.getUuid();
    const sec2_1 = Utilities.getUuid();
    const sec2_2 = Utilities.getUuid();
    const sec3_1 = Utilities.getUuid();
    const sec3_2 = Utilities.getUuid();

    const sections = [
        [sec1_1, ch1, 'Introduction to Python', 'Python পরিচিতি', 1, 'PUBLISHED'],
        [sec1_2, ch1, 'Your First Python Program', 'আপনার প্রথম Python প্রোগ্রাম', 2, 'PUBLISHED'],
        [sec2_1, ch2, 'Variables and Memory Model', 'Variable এবং মেমোরি ধারণা', 1, 'PUBLISHED'],
        [sec2_2, ch2, 'Fundamental Data Types', 'মৌলিক Data Types', 2, 'PUBLISHED'],
        [sec3_1, ch3, 'Conditional Statements (if / elif / else)', 'শর্তাধীন স্টেটমেন্ট (if / elif / else)', 1, 'PUBLISHED'],
        [sec3_2, ch3, 'Logical Operators & Decisions', 'Logical Operators এবং সিদ্ধান্ত গ্রহণ', 2, 'PUBLISHED']
    ];
    ss.getSheetByName('sections').getRange(2, 1, sections.length, 6).setValues(sections);

    // 4. Content Blocks
    const contentRows = [
        [
            Utilities.getUuid(), sec1_1, 'paragraph',
            '', '',
            '<p>Python is a readable, high-level, interpreted programming language created by Guido van Rossum. Its design philosophy emphasizes code readability and simplicity with clean syntax.</p>',
            '<p>Python একটি সহজে পাঠযোগ্য, উচ্চস্তরের এবং ইন্টারপ্রেটেড প্রোগ্রামিং ভাষা। এর ডিজাইন দর্শন কোডের সরলতা এবং পরিচ্ছন্ন সিনট্যাক্সকে অগ্রাধিকার দেয়।</p>',
            1, 'PUBLISHED'
        ],
        [
            Utilities.getUuid(), sec1_1, 'callout',
            'Key Idea', 'মূল ধারণা',
            '<p>Python is dynamically typed and garbage-collected, which allows developers to focus on logic rather than memory management.</p>',
            '<p>Python ডায়নামিক টাইপড এবং স্বয়ংক্রিয় মেমোরি ম্যানেজমেন্ট প্রদান করে, যা সরাসরি লজিকে মনোযোগ দিতে সাহায্য করে।</p>',
            2, 'PUBLISHED'
        ],
        [
            Utilities.getUuid(), sec1_2, 'paragraph',
            '', '',
            '<p>The simplest way to start is using the <code>print()</code> function, which outputs information to the terminal or console.</p>',
            '<p>Python শেখা শুরু করার সহজতম উপায় হলো <code>print()</code> ফাংশন ব্যবহার করা, যা কনসোলে আউটপুট প্রদর্শন করে।</p>',
            1, 'PUBLISHED'
        ],
        [
            Utilities.getUuid(), sec1_2, 'code',
            'Hello World Example', 'Hello World উদাহরণ',
            '# Output a friendly message to the screen\nprint("Hello, Python Learning Journey!")\n\nmessage = "Think in code."\nprint(message)',
            '# স্ক্রিনে একটি বার্তা প্রদর্শন করুন\nprint("Hello, Python Learning Journey!")\n\nmessage = "Think in code."\nprint(message)',
            2, 'PUBLISHED'
        ],
        [
            Utilities.getUuid(), sec2_1, 'paragraph',
            '', '',
            '<p>In Python, a variable is not a container that holds a value; it is a label (or reference) that points to an object in memory.</p>',
            '<p>Python-এ variable কোনো বাক্সের মতো নয়; এটি মেমোরিতে থাকা একটি বস্তুর দিকে নির্দেশকারী লেবেল বা রেফারেন্স।</p>',
            1, 'PUBLISHED'
        ],
        [
            Utilities.getUuid(), sec2_1, 'code',
            'Variables Example', 'Variable উদাহরণ',
            'user_name = "Reza"\nscore = 95\nis_enrolled = True\n\nprint(f"User: {user_name}, Score: {score}, Active: {is_enrolled}")',
            'user_name = "Reza"\nscore = 95\nis_enrolled = True\n\nprint(f"User: {user_name}, Score: {score}, Active: {is_enrolled}")',
            2, 'PUBLISHED'
        ],
        [
            Utilities.getUuid(), sec2_2, 'callout',
            'Important Concept', 'গুরুত্বপূর্ণ ধারণা',
            '<p>Python provides four basic scalar types: <code>int</code>, <code>float</code>, <code>str</code>, and <code>bool</code>. You can inspect an object\'s type using <code>type()</code>.</p>',
            '<p>Python-এর চারটি মৌলিক স্কেলার টাইপ রয়েছে: <code>int</code>, <code>float</code>, <code>str</code>, এবং <code>bool</code>। টাইপ জানতে <code>type()</code> ফাংশন ব্যবহার করুন।</p>',
            1, 'PUBLISHED'
        ],
        [
            Utilities.getUuid(), sec3_1, 'code',
            'Condition Example', 'Condition উদাহরণ',
            'score = 85\n\nif score >= 90:\n    print("Grade: A")\nelif score >= 70:\n    print("Grade: B (Passed!)")\nelse:\n    print("Please review and retry.")',
            'score = 85\n\nif score >= 90:\n    print("Grade: A")\nelif score >= 70:\n    print("Grade: B (Passed!)")\nelse:\n    print("Please review and retry.")',
            1, 'PUBLISHED'
        ],
        [
            Utilities.getUuid(), sec3_2, 'paragraph',
            '', '',
            '<p>Use <code>and</code>, <code>or</code>, and <code>not</code> to compose composite conditions cleanly without nested clauses.</p>',
            '<p>জটিল সিদ্ধান্ত গ্রহণের জন্য <code>and</code>, <code>or</code>, এবং <code>not</code> লজিক্যাল অপারেটর ব্যবহার করুন।</p>',
            1, 'PUBLISHED'
        ]
    ];
    ss.getSheetByName('content').getRange(2, 1, contentRows.length, 9).setValues(contentRows);

    // 5. Quizzes
    const quiz1 = Utilities.getUuid();
    const quiz2 = Utilities.getUuid();
    const quiz3 = Utilities.getUuid();

    const quizzes = [
        [quiz1, ch1, 'What is Python? Quiz', 'Python কী? কুইজ', 70, 'PUBLISHED'],
        [quiz2, ch2, 'Variables & Types Quiz', 'Variables ও Types কুইজ', 70, 'PUBLISHED'],
        [quiz3, ch3, 'Conditions & Logic Quiz', 'Conditions ও Logic কুইজ', 70, 'PUBLISHED']
    ];
    ss.getSheetByName('quizzes').getRange(2, 1, quizzes.length, 6).setValues(quizzes);

    // 6. Questions & Options
    const questionRows = [];
    const optionRows = [];

    // Quiz 1 Questions
    addDemoQuizQuestion(
        questionRows, optionRows, quiz1,
        'Which function is used to output text to the console in Python?',
        'Python-এ কনসোলে টেক্সট আউটপুট দিতে কোন ফাংশন ব্যবহৃত হয়?',
        'The `print()` built-in function displays string representations to stdout.',
        '`print()` বিল্ট-ইন ফাংশন টেক্সট কনসোলে প্রদর্শন করে।',
        ['echo()', 'print()', 'console.log()', 'write()'],
        ['echo()', 'print()', 'console.log()', 'write()'],
        1, 1
    );
    addDemoQuizQuestion(
        questionRows, optionRows, quiz1,
        'How is code block indentation defined in Python?',
        'Python-এ কোড ব্লকের ইন্ডেন্টেশন কীভাবে নির্ধারিত হয়?',
        'Python relies on whitespace indentation instead of curly braces {} to define scope.',
        'Python কার্লি ব্র্যাকেটের বদলে স্পেস বা ইন্ডেন্টেশন দিয়ে কোড ব্লক নির্ধারণ করে।',
        ['Curly braces {}', 'Whitespace / Indentation', 'Parentheses ()', 'Semicolons ;'],
        ['কার্লি ব্র্যাকেট {}', 'স্পেস / ইন্ডেন্টেশন', 'প্যারেন্থেসিস ()', 'সেমিকোলন ;'],
        1, 2
    );

    // Quiz 2 Questions
    addDemoQuizQuestion(
        questionRows, optionRows, quiz2,
        'What is a Python variable conceptually?',
        'Python-এ variable ধারণাগতভাবে কী?',
        'A variable is a name that references an object in memory.',
        'Variable হলো একটি নাম যা মেমোরিতে থাকা অবজেক্টের রেফারেন্স নির্দেশ করে।',
        ['A fixed memory register', 'A name bound to an object reference', 'A database table column', 'A static constant'],
        ['একটি ফিক্সড মেমোরি রেজিস্টার', 'একটি অবজেক্টের সাথে যুক্ত নামের রেফারেন্স', 'একটি ডেটাবেস কলাম', 'একটি স্ট্যাটিক কনস্ট্যান্ট'],
        1, 1
    );
    addDemoQuizQuestion(
        questionRows, optionRows, quiz2,
        'Which of the following is a Boolean literal in Python?',
        'নিচের কোনটি Python-এ বুলিয়ান লিটারেল?',
        'In Python, `True` and `False` are capitalized keywords.',
        'Python-এ `True` এবং `False` বড় হাতের অক্ষর দিয়ে শুরু হওয়া কিওয়ার্ড।',
        ['true', 'True', 'TRUE', '1_bool'],
        ['true', 'True', 'TRUE', '1_bool'],
        1, 2
    );

    // Quiz 3 Questions
    addDemoQuizQuestion(
        questionRows, optionRows, quiz3,
        'Which keyword is used for "else if" in Python?',
        'Python-এ "else if"-এর জন্য কোন কিওয়ার্ড ব্যবহৃত হয়?',
        'Python uses the `elif` keyword for multiple conditional branches.',
        'Python-এ একাধিক শর্তের জন্য `elif` কিওয়ার্ড ব্যবহৃত হয়।',
        ['elseif', 'else if', 'elif', 'elsif'],
        ['elseif', 'else if', 'elif', 'elsif'],
        2, 1
    );

    ss.getSheetByName('quiz_questions').getRange(2, 1, questionRows.length, 7).setValues(questionRows);
    ss.getSheetByName('quiz_options').getRange(2, 1, optionRows.length, 5).setValues(optionRows);

    // 7. Initial Progress, Bookmarks, Notes & Questions for demo user 'reza'
    ss.getSheetByName('progress').appendRow([Utilities.getUuid(), rezaId, ch1, 100, sec1_2, true, now]);
    ss.getSheetByName('progress').appendRow([Utilities.getUuid(), rezaId, ch2, 50, sec2_1, false, now]);

    ss.getSheetByName('bookmarks').appendRow([Utilities.getUuid(), rezaId, ch1, sec1_2, now]);
    ss.getSheetByName('bookmarks').appendRow([Utilities.getUuid(), rezaId, ch2, sec2_1, now]);

    ss.getSheetByName('notes').appendRow([Utilities.getUuid(), rezaId, ch1, sec1_2, 'Remember that print() is a function in Python 3, not a statement.', now, now]);
    ss.getSheetByName('notes').appendRow([Utilities.getUuid(), rezaId, ch2, sec2_1, 'Variables point to objects; reassigning just moves the reference pointer.', now, now]);

    const qId = Utilities.getUuid();
    ss.getSheetByName('questions').appendRow([
        qId, rezaId, ch2, sec2_1, 'Variables & Types', 'concept',
        'Why does Python allow changing the type of value a variable points to?',
        'I understand variables are labels, but is there any type safety concern with dynamic rebinding?',
        'ANSWERED', now, now
    ]);

    ss.getSheetByName('question_answers').appendRow([
        Utilities.getUuid(), qId, adminId,
        'Great question! In Python, types are attached to objects in memory, not to the variable name itself. Variable names are simply references. Dynamic rebinding gives great flexibility, while type hints can be used when you want static analysis check.',
        now, now
    ]);

    // Initial quiz attempt
    ss.getSheetByName('quiz_attempts').appendRow([
        Utilities.getUuid(), rezaId, quiz1, 2, 2, 100, true, 1, now
    ]);

    // Settings
    ss.getSheetByName('settings').appendRow(['DEFAULT_PASS_MARK', '70', 'Default chapter quiz pass percentage', now]);
    ss.getSheetByName('settings').appendRow(['PLATFORM_TITLE', 'My Python Journey', 'Platform display name', now]);
    ss.getSheetByName('settings').appendRow(['DEFAULT_LANGUAGE', 'en', 'Default interface language (en or bn)', now]);

    // Activity Logs
    ss.getSheetByName('activity_logs').appendRow([Utilities.getUuid(), adminId, 'SETUP_DATABASE', 'Production database schema and Python learning journey seed data initialized.', now]);
}

function addDemoQuizQuestion(questionRows, optionRows, quizId, questionEn, questionBn, explanationEn, explanationBn, optionsEn, optionsBn, correctIndex, orderNo) {
    const questionId = Utilities.getUuid();
    questionRows.push([questionId, quizId, questionEn, questionBn, explanationEn, explanationBn, orderNo]);
    for (let i = 0; i < optionsEn.length; i++) {
        optionRows.push([
            Utilities.getUuid(),
            questionId,
            optionsEn[i],
            optionsBn[i] || optionsEn[i],
            i === correctIndex
        ]);
    }
}
