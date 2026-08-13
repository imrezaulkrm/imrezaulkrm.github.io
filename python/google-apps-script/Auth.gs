// Google Apps Script - Authentication Functions

function login(username, password) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const user = {
            id: row[0],
            username: row[1],
            password_hash: row[2],
            display_name: row[3],
            role: row[4],
            status: row[5]
        };
        
        if (user.username === username && user.status === 'ACTIVE') {
            const hash = bytesToString(hashPassword(password));
            if (user.password_hash === hash) {
                // Generate token
                const token = Utilities.getUuid();
                
                return sendResponse(true, 'Login successful', {
                    id: user.id,
                    username: user.username,
                    displayName: user.display_name,
                    role: user.role,
                    token: token
                });
            }
        }
    }
    
    return sendResponse(false, 'Invalid credentials', null, 401);
}

function getUser(userId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] === userId) {
            return sendResponse(true, 'User found', {
                id: row[0],
                username: row[1],
                displayName: row[3],
                role: row[4],
                status: row[5]
            });
        }
    }
    
    return sendResponse(false, 'User not found', null, 404);
}

function updatePassword(userId, newPassword) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
            const hash = bytesToString(hashPassword(newPassword));
            sheet.getRange(i + 1, 3).setValue(hash); // Column C is password_hash
            return sendResponse(true, 'Password updated', null);
        }
    }
    
    return sendResponse(false, 'User not found', null, 404);
}

function createUser(username, displayName, password, role = 'USER') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const userId = Utilities.getUuid();
    const hash = bytesToString(hashPassword(password));
    
    sheet.appendRow([
        userId,
        username,
        hash,
        displayName,
        role,
        'ACTIVE',
        new Date(),
        new Date()
    ]);
    
    return sendResponse(true, 'User created', { id: userId });
}

function getUsers() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const data = sheet.getDataRange().getValues();
    const users = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        users.push({
            id: row[0],
            username: row[1],
            displayName: row[3],
            role: row[4],
            status: row[5]
        });
    }
    
    return sendResponse(true, 'Users retrieved', users);
}

function updateUser(userId, updates) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
            if (updates.displayName) sheet.getRange(i + 1, 4).setValue(updates.displayName);
            if (updates.status) sheet.getRange(i + 1, 6).setValue(updates.status);
            sheet.getRange(i + 1, 8).setValue(new Date());
            return sendResponse(true, 'User updated', null);
        }
    }
    
    return sendResponse(false, 'User not found', null, 404);
}

function deleteUser(userId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('users');
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === userId) {
            sheet.deleteRow(i + 1);
            return sendResponse(true, 'User deleted', null);
        }
    }
    
    return sendResponse(false, 'User not found', null, 404);
}
