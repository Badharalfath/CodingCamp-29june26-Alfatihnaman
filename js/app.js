/* ============================================
   DATA LAYER - LocalStorage
   ============================================ */
const STORAGE_KEY = 'tasks_app_data';
const LINKS_KEY = 'tasks_app_links';
const NAME_KEY = 'tasks_app_username';
const TIMER_KEY = 'tasks_app_timer_preset';

function getTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getLinks() {
  try { return JSON.parse(localStorage.getItem(LINKS_KEY) || '[]'); }
  catch { return []; }
}

function saveLinks(links) {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ============================================
   STATE
   ============================================ */
let currentFilter = 'all';
let currentPriority = 'none';

/* ============================================
   THEME
   ============================================ */
function initTheme() {
  const saved = localStorage.getItem('tasks_theme');
  const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('tasks_theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  const sun = document.querySelector('.icon-sun');
  const moon = document.querySelector('.icon-moon');
  if (theme === 'dark') {
    sun.style.display = 'block';
    moon.style.display = 'none';
  } else {
    sun.style.display = 'none';
    moon.style.display = 'block';
  }
}

/* ============================================
   GREETING
   ============================================ */
function initGreeting() {
  const savedName = localStorage.getItem(NAME_KEY) || '';
  const hour = new Date().getHours();
  let greet;
  if (hour < 5) greet = 'Late night';
  else if (hour < 12) greet = 'Good morning';
  else if (hour < 17) greet = 'Good afternoon';
  else if (hour < 21) greet = 'Good evening';
  else greet = 'Good night';

  const greetEl = document.getElementById('greeting-text');
  greetEl.innerHTML = `${greet}, <input class="name-edit" id="name-input" value="${escapeAttr(savedName)}" placeholder="your name" spellcheck="false" style="width:${Math.max(60, savedName.length * 11)}px">`;

  const nameInput = document.getElementById('name-input');
  nameInput.addEventListener('input', () => {
    localStorage.setItem(NAME_KEY, nameInput.value);
    nameInput.style.width = Math.max(60, nameInput.value.length * 11) + 'px';
  });
  nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') nameInput.blur();
  });

  // Sub-line: motivational based on tasks
  updateGreetingSub();

  // Date
  const now = new Date();
  const opts = { weekday: 'long', month: 'long', day: 'numeric' };
  document.getElementById('greeting-date').textContent = now.toLocaleDateString('en-US', opts);
}

function updateGreetingSub() {
  const tasks = getTasks();
  const pending = tasks.filter(t => !t.done).length;
  const sub = document.getElementById('greeting-sub');
  if (tasks.length === 0) {
    sub.textContent = 'What will you work on today?';
  } else if (pending === 0) {
    sub.textContent = 'All tasks done — nice work.';
  } else {
    sub.textContent = `${pending} task${pending !== 1 ? 's' : ''} remaining today.`;
  }
}

/* ============================================
   FOCUS TIMER
   ============================================ */
const CIRCUMFERENCE = 2 * Math.PI * 42; // ~263.89

let timerDuration = parseInt(localStorage.getItem(TIMER_KEY) || '25') * 60;
let timerRemaining = timerDuration;
let timerInterval = null;
let timerRunning = false;

function initTimer() {
  const saved = parseInt(localStorage.getItem(TIMER_KEY) || '25');
  timerDuration = saved * 60;
  timerRemaining = timerDuration;

  // Set active preset
  document.querySelectorAll('.timer-preset').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.minutes) === saved);
  });

  updateTimerDisplay();
}

function updateTimerDisplay() {
  const mins = Math.floor(timerRemaining / 60);
  const secs = timerRemaining % 60;
  document.getElementById('timer-display').textContent =
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const progress = document.getElementById('timer-progress');
  const fraction = timerDuration > 0 ? timerRemaining / timerDuration : 1;
  progress.setAttribute('stroke-dashoffset', CIRCUMFERENCE * (1 - fraction));

  const status = document.getElementById('timer-status');
  const startBtn = document.getElementById('timer-start');

  if (timerRunning) {
    status.textContent = 'Focusing...';
    status.className = 'timer-status running';
    startBtn.textContent = 'Pause';
  } else if (timerRemaining <= 0) {
    status.textContent = 'Done!';
    status.className = 'timer-status';
    startBtn.textContent = 'Start';
  } else if (timerRemaining < timerDuration) {
    status.textContent = 'Paused';
    status.className = 'timer-status';
    startBtn.textContent = 'Resume';
  } else {
    status.textContent = 'Ready';
    status.className = 'timer-status';
    startBtn.textContent = 'Start';
  }
}

function startTimer() {
  if (timerRemaining <= 0) {
    timerRemaining = timerDuration;
  }

  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    updateTimerDisplay();
    return;
  }

  timerRunning = true;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerRemaining--;
    if (timerRemaining <= 0) {
      timerRemaining = 0;
      clearInterval(timerInterval);
      timerRunning = false;
      // Notify
      if (Notification.permission === 'granted') {
        new Notification('Focus session complete!', { body: 'Time for a break.' });
      }
    }
    updateTimerDisplay();
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerRemaining = timerDuration;
  updateTimerDisplay();
}

function setTimerPreset(minutes) {
  clearInterval(timerInterval);
  timerRunning = false;
  timerDuration = minutes * 60;
  timerRemaining = timerDuration;
  localStorage.setItem(TIMER_KEY, minutes);

  document.querySelectorAll('.timer-preset').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
  });

  updateTimerDisplay();
}

/* ============================================
   QUICK LINKS
   ============================================ */
function renderLinks() {
  const links = getLinks();
  const list = document.getElementById('links-list');

  if (links.length === 0) {
    list.innerHTML = '<div style="font-size:0.75rem;color:var(--text-3);padding:8px 0;">No links yet</div>';
    return;
  }

  list.innerHTML = links.map(link => {
    const domain = getDomain(link.url);
    const initial = domain.charAt(0).toUpperCase();
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    return `
      <div class="link-item" data-id="${link.id}">
        <img class="link-favicon" src="${faviconUrl}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="link-favicon-placeholder" style="display:none">${initial}</div>
        <a class="link-label" href="${escapeAttr(link.url)}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">${escapeHtml(link.title || domain)}</a>
        <button class="link-remove" onclick="removeLink('${link.id}')" aria-label="Remove link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>`;
  }).join('');
}

function addLink() {
  const input = document.getElementById('link-url-input');
  let url = input.value.trim();
  if (!url) return;

  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  const links = getLinks();
  const domain = getDomain(url);

  links.push({
    id: generateId(),
    url,
    title: domain,
  });

  saveLinks(links);
  input.value = '';
  renderLinks();
}

function removeLink(id) {
  const links = getLinks().filter(l => l.id !== id);
  saveLinks(links);
  renderLinks();
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/* ============================================
   RENDER TASKS
   ============================================ */
function render() {
  const tasks = getTasks();
  const list = document.getElementById('task-list');
  const filtered = filterTasks(tasks);

  // Stats
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-pending').textContent = total - done;
  document.getElementById('task-count').textContent = total > 0 ? `${done}/${total}` : '';

  // Clear done btn
  const clearBtn = document.getElementById('clear-done-btn');
  if (done > 0) {
    clearBtn.classList.remove('hidden');
    clearBtn.textContent = `Clear completed (${done})`;
  } else {
    clearBtn.classList.add('hidden');
  }

  // Greeting sub
  updateGreetingSub();

  // Empty state
  if (filtered.length === 0) {
    const msg = currentFilter === 'done'
      ? 'No completed tasks yet'
      : currentFilter === 'pending'
        ? 'All caught up'
        : 'No tasks yet';
    const sub = currentFilter === 'all' ? 'Add a task above to get started' : '';
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${currentFilter === 'pending' ? '&#10003;' : '&#9744;'}</div>
        <p>${msg}</p>
        <p>${sub}</p>
      </div>`;
    return;
  }

  // Sort: pending first (high > med > low > none), then done
  const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
  const sorted = [...filtered].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
  });

  list.innerHTML = sorted.map((task, i) => `
    <div class="task-item ${task.done ? 'done' : ''}" data-id="${task.id}" style="animation-delay: ${i * 0.03}s">
      <button class="task-check" onclick="toggleTask('${task.id}')" aria-label="${task.done ? 'Mark undone' : 'Mark done'}">
        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
      <div class="priority-pip" data-p="${task.priority || 'none'}"></div>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <span class="task-meta">${formatDate(task.created)}</span>
      <button class="task-delete" onclick="deleteTask('${task.id}')" aria-label="Delete task">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  `).join('');
}

function filterTasks(tasks) {
  if (currentFilter === 'pending') return tasks.filter(t => !t.done);
  if (currentFilter === 'done') return tasks.filter(t => t.done);
  return tasks;
}

/* ============================================
   CRUD OPERATIONS
   ============================================ */
function addTask() {
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  if (!text) return;

  const tasks = getTasks();

  tasks.push({
    id: generateId(),
    text,
    done: false,
    priority: currentPriority,
    created: Date.now()
  });

  saveTasks(tasks);
  input.value = '';
  render();
}

function toggleTask(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks(tasks);
    render();
  }
}

function deleteTask(id) {
  const el = document.querySelector(`.task-item[data-id="${id}"]`);
  if (el) {
    el.classList.add('removing');
    setTimeout(() => {
      const tasks = getTasks().filter(t => t.id !== id);
      saveTasks(tasks);
      render();
    }, 300);
  }
}

function clearCompleted() {
  const tasks = getTasks().filter(t => !t.done);
  saveTasks(tasks);
  render();
}

/* ============================================
   EXPORT
   ============================================ */
function exportTasks() {
  const tasks = getTasks();
  if (tasks.length === 0) return;

  const lines = tasks.map(t => {
    const check = t.done ? '[x]' : '[ ]';
    const pri = t.priority && t.priority !== 'none' ? ` (${t.priority})` : '';
    return `${check} ${t.text}${pri}`;
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tasks-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ============================================
   UTILITIES
   ============================================ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

/* ============================================
   EVENT BINDINGS
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initGreeting();
  initTimer();
  renderLinks();

  // Request notification permission for timer
  if ('Notification' in window && Notification.permission === 'default') {
    // Don't prompt immediately — wait for first timer start
  }

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Add task
  document.getElementById('add-btn').addEventListener('click', addTask);
  document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  // Filter tabs
  document.getElementById('filters').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });

  // Priority selector
  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPriority = btn.dataset.priority;
    });
  });

  // Clear completed
  document.getElementById('clear-done-btn').addEventListener('click', clearCompleted);

  // Export
  document.getElementById('export-btn').addEventListener('click', exportTasks);

  // Timer controls
  document.getElementById('timer-start').addEventListener('click', () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    startTimer();
  });
  document.getElementById('timer-reset').addEventListener('click', resetTimer);

  // Timer presets
  document.getElementById('timer-presets').addEventListener('click', e => {
    const btn = e.target.closest('.timer-preset');
    if (!btn) return;
    setTimerPreset(parseInt(btn.dataset.minutes));
  });

  // Quick links
  document.getElementById('link-add-btn').addEventListener('click', addLink);
  document.getElementById('link-url-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addLink();
  });

  // Keyboard shortcut: Cmd/Ctrl + K to focus input
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('task-input').focus();
    }
  });

  // Initial render
  render();
});