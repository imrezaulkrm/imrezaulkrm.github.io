/* Global Application Initializer & Helpers */

document.addEventListener('DOMContentLoaded', () => {
    // Check if session exists and update global navigation UI if applicable
    const currentUser = SessionManager.getCurrentUser();
    
    // Log platform status for developers
    console.log(`%c🐍 My Python Journey Initialized`, 'color: #3b82f6; font-weight: bold; font-size: 14px;');
    console.log(`Backend Mode: ${APIClient.isLive() ? 'Live Google Apps Script Web App' : 'Local In-Memory / Preview Mode'}`);
    
    if (currentUser) {
        console.log(`Logged in as: ${currentUser.username} (${currentUser.role})`);
    }
});

// Toast notification helper
function showToast(message, type = 'info', duration = 2500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background: var(--bg-tertiary, #171D25);
        color: var(--text-primary, #E9EDF2);
        border: 1px solid var(--border-color, rgba(255,255,255,0.1));
        border-left: 4px solid ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        padding: 12px 18px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        font-size: 14px;
        pointer-events: auto;
        animation: fadeIn 0.2s ease-out;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.2s ease-in';
        setTimeout(() => toast.remove(), 200);
    }, duration);
}
