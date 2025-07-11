document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtn = document.getElementById('filter-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const formError = document.getElementById('form-error');

    let tasks = [];

    function loadTasks() {
        const storedTasks = localStorage.getItem('todos');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
        renderTasks();
    }

    function saveTasks() {
        localStorage.setItem('todos', JSON.stringify(tasks));
    }

    function showError(message) {
        formError.textContent = message;
        formError.classList.add('show'); 
    }

    function hideError() {
        formError.textContent = '';
        formError.classList.remove('show');
    }

    function renderTasks(filterCompleted = false) {
        taskList.innerHTML = ''; 

        const tasksToRender = filterCompleted ? tasks.filter(task => !task.completed) : tasks;

        if (tasksToRender.length === 0) {
            const noTaskRow = document.createElement('tr');
            noTaskRow.innerHTML = `<td colspan="4" class="no-task-found">No task found</td>`;
            taskList.appendChild(noTaskRow);
            return;
        }

        tasksToRender.forEach((task, index) => {
            const row = document.createElement('tr');
            row.dataset.id = task.id;

            const statusClass = task.completed ? 'status-completed' : 'status-pending';
            const statusText = task.completed ? 'Completed' : 'Pending';

            row.innerHTML = `
                <td class="task-text">${task.text}</td>
                <td>${task.dueDate}</td>
                <td class="status-cell">
                    <button class="${statusClass}" data-action="toggle-status">${statusText}</button>
                </td>
                <td class="actions-cell">
                    <button data-action="delete">Delete</button>
                </td>
            `;
            taskList.appendChild(row);
        });
        saveTasks(); 
    }

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const taskText = taskInput.value.trim();
        const dueDate = dateInput.value;

        if (!taskText) {
            showError('Task cannot be empty.');
            return;
        }
        if (!dueDate) {
            showError('Due date cannot be empty.');
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(dueDate);
        if (selectedDate < today) {
            showError('Due date cannot be in the past.');
            return;
        }

        hideError();

        const newTask = {
            id: Date.now().toString(),
            text: taskText,
            dueDate: dueDate,
            completed: false
        };

        tasks.push(newTask);
        taskInput.value = ''; 
        dateInput.value = ''; 
        renderTasks(); 
    });

    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const row = target.closest('tr'); 

        if (!row) return; 

        const taskId = row.dataset.id;
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) return;

        if (target.dataset.action === 'toggle-status') {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            renderTasks(filterBtn.classList.contains('active')); 
        } else if (target.dataset.action === 'delete') {
            tasks.splice(taskIndex, 1); 
            renderTasks(filterBtn.classList.contains('active')); 
        }
    });

    filterBtn.addEventListener('click', () => {
        filterBtn.classList.toggle('active'); 
        const isActive = filterBtn.classList.contains('active');
        filterBtn.textContent = isActive ? 'SHOW ALL' : 'FILTER';
        renderTasks(isActive);
    });

    deleteAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all tasks?')) {
            tasks = []; 
            saveTasks(); 
            renderTasks(); 
            filterBtn.classList.remove('active'); 
            filterBtn.textContent = 'FILTER';
        }
    });

    loadTasks();
});