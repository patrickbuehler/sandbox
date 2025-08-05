// Todo List Application
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    // Initialize DOM elements
    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.todoList = document.getElementById('todoList');
        this.todoCount = document.getElementById('todoCount');
        this.emptyState = document.getElementById('emptyState');
        this.bulkActions = document.getElementById('bulkActions');
        this.addTodoForm = document.getElementById('addTodoForm');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.clearAllBtn = document.getElementById('clearAll');
    }

    // Bind event listeners
    bindEvents() {
        // Form submission
        this.addTodoForm.addEventListener('submit', (e) => this.handleAddTodo(e));
        
        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        
        // Bulk actions
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        
        // Todo list delegation
        this.todoList.addEventListener('click', (e) => this.handleTodoClick(e));
        this.todoList.addEventListener('keypress', (e) => this.handleTodoKeypress(e));
        this.todoList.addEventListener('blur', (e) => this.handleTodoBlur(e), true);
    }

    // Handle adding new todo
    handleAddTodo(e) {
        e.preventDefault();
        const text = this.todoInput.value.trim();
        
        if (text) {
            this.addTodo(text);
            this.todoInput.value = '';
        }
    }

    // Handle filter change
    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;
        
        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.render();
    }

    // Handle todo interactions
    handleTodoClick(e) {
        const todoItem = e.target.closest('.todo-item');
        if (!todoItem) return;
        
        const id = parseInt(todoItem.dataset.id);
        
        if (e.target.classList.contains('todo-checkbox')) {
            this.toggleTodo(id);
        } else if (e.target.classList.contains('edit-btn')) {
            this.startEditing(id);
        } else if (e.target.classList.contains('delete-btn')) {
            this.deleteTodo(id);
        }
    }

    // Handle keypress in edit mode
    handleTodoKeypress(e) {
        if (e.key === 'Enter' && e.target.classList.contains('edit-input')) {
            this.saveEdit(e.target);
        } else if (e.key === 'Escape' && e.target.classList.contains('edit-input')) {
            this.cancelEdit();
        }
    }

    // Handle blur event for edit input
    handleTodoBlur(e) {
        if (e.target.classList.contains('edit-input')) {
            this.saveEdit(e.target);
        }
    }

    // Add new todo
    addTodo(text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.saveTodos();
        this.render();
        
        // Add animation
        setTimeout(() => {
            const newItem = this.todoList.querySelector(`[data-id="${todo.id}"]`);
            if (newItem) {
                newItem.style.animation = 'fadeInUp 0.3s ease';
            }
        }, 10);
    }

    // Toggle todo completion
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            const wasCompleted = todo.completed;
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            
            // Trigger confetti when marking as completed (not when unchecking)
            if (!wasCompleted && todo.completed) {
                this.triggerConfetti();
                // Show motivational message after a short delay
                setTimeout(() => showMotivationalMessage(), 200);
            }
        }
    }

    // Start editing todo
    startEditing(id) {
        if (this.editingId) {
            this.cancelEdit();
        }
        
        this.editingId = id;
        const todo = this.todos.find(t => t.id === id);
        const todoItem = this.todoList.querySelector(`[data-id="${id}"]`);
        
        if (todo && todoItem) {
            todoItem.classList.add('editing');
            
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.className = 'edit-input';
            editInput.value = todo.text;
            editInput.maxLength = 250;
            
            const todoText = todoItem.querySelector('.todo-text');
            todoText.parentNode.insertBefore(editInput, todoText.nextSibling);
            
            editInput.focus();
            editInput.select();
        }
    }

    // Save edit
    saveEdit(input) {
        if (!this.editingId) return;
        
        const newText = input.value.trim();
        const todo = this.todos.find(t => t.id === this.editingId);
        
        if (todo && newText && newText !== todo.text) {
            todo.text = newText;
            this.saveTodos();
        }
        
        this.cancelEdit();
        this.render();
    }

    // Cancel edit
    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    // Delete todo
    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
        }
    }

    // Clear completed todos
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear.');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${completedCount} completed task${completedCount > 1 ? 's' : ''}?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
        }
    }

    // Clear all todos
    clearAll() {
        if (this.todos.length === 0) {
            alert('No tasks to clear.');
            return;
        }
        
        if (confirm(`Are you sure you want to delete all ${this.todos.length} task${this.todos.length > 1 ? 's' : ''}? This cannot be undone.`)) {
            this.todos = [];
            this.saveTodos();
            this.render();
        }
    }

    // Get filtered todos
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    // Render the todo list
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Clear current list
        this.todoList.innerHTML = '';
        
        // Show/hide empty state
        if (this.todos.length === 0) {
            this.emptyState.classList.add('show');
            this.bulkActions.style.display = 'none';
        } else {
            this.emptyState.classList.remove('show');
            this.bulkActions.style.display = 'flex';
        }
        
        // Render todos
        filteredTodos.forEach(todo => {
            const todoItem = this.createTodoElement(todo);
            this.todoList.appendChild(todoItem);
        });
        
        // Update stats
        this.updateStats();
    }

    // Create todo element
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        
        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"></div>
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="action-btn edit-btn">Edit</button>
                <button class="action-btn delete-btn">Delete</button>
            </div>
        `;
        
        return li;
    }

    // Update statistics
    updateStats() {
        const activeTodos = this.todos.filter(t => !t.completed);
        const count = activeTodos.length;
        const completedCount = this.todos.filter(t => t.completed).length;
        
        let statsText;
        if (count === 0 && completedCount === 0) {
            statsText = 'No tasks';
        } else if (count === 0) {
            statsText = `All tasks completed! (${completedCount})`;
        } else {
            statsText = `${count} task${count !== 1 ? 's' : ''} remaining`;
        }
        
        this.todoCount.textContent = statsText;
        
        // Update bulk action button states
        const hasCompleted = completedCount > 0;
        this.clearCompletedBtn.style.opacity = hasCompleted ? '1' : '0.5';
        this.clearCompletedBtn.disabled = !hasCompleted;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Save todos to localStorage
    saveTodos() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.warn('Could not save todos to localStorage:', error);
        }
    }

    // Load todos from localStorage
    loadTodos() {
        try {
            const stored = localStorage.getItem('todos');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Could not load todos from localStorage:', error);
            return [];
        }
    }

    // Trigger confetti animation
    triggerConfetti() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#ffecd2', '#fcb69f'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
        }
    }

    // Create individual confetti piece
    createConfettiPiece(color) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background-color: ${color};
            top: -10px;
            left: ${Math.random() * window.innerWidth}px;
            opacity: 1;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            z-index: 9999;
            pointer-events: none;
            animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        // Remove confetti piece after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 4000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Add some helpful keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Focus input with Ctrl/Cmd + /
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        document.getElementById('todoInput').focus();
    }
    
    // Clear completed with Ctrl/Cmd + D
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        document.getElementById('clearCompleted').click();
    }
});

// Add some nice touches for user experience
document.getElementById('todoInput').addEventListener('input', function() {
    const remaining = 250 - this.value.length;
    if (remaining < 50) {
        this.style.borderColor = remaining < 20 ? '#ff6b6b' : '#ffa500';
    } else {
        this.style.borderColor = '#e1e5e9';
    }
});

// Add motivational messages
const motivationalMessages = [
    "Great job! Keep up the momentum! 🚀",
    "You're crushing it! 💪",
    "Another task down! You're amazing! ⭐",
    "Productivity level: Expert! 🏆",
    "You're on fire today! 🔥",
    "Task master in action! 👑",
    "Making progress like a pro! 📈"
];

// Show motivational message when completing tasks
function showMotivationalMessage() {
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        z-index: 1000;
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
    `;
    
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3000);
}

// Add animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    @keyframes confettiSpread {
        0% {
            transform: translateY(-10px) rotate(0deg) scale(1);
            opacity: 1;
        }
        50% {
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 