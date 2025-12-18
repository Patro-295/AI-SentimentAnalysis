document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const charCount = null; // Removed from HTML to match image
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = null; // Removed from HTML to match image
    const themeToggle = document.getElementById('theme-toggle');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Results Elements
    const placeholderState = document.getElementById('placeholder-state');
    const resultsContent = document.getElementById('results-content');
    const sentimentBadge = document.getElementById('sentiment-badge');
    const sentimentIcon = document.getElementById('sentiment-icon-main');
    const sentimentLabel = document.getElementById('sentiment-label-main');

    // Gauge Elements
    const gaugeNeedle = document.getElementById('gauge-needle');
    const gaugeLabelText = document.getElementById('gauge-label-text');
    const polarityDisplay = document.getElementById('polarity-display');
    const confidenceDisplay = document.getElementById('confidence-display');

    // Metric Elements
    const subjectivityValue = document.getElementById('subjectivity-value');

    // History Elements
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    // --- Theme Management ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark as per image
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
    initTheme();

    // --- Input Handling ---
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            textInput.value = '';
            resetUI();
        });
    }

    async function analyzeSentiment() {
        const text = textInput.value.trim();

        if (!text) {
            showToast('Please enter some text first', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (data.error) {
                showToast(data.error, 'error');
            } else {
                displayResults(data);
                addToHistory(text, data);
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Failed to connect to server', 'error');
        } finally {
            setLoading(false);
        }
    }

    analyzeBtn.addEventListener('click', analyzeSentiment);

    textInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            analyzeSentiment();
        }
    });

    function displayResults(data) {
        // Switch view
        placeholderState.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        const { sentiment, polarity, subjectivity, confidence } = data;

        // 1. Update Badge/Status Text
        const sentimentUpper = sentiment.toUpperCase();
        gaugeLabelText.textContent = sentimentUpper;

        // Update Label Color
        if (sentiment === 'positive') gaugeLabelText.style.color = '#10b981';
        else if (sentiment === 'negative') gaugeLabelText.style.color = '#ef4444';
        else gaugeLabelText.style.color = '#a1a1aa';

        // 2. Update Gauge Needle
        // Polarity -1 to 1 maps to -180deg to 0deg
        const rotation = ((polarity + 1) * 90) - 180;
        gaugeNeedle.style.transform = `rotate(${rotation}deg)`;

        polarityDisplay.textContent = polarity >= 0 ? `+${polarity}` : polarity;

        // 3. Update Metrics
        subjectivityValue.textContent = subjectivity.toFixed(2);

        const subLabel = subjectivity > 0.5 ? '(Subjective)' : '(Objective)';
        const subSpan = document.getElementById('subjectivity-label');
        if (subSpan) subSpan.textContent = subLabel;

        confidenceDisplay.textContent = `Confidence: ${confidence.toFixed(0)}%`;

        // Celebrate
        if (confidence > 80 && sentiment === 'positive') runConfetti();
    }

    function resetUI() {
        placeholderState.classList.remove('hidden');
        resultsContent.classList.add('hidden');
    }

    // --- History Management ---
    let history = JSON.parse(localStorage.getItem('sentimentHistory') || '[]');

    function addToHistory(text, data) {
        const item = {
            text,
            sentiment: data.sentiment,
            timestamp: new Date().toISOString()
        };

        history.unshift(item);
        if (history.length > 10) history.pop();

        localStorage.setItem('sentimentHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        if (!historyList) return;
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p style="color:rgba(255,255,255,0.3); font-size:0.9rem; text-align:center;">No recent analysis</p>';
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-text">${escapeHtml(item.text)}</div>
                <div class="history-badge ${item.sentiment}">${item.sentiment.toUpperCase()}</div>
                <style>
                    .history-badge.positive { color: #10b981; }
                    .history-badge.negative { color: #ef4444; }
                    .history-badge.neutral { color: #a1a1aa; }
                </style>
            `;

            div.addEventListener('click', () => {
                textInput.value = item.text;
                analyzeSentiment();
            });

            historyList.appendChild(div);
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            history = [];
            localStorage.removeItem('sentimentHistory');
            renderHistory();
        });
    }

    renderHistory();

    // --- Utilities ---
    function setLoading(isLoading) {
        if (isLoading) {
            loadingOverlay.classList.remove('hidden');
            analyzeBtn.disabled = true;
        } else {
            loadingOverlay.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'error' ? 'var(--danger)' : 'var(--text-main)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 2000;
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-in';
            setTimeout(() => toast.remove(), 290);
        }, 3000);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function runConfetti() {
        // Simple confetti effect (reused/simplified logic)
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position: fixed;
                top: 50%; left: 50%;
                width: 8px; height: 8px;
                background: ${['#f00', '#0f0', '#00f'][Math.floor(Math.random() * 3)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
            `;
            document.body.appendChild(p);

            const angle = Math.random() * Math.PI * 2;
            const vel = Math.random() * 200 + 100;

            p.animate([
                { transform: 'translate(0,0)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * vel}px, ${Math.sin(angle) * vel}px)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => p.remove();
        }
    }
});