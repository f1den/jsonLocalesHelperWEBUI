// Textarea auto-resize functionality
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
}

function initAutoResizeTextareas() {
    const textareas = document.querySelectorAll('.translation-input');
    
    textareas.forEach(textarea => {
        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
        });
        
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                
                this.value = this.value.substring(0, start) + '\n' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 1;
                autoResizeTextarea(this);
            }
        });
        
        setTimeout(() => autoResizeTextarea(textarea), 0);
    });
}

// Copy functionality
function copyToTranslation(key, value, inputId) {
    const textarea = document.getElementById(inputId);
    textarea.value = value;
    textarea.focus();
    autoResizeTextarea(textarea);
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = originalText, 2000);
}

function copyToClipboard(event, text) {
    event.preventDefault();
    const btn = event.currentTarget;
    const originalText = btn.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            btn.textContent = 'Failed!';
            btn.classList.add('failed');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('failed');
            }, 2000);
        }
    });
}

// Translation suggestions functionality
async function getTranslationSuggestions(text, inputId, containerId) {
    const container = document.getElementById(containerId);
    container.style.display = 'block';
    container.innerHTML = `
        <div class="suggestions-header">
            <span>Translation Suggestions</span>
            <span class="close-suggestions" onclick="closeSuggestions('${containerId}', true)">×</span>
        </div>
        <div class="loading">Loading suggestions...</div>
    `;
    
    try {
        const response = await fetch('/get_translation_suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({text: text})
        });
        const data = await response.json();
        
        if (data.error) {
            container.innerHTML = `
                <div class="suggestions-header">
                    <span>Error getting translation suggestions</span>
                    <span class="close-suggestions" onclick="closeSuggestions('${containerId}', true)">×</span>
                </div>
                <div class="error-message">${data.error}</div>
            `;
            return;
        }
        
        let html = `
            <div class="suggestions-header">
                <span>Translation Suggestions</span>
                <span class="close-suggestions" onclick="closeSuggestions('${containerId}', true)">×</span>
            </div>
        `;
        
        if (data.yandex) {
            html += `<div class="suggestion" onclick="useSuggestion('${inputId}', '${escapeHtml(data.yandex)}')">
                        <span class="suggestion-source">Yandex:</span> ${data.yandex}
                    </div>`;
        }
        if (data.google) {
            html += `<div class="suggestion" onclick="useSuggestion('${inputId}', '${escapeHtml(data.google)}')">
                        <span class="suggestion-source">Google:</span> ${data.google}
                    </div>`;
        }
        if (data.deepl) {
            html += `<div class="suggestion" onclick="useSuggestion('${inputId}', ${escapeHtml(data.deepl)})">
                        <span class="suggestion-source">DeepL:</span> ${data.deepl}
                    </div>`;
        }
        if (data.ai_suggestion) {
            html += `<div class="suggestion" onclick="useSuggestion('${inputId}', ${escapeHtml(data.ai_suggestion)})">
                        <span class="suggestion-source">AI:</span> ${data.ai_suggestion}
                    </div>`;
        }
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `
            <div class="suggestions-header">
                <span>Error getting translation suggestions</span>
                <span class="close-suggestions" onclick="closeSuggestions('${containerId}', true)">×</span>
            </div>
            <div class="error-message">Error loading suggestions: ${error.message}</div>
        `;
    }
}

async function getAISuggestions(text, inputId, containerId) {
    const container = document.getElementById(containerId);
    container.style.display = 'block';
    container.innerHTML = `
        <div class="suggestions-header">
            <span>AI Translation Suggestions</span>
            <span class="close-suggestions" onclick="closeSuggestions('${containerId}', true)">×</span>
        </div>
        <div class="loading">Loading AI suggestions...</div>
    `;
    
    try {
        const response = await fetch('/get_ai_suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({text: text})
        });
        const data = await response.json();
        
        if (data.error) {
            container.innerHTML = `
                <div class="suggestions-header">
                    <span>Error getting AI suggestions</span>
                    <span class="close-suggestions" onclick="closeSuggestions('${containerId}', true)">×</span>
                </div>
                <div class="error-message">${data.error}</div>
            `;
            return;
        }
        
        let html = `
            <div class="suggestions-header">
                <span>AI Translation Suggestions</span>
                <span class="close-suggestions" onclick="closeSuggestions('${containerId}', true)">×</span>
            </div>
        `;
        
        if (data.suggestions?.length > 0) {
            data.suggestions.forEach((suggestion, index) => {
                html += `
                    <div class="ai-suggestion" onclick="useSuggestion('${inputId}', '${escapeHtml(suggestion)}')">
                        <span class="suggestion-number">${index + 1}.</span>
                        ${suggestion}
                    </div>
                `;
                
            });
        } else {
            html += `<div class="error-message">No AI suggestions available</div>`;
        }
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = `
            <div class="suggestions-header">
                <span>Error getting AI suggestions</span>
                <span class="close-suggestions" onclick="closeSuggestions('${containerId}', true)">×</span>
            </div>
            <div class="error-message">Error loading AI suggestions: ${error.message}</div>
        `;
    }
}

function closeSuggestions(containerId, clearContent = false) {
    const container = document.getElementById(containerId);
    container.style.display = 'none';
    if (clearContent) {
        container.innerHTML = '';
    }
}

function useSuggestion(inputId, suggestion) {
    const textarea = document.getElementById(inputId);
    textarea.dataset.programmaticChange = 'true';
    textarea.value = suggestion;
    textarea.focus();
    autoResizeTextarea(textarea);
    addToHistory(textarea);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Tab functionality
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    
    const tablinks = document.getElementsByClassName("tab");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");

    initAutoResizeTextareas();
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Translation saving functionality
function collectTranslations() {
    const translations = {};
    const textareas = document.querySelectorAll('.translation-input');
    
    textareas.forEach(textarea => {
        const key = textarea.id.replace('input-', '');
        const originalKey = document.querySelector(`#translation-${key} .key`).textContent;
        let value = textarea.value.trim();
        if (value.startsWith("[{")) {
            translations[originalKey] = eval(value);
            console.warn("EVALED")
        } else {
            translations[originalKey] = value;
        }
    });
    
    return translations;
}

async function saveAllTranslations() {
    const translations = collectTranslations();
    const statusMessage = document.getElementById('status-message');
    
    try {
        const response = await fetch('/save_translations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(translations)
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            statusMessage.textContent = `Successfully saved ${data.saved} translations`;
            statusMessage.className = 'status-message success-message';
        } else {
            statusMessage.textContent = 'Error: ' + (data.message || 'Unknown error');
            statusMessage.className = 'status-message error-message';
        }
        
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 3000);
    } catch (error) {
        statusMessage.textContent = 'Error: ' + error.message;
        statusMessage.className = 'status-message error-message';
    }
}

// Undo/Redo functionality
let changeHistory = {};
let currentHistoryIndex = {};

function initChangeTracking() {
    const textareas = document.querySelectorAll('.translation-input');
    textareas.forEach(textarea => {
        const id = textarea.id;
        changeHistory[id] = [textarea.value];
        currentHistoryIndex[id] = 0;
        
        textarea.addEventListener('input', function() {
            if (!this.dataset.programmaticChange) {
                addToHistory(this);
            }
            delete this.dataset.programmaticChange;
        });
    });
}

function addToHistory(textarea) {
    const id = textarea.id;
    const currentValue = textarea.value;
    
    if (changeHistory[id][currentHistoryIndex[id]] === currentValue) return;
    
    changeHistory[id] = changeHistory[id].slice(0, currentHistoryIndex[id] + 1);
    changeHistory[id].push(currentValue);
    currentHistoryIndex[id] = changeHistory[id].length - 1;
    
    updateUndoRedoButtons(id);
}

function updateUndoRedoButtons(inputId) {
    const undoBtn = document.querySelector(`#${inputId}`).closest('.key-item').querySelector('.undo-btn');
    const redoBtn = document.querySelector(`#${inputId}`).closest('.key-item').querySelector('.redo-btn');
    
    undoBtn.disabled = currentHistoryIndex[inputId] <= 0;
    redoBtn.disabled = currentHistoryIndex[inputId] >= changeHistory[inputId].length - 1;
}

function undoChange(inputId) {
    const textarea = document.getElementById(inputId);
    if (currentHistoryIndex[inputId] > 0) {
        currentHistoryIndex[inputId]--;
        textarea.dataset.programmaticChange = 'true';
        textarea.value = changeHistory[inputId][currentHistoryIndex[inputId]];
        autoResizeTextarea(textarea);
        updateUndoRedoButtons(inputId);
    }
}

function redoChange(inputId) {
    const textarea = document.getElementById(inputId);
    if (currentHistoryIndex[inputId] < changeHistory[inputId].length - 1) {
        currentHistoryIndex[inputId]++;
        textarea.dataset.programmaticChange = 'true';
        textarea.value = changeHistory[inputId][currentHistoryIndex[inputId]];
        autoResizeTextarea(textarea);
        updateUndoRedoButtons(inputId);
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
    // Save on Ctrl+S
    console.log("DEBUG")
    if (e.ctrlKey && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'ы')) {
        e.preventDefault();
        const translationTab = document.getElementById('translation');
        if (translationTab?.classList.contains('active')) {
            saveAllTranslations();
            showToast('Saving all translations...', 'info');
        }
    }
    
    // Undo on Ctrl+Z
    if (e.ctrlKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        const activeTextarea = document.activeElement;
        if (activeTextarea?.classList.contains('translation-input')) {
            undoChange(activeTextarea.id);
            showToast('Undo last change', 'info');
        }
    }
    
    // Redo on Ctrl+Y or Ctrl+Shift+Z
    if ((e.ctrlKey && e.key.toLowerCase() === 'y') || 
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        const activeTextarea = document.activeElement;
        if (activeTextarea?.classList.contains('translation-input')) {
            redoChange(activeTextarea.id);
            showToast('Redo last change', 'info');
        }
    }
});

// Settings functionality
function tabinitSettings() {
    // Theme switch
    const themeSwitch = document.getElementById('theme-switch');
    themeSwitch.addEventListener('change', function() {
        document.body.classList.toggle('dark-theme', this.checked);
        localStorage.setItem('darkTheme', this.checked);
    });
    
    // Load theme preference
    if (localStorage.getItem('darkTheme') === 'true') {
        themeSwitch.checked = true;
        document.body.classList.add('dark-theme');
    }
    
    // Custom preprompt switch
    const prepromptSwitch = document.getElementById('custom-preprompt-switch');
    const prepromptTextarea = document.getElementById('custom-preprompt');
    prepromptSwitch.addEventListener('change', function() {
        prepromptTextarea.disabled = !this.checked;
    });
    
    // Proxy switch
    const proxySwitch = document.getElementById('yandex-proxy-switch');
    const proxySettings = document.querySelector('.proxy-settings');
    proxySwitch.addEventListener('change', function() {
        proxySettings.style.display = this.checked ? 'block' : 'none';
    });
    
    // Load saved settings
    tabloadSettings();
}

function tabloadSettings() {
    // This would load from localStorage or server in a real app
    console.log('Loading settings...');
}

function tabsaveSettings() {
    const settings = {
        darkTheme: document.getElementById('theme-switch').checked,
        customPreprompt: {
            enabled: document.getElementById('custom-preprompt-switch').checked,
            text: document.getElementById('custom-preprompt').value
        },
        deepseekApiKey: document.getElementById('deepseek-api-key').value,
        yandex: {
            apiType: document.getElementById('yandex-api-type').value,
            proxy: {
                enabled: document.getElementById('yandex-proxy-switch').checked,
                type: document.getElementById('proxy-type').value,
                address: document.getElementById('proxy-address').value
            }
        }
    };
    
    // In a real app, this would save to localStorage or server
    console.log('Saving settings:', settings);
    
    const status = document.getElementById('settings-status');
    status.textContent = 'Settings saved!';
    status.className = 'status-message success-message';
    
    setTimeout(() => {
        status.textContent = '';
        status.className = 'status-message';
    }, 3000);
}

function tabresetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        // Reset all settings to default values
        document.getElementById('theme-switch').checked = false;
        document.body.classList.remove('dark-theme');
        
        document.getElementById('custom-preprompt-switch').checked = false;
        document.getElementById('custom-preprompt').value = '';
        document.getElementById('custom-preprompt').disabled = true;
        
        document.getElementById('deepseek-api-key').value = '';
        
        document.getElementById('yandex-api-type').value = 'web';
        document.getElementById('yandex-proxy-switch').checked = false;
        document.querySelector('.proxy-settings').style.display = 'none';
        document.getElementById('proxy-type').value = 'http';
        document.getElementById('proxy-address').value = '';
        
        const status = document.getElementById('settings-status');
        status.textContent = 'Settings reset to defaults!';
        status.className = 'status-message success-message';
        
        setTimeout(() => {
            status.textContent = '';
            status.className = 'status-message';
        }, 3000);
    }
}

// Initialize when page is fully loaded
window.addEventListener('load', function() {
    initAutoResizeTextareas();
    initChangeTracking();
    tabinitSettings();
});