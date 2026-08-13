/* Authentication Logic */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const logoutBtns = document.querySelectorAll('#logoutBtn, #adminLogout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });
});

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    const loadingDiv = document.getElementById('loadingMessage');

    // Clear previous messages
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';

    try {
        loadingDiv.style.display = 'block';

        const response = await APIClient.login(username, password);

        if (response.success) {
            // Store session
            SessionManager.setSession(response.user);

            // Redirect to appropriate dashboard
            if (response.user.role === 'ADMIN') {
                window.location.href = 'admin/index.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            throw new Error(response.error || 'Login failed');
        }
    } catch (error) {
        errorDiv.textContent = 'Invalid username or password.';
        errorDiv.classList.add('show');
        loadingDiv.style.display = 'none';
    }
}

function handleLogout(e) {
    e.preventDefault();
    SessionManager.clearSession();
    window.location.href = 'index.html';
}

// Check if user is authenticated
function requireAuth() {
    if (!SessionManager.isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// Check if user is admin
function requireAdmin() {
    const user = SessionManager.getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        window.location.href = '../dashboard.html';
    }
}
