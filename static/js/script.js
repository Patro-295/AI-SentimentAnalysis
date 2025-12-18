document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Results Elements
    const placeholderState = document.getElementById('placeholder-state');
    const resultsContent = document.getElementById('results-content');
    const sentimentBadge = document.getElementById('sentiment-badge');
    const sentimentIcon = document.getElementById('sentiment-icon-main');
    const sentimentLabel = document.getElementById('sentiment-label-main');
    
    // Gauge Elements
    const gaugeFill = document.getElementById('gauge-fill');
    const polarityDisplay = document.getElementById('polarity-display');
    
    // Metric Elements
    const subjectivityValue = document.getElementById('subjectivity-value');
    const subjectivityFill = document.getElementById('subjectivity-fill');
    const confidenceValue = document.getElementById('confidence-value');
    const confidenceFill = document.getElementById('confidence-fill');
    
    // History Elements
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    // --- Theme Management ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    }
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    themeToggle.addEventListener('click', toggleTheme);
    initTheme();

    // --- Input Handling ---
    textInput.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;
        
        if (length > 900) {
            charCount.style.color = 'var(--danger)';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    });

    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        textInput.dispatchEvent(new Event('input'));
        textInput.focus();
        resetUI();
    });

    // --- Sample Chips ---
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', function() {
            textInput.value = this.getAttribute('data-text');
            textInput.dispatchEvent(new Event('input'));
            analyzeSentiment();
        });
    });

    // --- Analysis Logic ---
    analyzeBtn.addEventListener('click', analyzeSentiment);
    
    textInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            analyzeSentiment();
        }
    });

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

    function displayResults(data) {
        // Switch view
        placeholderState.classList.add('hidden');
        resultsContent.classList.remove('hidden');

        // 1. Update Badge
        const { sentiment, polarity, subjectivity, confidence } = data;
        
        // Reset classes
        sentimentBadge.className = 'sentiment-badge';
        sentimentBadge.classList.add(sentiment); // adds .positive, .negative, etc. if CSS supports it
        
        // Update Icon & Text
        if (sentiment === 'positive') {
            sentimentIcon.className = 'fas fa-smile';
            sentimentBadge.style.color = 'var(--success)';
            sentimentBadge.style.background = 'rgba(16, 185, 129, 0.1)';
        } else if (sentiment === 'negative') {
            sentimentIcon.className = 'fas fa-frown';
            sentimentBadge.style.color = 'var(--danger)';
            sentimentBadge.style.background = 'rgba(239, 68, 68, 0.1)';
        } else {
            sentimentIcon.className = 'fas fa-meh';
            sentimentBadge.style.color = 'var(--neutral)';
            sentimentBadge.style.background = 'rgba(107, 114, 128, 0.1)';
        }
        sentimentLabel.textContent = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);

        // 2. Update Gauge
        // Polarity is -1 to 1. Map to 0 to 180 degrees.
        // -1 -> 0deg, 0 -> 90deg, 1 -> 180deg
        const rotation = ((polarity + 1) / 2) * 180;
        gaugeFill.style.transform = `rotate(${rotation}deg)`;
        
        // Color the gauge based on value
        if (polarity > 0.1) gaugeFill.style.backgroundColor = 'var(--success)';
        else if (polarity < -0.1) gaugeFill.style.backgroundColor = 'var(--danger)';
        else gaugeFill.style.backgroundColor = 'var(--neutral)';
        
        polarityDisplay.textContent = polarity >= 0 ? `+${polarity}` : polarity;

        // 3. Update Metrics
        subjectivityValue.textContent = subjectivity.toFixed(2);
        subjectivityFill.style.width = `${subjectivity * 100}%`;
        
        confidenceValue.textContent = `${confidence}%`;
        confidenceFill.style.width = `${confidence}%`;
        
        // Celebrate if high confidence
        if (confidence > 85) runConfetti();
    }

    function resetUI() {
        placeholderState.classList.remove('hidden');
        resultsContent.classList.add('hidden');
    }

    // --- History Management ---
    let history = JSON.parse(localStorage.getItem('sentimentHistory') || '[]');
    renderHistory();

    function addToHistory(text, data) {
        const item = {
            text,
            sentiment: data.sentiment,
            timestamp: new Date().toISOString()
        };
        
        // Add to beginning, keep max 10
        history.unshift(item);
        if (history.length > 10) history.pop();
        
        localStorage.setItem('sentimentHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem; text-align:center;">No recent analysis</p>';
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-text">${escapeHtml(item.text)}</div>
                <div class="history-badge ${item.sentiment}">${item.sentiment}</div>
            `;
            
            div.addEventListener('click', () => {
                textInput.value = item.text;
                textInput.dispatchEvent(new Event('input'));
                analyzeSentiment();
            });
            
            historyList.appendChild(div);
        });
    }

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        localStorage.removeItem('sentimentHistory');
        renderHistory();
    });

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
        for(let i=0; i<30; i++) {
            const p = document.createElement('div');
            p.style.cssText = `
                position: fixed;
                top: 50%; left: 50%;
                width: 8px; height: 8px;
                background: ${['#f00','#0f0','#00f'][Math.floor(Math.random()*3)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
            `;
            document.body.appendChild(p);
            
            const angle = Math.random() * Math.PI * 2;
            const vel = Math.random() * 200 + 100;
            
            p.animate([
                { transform: 'translate(0,0)', opacity: 1 },
                { transform: `translate(${Math.cos(angle)*vel}px, ${Math.sin(angle)*vel}px)`, opacity: 0 }
            ], {
                duration: 1000,
                easing: 'ease-out'
            }).onfinish = () => p.remove();
        }
    }
});