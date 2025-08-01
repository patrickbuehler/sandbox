// Todo List App JavaScript

class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initElements();
        this.bindEvents();
        this.render();
    }

    initElements() {
        this.todoInput = document.getElementById('todoInput');
        this.todoType = document.getElementById('todoType');
        this.todoDueDate = document.getElementById('todoDueDate');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.todoCount = document.getElementById('todoCount');
        this.todoCountText = document.getElementById('todoCountText');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        // Add todo events
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear completed
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());

        // Global click handler for outside clicks (to exit edit mode)
        document.addEventListener('click', (e) => {
            if (this.editingId && !e.target.closest('.todo-text')) {
                this.exitEditMode();
            }
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now().toString(),
            text: text,
            type: this.todoType.value,
            dueDate: this.todoDueDate.value || null,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.todoDueDate.value = '';
        // Keep the type selected for convenience
        this.render();

        // Focus back to input for quick adding
        this.todoInput.focus();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('removing');
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.render();
            }, 300);
        }
    }

    editTodo(id) {
        if (this.editingId) {
            this.exitEditMode();
        }

        this.editingId = id;
        const todoElement = document.querySelector(`[data-id="${id}"] .todo-text`);
        if (todoElement) {
            todoElement.contentEditable = true;
            todoElement.classList.add('editing');
            todoElement.focus();

            // Select all text
            const range = document.createRange();
            range.selectNodeContents(todoElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            // Handle save on Enter or Escape
            const handleKeyPress = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.saveTodoEdit(id, todoElement.textContent.trim());
                } else if (e.key === 'Escape') {
                    this.exitEditMode();
                }
            };

            const handleBlur = () => {
                this.saveTodoEdit(id, todoElement.textContent.trim());
            };

            todoElement.addEventListener('keypress', handleKeyPress);
            todoElement.addEventListener('blur', handleBlur);
        }
    }

    saveTodoEdit(id, newText) {
        if (!newText) {
            this.deleteTodo(id);
            return;
        }

        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText;
            this.saveTodos();
        }
        
        this.exitEditMode();
        this.render();
    }

    exitEditMode() {
        if (this.editingId) {
            const todoElement = document.querySelector(`[data-id="${this.editingId}"] .todo-text`);
            if (todoElement) {
                todoElement.contentEditable = false;
                todoElement.classList.remove('editing');
            }
            this.editingId = null;
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.render();
    }

    clearCompletedTodos() {
        const completedTodos = this.todos.filter(todo => todo.completed);
        
        if (completedTodos.length === 0) return;

        // Add animation to completed todos
        completedTodos.forEach(todo => {
            const todoElement = document.querySelector(`[data-id="${todo.id}"]`);
            if (todoElement) {
                todoElement.classList.add('removing');
            }
        });

        setTimeout(() => {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
        }, 300);
    }

    getFilteredTodos() {
        let filtered;
        switch (this.currentFilter) {
            case 'active':
                filtered = this.todos.filter(todo => !todo.completed);
                break;
            case 'completed':
                filtered = this.todos.filter(todo => todo.completed);
                break;
            default:
                filtered = this.todos;
        }

        // Sort by deadline urgency and then by date
        return filtered.sort((a, b) => {
            // Completed todos go to bottom
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            // If both have deadlines, sort by urgency
            if (a.dueDate && b.dueDate) {
                const aInfo = this.getDeadlineInfo(a.dueDate);
                const bInfo = this.getDeadlineInfo(b.dueDate);
                
                const urgencyOrder = { 'overdue': 0, 'due-soon': 1, 'normal': 2 };
                const aUrgency = urgencyOrder[aInfo.urgency];
                const bUrgency = urgencyOrder[bInfo.urgency];
                
                if (aUrgency !== bUrgency) {
                    return aUrgency - bUrgency;
                }
                
                // Same urgency level, sort by actual date
                return new Date(a.dueDate) - new Date(b.dueDate);
            }

            // Items with deadlines come before items without
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;

            // Neither has deadline, sort by creation date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        const activeTodos = this.todos.filter(todo => !todo.completed);
        
        // Clear the list
        this.todoList.innerHTML = '';

        // Show/hide empty state
        if (filteredTodos.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.todoList.style.display = 'none';
        } else {
            this.emptyState.classList.add('hidden');
            this.todoList.style.display = 'block';
        }

        // Render todos
        filteredTodos.forEach(todo => {
            const todoItem = this.createTodoElement(todo);
            this.todoList.appendChild(todoItem);
        });

        // Update counter
        const activeCount = activeTodos.length;
        this.todoCount.textContent = activeCount;
        this.todoCountText.textContent = activeCount === 1 ? 'item left' : 'items left';

        // Update clear completed button
        const completedCount = this.todos.length - activeCount;
        this.clearCompleted.disabled = completedCount === 0;
        this.clearCompleted.textContent = `Clear completed ${completedCount > 0 ? `(${completedCount})` : ''}`;
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = todo.id;

        const typeLabels = {
            quick: '🚀 Quick',
            deep: '🧠 Deep Work',
            reading: '📖 Reading',
            meeting: '💬 Meeting',
            admin: '📋 Admin',
            creative: '🎨 Creative'
        };

        const deadlineInfo = this.getDeadlineInfo(todo.dueDate);
        const deadlineHtml = todo.dueDate ? `
            <span class="todo-deadline ${deadlineInfo.urgency}">
                ${deadlineInfo.icon} ${deadlineInfo.text}
            </span>
        ` : '';

        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'completed' : ''}" data-action="toggle"></div>
            <div class="todo-content">
                <div class="todo-text ${todo.completed ? 'completed' : ''}" data-action="edit">${this.escapeHtml(todo.text)}</div>
                <div class="todo-meta">
                    <span class="todo-type ${todo.type}">${typeLabels[todo.type] || todo.type}</span>
                    ${deadlineHtml}
                </div>
            </div>
            <button class="delete-btn" data-action="delete" aria-label="Delete todo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        `;

        // Add event listeners
        li.addEventListener('click', (e) => {
            const action = e.target.dataset.action || e.target.closest('[data-action]')?.dataset.action;
            
            switch (action) {
                case 'toggle':
                    this.toggleTodo(todo.id);
                    break;
                case 'edit':
                    if (!todo.completed) {
                        this.editTodo(todo.id);
                    }
                    break;
                case 'delete':
                    this.deleteTodo(todo.id);
                    break;
            }
        });

        return li;
    }

    getDeadlineInfo(dueDate) {
        if (!dueDate) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let urgency, icon, text;

        if (diffDays < 0) {
            urgency = 'overdue';
            icon = '🚨';
            text = `Overdue ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
        } else if (diffDays === 0) {
            urgency = 'due-soon';
            icon = '⏰';
            text = 'Due today';
        } else if (diffDays === 1) {
            urgency = 'due-soon';
            icon = '📅';
            text = 'Due tomorrow';
        } else if (diffDays <= 3) {
            urgency = 'due-soon';
            icon = '📅';
            text = `Due in ${diffDays} days`;
        } else {
            urgency = 'normal';
            icon = '📅';
            text = due.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: due.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }

        return { urgency, icon, text };
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        try {
            const saved = localStorage.getItem('todos');
            const todos = saved ? JSON.parse(saved) : [];
            
            // Add backward compatibility for existing todos
            return todos.map(todo => ({
                ...todo,
                type: todo.type || 'quick', // Default to quick for existing todos
                dueDate: todo.dueDate || null
            }));
        } catch (error) {
            console.error('Error loading todos:', error);
            return [];
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});

// Add some nice keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('todoInput').focus();
    }
    
    // Escape to clear input or exit edit mode
    if (e.key === 'Escape') {
        const input = document.getElementById('todoInput');
        if (document.activeElement === input) {
            input.blur();
            input.value = '';
        }
    }
}); 