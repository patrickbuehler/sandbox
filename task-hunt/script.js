/**
 * Task Hunt - Gamified To-Do List
 * A Duck Hunt inspired task management application
 */

class TaskHunt {
    constructor() {
        // Task management
        this.tasks = JSON.parse(localStorage.getItem('taskHuntTasks')) || [];
        this.currentFilter = 'all';
        this.nextTaskId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
        
        // Animation system
        this.flyingDucks = new Map(); // taskId -> duck element and properties
        this.animationId = null;
        this.isAnimating = false;
        
        // Game area dimensions (updated on resize)
        this.gameArea = document.getElementById('game-area');
        this.sky = document.getElementById('sky');
        this.updateGameDimensions();
        
        // DOM elements
        this.taskInput = document.getElementById('task-input');
        this.addButton = document.getElementById('add-task-btn');
        this.taskList = document.getElementById('task-list');
        this.emptyState = document.getElementById('empty-state');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.activeCount = document.getElementById('active-count');
        this.completedCount = document.getElementById('completed-count');
        this.crosshair = document.getElementById('crosshair');
        this.shotOverlay = document.getElementById('shot-overlay');
        
        // Initialize the application
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderTaskList();
        this.updateCounts();
        this.startAnimation();
        
        // Focus input on load
        this.taskInput.focus();
    }
    
    bindEvents() {
        // Task input and submission
        this.addButton.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
        
        // Window resize handler for responsive game area
        window.addEventListener('resize', () => {
            this.updateGameDimensions();
        });
        
        // Crosshair tracking
        this.gameArea.addEventListener('mousemove', (e) => this.updateCrosshair(e));
        this.gameArea.addEventListener('mouseleave', () => {
            this.crosshair.style.opacity = '0';
        });
    }
    
    updateGameDimensions() {
        const rect = this.sky.getBoundingClientRect();
        this.gameWidth = rect.width;
        this.gameHeight = rect.height;
    }
    
    updateCrosshair(e) {
        const rect = this.gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.crosshair.style.left = (x - 15) + 'px';
        this.crosshair.style.top = (y - 15) + 'px';
        this.crosshair.style.opacity = '1';
    }
    
    // =================
    // TASK MANAGEMENT
    // =================
    
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;
        
        const task = {
            id: this.nextTaskId++,
            text: text,
            completed: false,
            createdAt: Date.now()
        };
        
        this.tasks.push(task);
        this.saveTasks();
        this.renderTaskList();
        this.updateCounts();
        this.taskInput.value = '';
        this.taskInput.focus();
        
        // Create flying duck for new active task
        if (!task.completed) {
            this.createFlyingDuck(task);
        }
    }
    
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newText = prompt('Edit task:', task.text);
        if (newText === null || newText.trim() === '') return;
        
        task.text = newText.trim();
        this.saveTasks();
        this.renderTaskList();
        
        // Update flying duck text if it exists
        if (this.flyingDucks.has(taskId)) {
            const duckData = this.flyingDucks.get(taskId);
            const textSpan = duckData.element.querySelector('.duck-text');
            if (textSpan) {
                textSpan.textContent = task.text;
            }
        }
    }
    
    deleteTask(taskId) {
        if (!confirm('Delete this task?')) return;
        
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveTasks();
        this.renderTaskList();
        this.updateCounts();
        
        // Remove flying duck if it exists
        this.removeFlyingDuck(taskId);
    }
    
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        this.saveTasks();
        this.renderTaskList();
        this.updateCounts();
        
        if (task.completed) {
            // Remove from flying ducks when completed via list
            this.removeFlyingDuck(taskId);
        } else {
            // Add to flying ducks when reactivated
            this.createFlyingDuck(task);
        }
    }
    
    // Task hit by clicking flying duck
    huntTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;
        
        // Mark as completed
        task.completed = true;
        this.saveTasks();
        this.updateCounts();
        
        // Show shot effect
        this.showShotEffect();
        
        // Animate duck being shot and remove it
        if (this.flyingDucks.has(taskId)) {
            const duckData = this.flyingDucks.get(taskId);
            duckData.element.classList.add('shot');
            
            // Remove after animation
            setTimeout(() => {
                this.removeFlyingDuck(taskId);
                this.renderTaskList(); // Update the list to show completion
            }, 800);
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTaskList();
    }
    
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }
    
    renderTaskList() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.style.display = 'none';
            this.emptyState.classList.remove('hidden');
        } else {
            this.taskList.style.display = 'block';
            this.emptyState.classList.add('hidden');
        }
        
        this.taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-controls">
                    <button class="task-btn edit-btn" onclick="taskHunt.editTask(${task.id})" title="Edit">✎</button>
                    <button class="task-btn toggle-btn" onclick="taskHunt.toggleTask(${task.id})" title="${task.completed ? 'Reactivate' : 'Complete'}">
                        ${task.completed ? '↶' : '✓'}
                    </button>
                    <button class="task-btn delete-btn" onclick="taskHunt.deleteTask(${task.id})" title="Delete">✕</button>
                </div>
            </li>
        `).join('');
    }
    
    updateCounts() {
        const activeTasks = this.tasks.filter(t => !t.completed);
        const completedTasks = this.tasks.filter(t => t.completed);
        
        this.activeCount.textContent = activeTasks.length;
        this.completedCount.textContent = completedTasks.length;
    }
    
    saveTasks() {
        localStorage.setItem('taskHuntTasks', JSON.stringify(this.tasks));
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ==================
    // ANIMATION SYSTEM
    // ==================
    
    createFlyingDuck(task) {
        if (this.flyingDucks.has(task.id)) return; // Already exists
        
        const duck = document.createElement('div');
        duck.className = 'task-duck';
        duck.innerHTML = `<span class="duck-text">${this.escapeHtml(task.text)}</span>`;
        
        // Random starting position and velocity
        const duckData = {
            element: duck,
            x: Math.random() * (this.gameWidth - 200),
            y: Math.random() * (this.gameHeight - 100),
            vx: (Math.random() - 0.5) * 4, // Velocity X (-2 to 2)
            vy: (Math.random() - 0.5) * 4, // Velocity Y (-2 to 2)
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 2
        };
        
        // Ensure minimum speed
        if (Math.abs(duckData.vx) < 1) duckData.vx = duckData.vx > 0 ? 1 : -1;
        if (Math.abs(duckData.vy) < 1) duckData.vy = duckData.vy > 0 ? 1 : -1;
        
        // Click handler for "hunting" the duck
        duck.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.huntTask(task.id);
        });
        
        this.sky.appendChild(duck);
        this.flyingDucks.set(task.id, duckData);
        
        // Set initial position
        this.updateDuckPosition(duckData);
    }
    
    removeFlyingDuck(taskId) {
        if (!this.flyingDucks.has(taskId)) return;
        
        const duckData = this.flyingDucks.get(taskId);
        if (duckData.element.parentNode) {
            duckData.element.parentNode.removeChild(duckData.element);
        }
        this.flyingDucks.delete(taskId);
    }
    
    updateDuckPosition(duckData) {
        const { element, x, y, rotation } = duckData;
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.transform = `rotate(${rotation}deg)`;
    }
    
    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.animate();
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isAnimating = false;
    }
    
    animate() {
        // Update game dimensions in case of resize
        this.updateGameDimensions();
        
        // Update each flying duck
        this.flyingDucks.forEach((duckData, taskId) => {
            this.updateDuck(duckData);
        });
        
        // Continue animation loop
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateDuck(duckData) {
        const { element } = duckData;
        const duckWidth = element.offsetWidth || 120;
        const duckHeight = element.offsetHeight || 40;
        
        // Update position
        duckData.x += duckData.vx;
        duckData.y += duckData.vy;
        
        // Bounce off walls
        if (duckData.x <= 0 || duckData.x >= this.gameWidth - duckWidth) {
            duckData.vx = -duckData.vx;
            duckData.x = Math.max(0, Math.min(this.gameWidth - duckWidth, duckData.x));
        }
        
        if (duckData.y <= 0 || duckData.y >= this.gameHeight - duckHeight) {
            duckData.vy = -duckData.vy;
            duckData.y = Math.max(0, Math.min(this.gameHeight - duckHeight, duckData.y));
        }
        
        // Update rotation
        duckData.rotation += duckData.rotationSpeed;
        
        // Apply position
        this.updateDuckPosition(duckData);
    }
    
    showShotEffect() {
        this.shotOverlay.classList.remove('hidden');
        setTimeout(() => {
            this.shotOverlay.classList.add('hidden');
        }, 500);
    }
    
    // =================
    // INITIALIZATION
    // =================
    
    // Create flying ducks for all active tasks on startup
    initializeFlyingDucks() {
        const activeTasks = this.tasks.filter(t => !t.completed);
        activeTasks.forEach(task => {
            this.createFlyingDuck(task);
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.taskHunt = new TaskHunt();
    
    // Initialize flying ducks for existing active tasks
    setTimeout(() => {
        taskHunt.initializeFlyingDucks();
    }, 100); // Small delay to ensure DOM is fully rendered
});

// Handle page visibility changes to pause/resume animation
document.addEventListener('visibilitychange', () => {
    if (window.taskHunt) {
        if (document.hidden) {
            taskHunt.stopAnimation();
        } else {
            taskHunt.startAnimation();
        }
    }
});