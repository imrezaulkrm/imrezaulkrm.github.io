// Google Apps Script - Authentication & User Management

function login(username, password) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return sendResponse(false, 'Database not found. Please run setupDatabase() first.', null, 500);
    const sheet = ss.getSheetByName('users');
    if (!sheet) return sendResponse(false, 'Users table not found. Please run setupDatabase() first.', null, 500);

    const normalizedUsername = String(username || '').trim().toLowerCase();
    if (!normalizedUsername || !password) {
        return sendResponse(false, 'Username and password are required.', null, 400);
    }

    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const user = {
            id: row[0],
            username: String(row[1]).trim().toLowerCase(),
            password_hash: row[2],
            display_name: row[3],
            role: row[4],
            status: row[5]
        };
        
        if (user.username === normalizedUsername) {
            if (user.status !== 'ACTIVE') {
                return sendResponse(false, 'This account is disabled. Please contact the administrator.', null, 403);
            }

            const hash = bytesToString(hashPassword(password));
            if (user.password_hash === hash) {
                const token = createSession(user);
                logActivity(user.id, 'LOGIN', 'User ' + user.username + ' logged in successfully.');
                
                return sendResponse(true, 'Login successful', {
                    id: user.id,
                    username: row[1], // original case
                    displayName: user.display_name,
                    role: user.role,
                    status: user.status,
                    token: token
                });
            }
        }
    }
    
    return sendResponse(false, 'Invalid username or password.', null, 401);
}

function getUser(userId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    if (!sheet) return sendResponse(false, 'Users table not found.', null, 404);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] === userId) {
            return sendResponse(true, 'User found', {
                id: row[0],
                username: row[1],
                displayName: row[3],
                role: row[4],
                status: row[5],
                createdAt: row[6]
            });
        }
    }
    
    return sendResponse(false, 'User not found.', null, 404);
}

function updatePassword(userId, newPassword) {
    if (!newPassword || String(newPassword).length < 6) {
        return sendResponse(false, 'Password must be at least 6 characters.', null, 400);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    if (!sheet) return sendResponse(false, 'Users table not found.', null, 404);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
            const hash = bytesToString(hashPassword(newPassword));
            sheet.getRange(i + 1, 3).setValue(hash); // Column C is password_hash
            sheet.getRange(i + 1, 8).setValue(new Date()); // Column H is updated_at
            logActivity(userId, 'PASSWORD_CHANGE', 'Password updated for user ' + data[i][1]);
            return sendResponse(true, 'Password updated successfully.', null);
        }
    }
    
    return sendResponse(false, 'User not found.', null, 404);
}

function createUser(username, displayName, password, role, adminId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    if (!sheet) return sendResponse(false, 'Users table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    const normalizedUsername = String(username || '').trim().toLowerCase();

    if (!normalizedUsername || !password || !displayName) {
        return sendResponse(false, 'Username, display name, and password are required.', null, 400);
    }

    if (String(password).length < 6) {
        return sendResponse(false, 'Password must be at least 6 characters.', null, 400);
    }

    for (let i = 1; i < data.length; i++) {
        if (String(data[i][1]).toLowerCase() === normalizedUsername) {
            return sendResponse(false, 'Username already exists. Please choose a different username.', null, 409);
        }
    }

    const userId = Utilities.getUuid();
    const hash = bytesToString(hashPassword(password));
    const safeRole = role === 'ADMIN' ? 'ADMIN' : 'USER';
    const now = new Date();
    
    sheet.appendRow([
        userId,
        normalizedUsername,
        hash,
        displayName.trim(),
        safeRole,
        'ACTIVE',
        now,
        now
    ]);
    
    logActivity(adminId || 'system', 'USER_CREATED', 'Created user account: ' + normalizedUsername + ' (' + safeRole + ')');

    return sendResponse(true, 'User created successfully.', {
        id: userId,
        username: normalizedUsername,
        displayName: displayName.trim(),
        role: safeRole,
        status: 'ACTIVE'
    });
}

function getUsers() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    if (!sheet) return sendResponse(false, 'Users table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    const users = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0]) {
            users.push({
                id: row[0],
                username: row[1],
                displayName: row[3],
                role: row[4],
                status: row[5],
                createdAt: row[6],
                updatedAt: row[7]
            });
        }
    }
    
    return sendResponse(true, 'Users retrieved', users);
}

function updateUser(userId, updates, adminId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    if (!sheet) return sendResponse(false, 'Users table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
            if (updates.displayName !== undefined && updates.displayName.trim() !== '') {
                sheet.getRange(i + 1, 4).setValue(updates.displayName.trim());
            }
            if (updates.password && String(updates.password).length >= 6) {
                sheet.getRange(i + 1, 3).setValue(bytesToString(hashPassword(updates.password)));
            }
            if (updates.role && ['ADMIN', 'USER'].indexOf(updates.role) !== -1) {
                sheet.getRange(i + 1, 5).setValue(updates.role);
            }
            if (updates.status && ['ACTIVE', 'DISABLED'].indexOf(updates.status) !== -1) {
                sheet.getRange(i + 1, 6).setValue(updates.status);
            }
            sheet.getRange(i + 1, 8).setValue(new Date());

            logActivity(adminId || 'system', 'USER_UPDATED', 'Updated user: ' + data[i][1]);
            return sendResponse(true, 'User updated successfully.', null);
        }
    }
    
    return sendResponse(false, 'User not found.', null, 404);
}

function deleteUser(userId, adminId) {
    // We soft-disable the user rather than hard deleting rows to protect progress/quiz history
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    if (!sheet) return sendResponse(false, 'Users table not found.', null, 500);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
            sheet.getRange(i + 1, 6).setValue('DISABLED');
            sheet.getRange(i + 1, 8).setValue(new Date());

            logActivity(adminId || 'system', 'USER_DISABLED', 'Disabled user account: ' + data[i][1]);
            return sendResponse(true, 'User account disabled.', null);
        }
    }
    
    return sendResponse(false, 'User not found.', null, 404);
}
