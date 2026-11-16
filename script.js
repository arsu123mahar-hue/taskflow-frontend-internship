// TaskFlow - Daily Task Manager
// Built using HTML, CSS and Vanilla JavaScript.

// Select HTML elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');

const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const remainingCount = document.getElementById('remainingCount');

const statusText = document.getElementById('statusText');
const clearCompletedButton = document.getElementById('clearCompleted');

// Load previously saved tasks from browser storage
let tasks = JSON.parse(
  localStorage.getItem('taskflow-tasks') || '[]'
);

let currentFilter = 'all';

// Display today's date
document.getElementById('today').textContent =
  new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

// Save tasks in localStorage
function saveTasks() {
  localStorage.setItem(
    'taskflow-tasks',
    JSON.stringify(tasks)
  );
}

// Update task statistics
function updateSummary() {
  const completed = tasks.filter(
    task => task.completed
  ).length;

  totalCount.textContent = tasks.length;
  completedCount.textContent = completed;
  remainingCount.textContent = tasks.length - completed;

  statusText.textContent = tasks.length
    ? `${tasks.length - completed} tasks left to do.`
    : 'Stay focused and keep going.';
}

// Display tasks on the page
function renderTasks() {
  taskList.innerHTML = '';

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === 'active') {
      return !task.completed;
    }

    if (currentFilter === 'completed') {
      return task.completed;
    }

    return true;
  });

  emptyState.style.display =
    visibleTasks.length ? 'none' : 'block';

  visibleTasks.forEach(task => {
    const item = document.createElement('li');

    item.className = `task-item${
      task.completed ? ' done' : ''
    }`;

    // Create completion checkbox
    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;

    checkbox.setAttribute(
      'aria-label',
      `Mark ${task.title} as completed`
    );

    checkbox.addEventListener('change', () => {
      tasks = tasks.map(entry =>
        entry.id === task.id
          ? { ...entry, completed: checkbox.checked }
          : entry
      );

      saveTasks();
      renderTasks();
    });

    // Display task title
    const name = document.createElement('span');

    name.className = 'task-name';
    name.textContent = task.title;

    // Create delete button
    const deleteButton = document.createElement('button');

    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = '×';

    deleteButton.setAttribute(
      'aria-label',
      `Delete ${task.title}`
    );

    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter(
        entry => entry.id !== task.id
      );

      saveTasks();
      renderTasks();
    });

    // Add elements to task item
    item.append(checkbox, name, deleteButton);
    taskList.appendChild(item);
  });

  updateSummary();
}

// Add a new task
taskForm.addEventListener('submit', event => {
  event.preventDefault();

  const title = taskInput.value.trim();

  if (!title) return;

  const newTask = {
    id: Date.now(),
    title: title,
    completed: false
  };

  tasks.unshift(newTask);

  taskInput.value = '';

  saveTasks();

  currentFilter = 'all';

  document.querySelectorAll('.filter').forEach(button => {
    button.classList.toggle(
      'active',
      button.dataset.filter === 'all'
    );
  });

  renderTasks();
  taskInput.focus();
});

// Filter tasks
document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll('.filter').forEach(filter => {
      filter.classList.toggle(
        'active',
        filter === button
      );
    });

    renderTasks();
  });
});

// Remove all completed tasks
clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);

  saveTasks();
  renderTasks();
});

// Initial page rendering
renderTasks();
