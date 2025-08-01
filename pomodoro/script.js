class PomodoroTimer {
    constructor() {
        // Timer state
        this.isRunning = false;
        this.currentMode = 'work';
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.sessionCount = 0;
        this.timer = null;
        
        // Settings
        this.settings = {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            soundEnabled: true
        };
        
        // DOM elements
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startPauseBtn = document.getElementById('start-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.sessionCountDisplay = document.getElementById('session-count');
        this.currentModeDisplay = document.getElementById('current-mode');
        this.progressRing = document.querySelector('.progress-ring-progress');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsPanel = document.getElementById('settings-panel');
        this.container = document.querySelector('.container');
        
        // Initialize
        this.loadSettings();
        this.initializeEventListeners();
        this.updateDisplay();
        this.updateProgress();
        
        // Request notification permission
        this.requestNotificationPermission();
    }
    
    initializeEventListeners() {
        // Start/pause button
        this.startPauseBtn.addEventListener('click', () => {
            if (this.isRunning) {
                this.pauseTimer();
            } else {
                this.startTimer();
            }
        });
        
        // Reset button
        this.resetBtn.addEventListener('click', () => {
            this.resetTimer();
        });
        
        // Mode buttons
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isRunning) {
                    this.playButtonSound();
                    this.switchMode(e.target.dataset.mode);
                }
            });
        });
        
        // Settings
        this.settingsBtn.addEventListener('click', () => {
            this.toggleSettings();
        });
        
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });
        
        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.settingsPanel.contains(e.target) && !this.settingsBtn.contains(e.target)) {
                this.settingsPanel.classList.add('hidden');
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isRunning) {
                    this.pauseTimer();
                } else {
                    this.startTimer();
                }
            } else if (e.code === 'KeyR') {
                this.resetTimer();
            }
        });
    }
    
    startTimer() {
        this.isRunning = true;
        this.startPauseBtn.innerHTML = '<span class="btn-text">Pause</span>';
        this.container.classList.add('timer-running');
        this.playButtonSound();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgress();
            
            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isRunning = false;
        this.startPauseBtn.innerHTML = '<span class="btn-text">Start</span>';
        this.container.classList.remove('timer-running');
        this.playButtonSound();
        clearInterval(this.timer);
    }
    
    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.updateProgress();
        this.playButtonSound();
    }
    
    completeSession() {
        this.pauseTimer();
        
        if (this.currentMode === 'work') {
            this.sessionCount++;
            this.sessionCountDisplay.textContent = this.sessionCount;
            
            // Determine next break type
            if (this.sessionCount % 4 === 0) {
                this.switchMode('long-break');
            } else {
                this.switchMode('short-break');
            }
        } else {
            this.switchMode('work');
        }
        
        this.showNotification();
        this.playSound();
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        this.updateModeButtons();
        
        // Set duration based on mode
        switch (mode) {
            case 'work':
                this.timeLeft = this.settings.workDuration * 60;
                this.totalTime = this.settings.workDuration * 60;
                this.currentModeDisplay.textContent = 'Work Session';
                this.container.classList.remove('break-mode');
                break;
            case 'short-break':
                this.timeLeft = this.settings.shortBreakDuration * 60;
                this.totalTime = this.settings.shortBreakDuration * 60;
                this.currentModeDisplay.textContent = 'Short Break';
                this.container.classList.add('break-mode');
                break;
            case 'long-break':
                this.timeLeft = this.settings.longBreakDuration * 60;
                this.totalTime = this.settings.longBreakDuration * 60;
                this.currentModeDisplay.textContent = 'Long Break';
                this.container.classList.add('break-mode');
                break;
        }
        
        this.updateDisplay();
        this.updateProgress();
    }
    
    updateModeButtons() {
        this.modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === this.currentMode) {
                btn.classList.add('active');
            }
        });
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
        
        // Update document title
        document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - ${this.currentModeDisplay.textContent}`;
    }
    
    updateProgress() {
        const circumference = 2 * Math.PI * 140; // radius = 140
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const offset = circumference - (progress * circumference);
        
        this.progressRing.style.strokeDashoffset = offset;
    }
    
    showNotification() {
        if (Notification.permission === 'granted') {
            const title = this.currentMode === 'work' ? 'Work Session Complete!' : 'Break Time Over!';
            const body = this.currentMode === 'work' 
                ? 'Time for a break! You\'ve completed a pomodoro session.'
                : 'Break time is over. Ready to get back to work?';
            
            new Notification(title, {
                body: body,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
            });
        }
    }
    
    playSound() {
        if (this.settings.soundEnabled) {
            this.playRetroArcadeSound();
        }
    }
    
    playRetroArcadeSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 0.8;
        
        // Create multiple oscillators for a richer arcade sound
        const createBeep = (frequency, startTime, beepDuration, volume = 0.1) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'square'; // Classic arcade square wave
            oscillator.frequency.setValueAtTime(frequency, startTime);
            
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + beepDuration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + beepDuration);
        };
        
        const now = audioContext.currentTime;
        
        if (this.currentMode === 'work') {
            // Work session complete - triumphant arcade sound
            createBeep(523, now, 0.15, 0.15); // C5
            createBeep(659, now + 0.1, 0.15, 0.15); // E5
            createBeep(784, now + 0.2, 0.15, 0.15); // G5
            createBeep(1047, now + 0.3, 0.4, 0.2); // C6 - longer final note
        } else {
            // Break over - gentle reminder sound
            createBeep(440, now, 0.2, 0.12); // A4
            createBeep(554, now + 0.15, 0.2, 0.12); // C#5
            createBeep(659, now + 0.3, 0.3, 0.15); // E5
        }
    }
    
    playButtonSound() {
        if (this.settings.soundEnabled) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    }
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    toggleSettings() {
        this.settingsPanel.classList.toggle('hidden');
        
        if (!this.settingsPanel.classList.contains('hidden')) {
            // Populate current settings
            document.getElementById('work-duration').value = this.settings.workDuration;
            document.getElementById('short-break-duration').value = this.settings.shortBreakDuration;
            document.getElementById('long-break-duration').value = this.settings.longBreakDuration;
            document.getElementById('sound-enabled').checked = this.settings.soundEnabled;
        }
    }
    
    saveSettings() {
        this.settings.workDuration = parseInt(document.getElementById('work-duration').value);
        this.settings.shortBreakDuration = parseInt(document.getElementById('short-break-duration').value);
        this.settings.longBreakDuration = parseInt(document.getElementById('long-break-duration').value);
        this.settings.soundEnabled = document.getElementById('sound-enabled').checked;
        
        // Save to localStorage
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
        
        // Update current session if not running
        if (!this.isRunning) {
            this.switchMode(this.currentMode);
        }
        
        this.settingsPanel.classList.add('hidden');
        
        // Show success feedback
        const saveBtn = document.getElementById('save-settings');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="btn-text">Saved!</span>';
        saveBtn.style.background = '#48bb78';
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = '';
        }, 1500);
    }
    
    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});

// Service Worker registration for better PWA experience
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Silently fail if no service worker is available
        });
    });
} 