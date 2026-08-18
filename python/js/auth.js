/* Authentication Logic & Route Protection */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const logoutBtns = document.querySelectorAll('#logoutBtn, #adminLogout, .logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });
});

async function handleLogin(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('errorMessage');
    const loadingDiv = document.getElementById('loadingMessage');
    const submitBtn = document.getElementById('loginSubmitBtn') || document.querySelector('button[type="submit"]');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!username || !password) {
        if (errorDiv) {
            errorDiv.textContent = t('login_button');
            errorDiv.classList.add('show');
        }
        return;
    }

    // Clear previous error
    if (errorDiv) {
        errorDiv.classList.remove('show');
        errorDiv.textContent = '';
    }

    if (loadingDiv) loadingDiv.style.display = 'block';
    if (submitBtn) submitBtn.disabled = true;

    try {
        const response = await APIClient.login(username, password);

        if (response && response.success && response.data) {
            SessionManager.setSession(response.data);

            // Redirect based on user role
            if (response.data.role === 'ADMIN') {
                window.location.href = getAdminPath();
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            throw new Error(response ? (response.error || response.message) : 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        if (errorDiv) {
            errorDiv.textContent = handleAPIError(error);
            errorDiv.classList.add('show');
        }
    } finally {
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
    }
}

function handleLogout(e) {
    if (e) e.preventDefault();
    SessionManager.clearSession();
    window.location.href = getRootPath() + 'login.html';
}

// Route Guard: Ensures the user is logged in
function requireAuth() {
    if (!SessionManager.isAuthenticated()) {
        window.location.href = getRootPath() + 'login.html';
    }
}

// Route Guard: Ensures the user is an administrator
function requireAdmin() {
    const user = SessionManager.getCurrentUser();
    if (!user || user.role !== 'ADMIN' || user.status === 'DISABLED') {
        window.location.href = user ? getRootPath() + 'dashboard.html' : getRootPath() + 'login.html';
    }
}

// If already authenticated and visiting login page, auto-redirect to appropriate area
function redirectIfAuthenticated() {
    if (SessionManager.isAuthenticated()) {
        const user = SessionManager.getCurrentUser();
        if (user.role === 'ADMIN') {
            window.location.href = getAdminPath();
        } else {
            window.location.href = 'dashboard.html';
        }
    }
}

function getRootPath() {
    return window.location.pathname.includes('/admin/') ? '../' : '';
}

function getAdminPath() {
    return window.location.pathname.includes('/admin/') ? 'index.html' : 'admin/index.html';
}
