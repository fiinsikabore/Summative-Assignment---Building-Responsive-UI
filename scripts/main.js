import { getBooks, addBook, updateBook, deleteBook, replaceAllBooks } from './state.js';
import { loadSettings, saveSettings, downloadJSON, readJSONFile } from './storage.js';
import { validateField, isValidBook, FIELDS } from './validators.js';
import { compileRegex, filterBooks, sortBooks } from './search.js';
import { renderDashboard, renderLibrary, renderSortButtons, renderPreview, showError, renderConvertedTotal } from './ui.js';
import { getStats, toDateKey } from './stats.js';

const view = {
  query: '',
  ignoreCase: true,
  sortKey: 'dateAdded',
  sortDir: 'desc',
  editingId: null,
  confirmId: null
};

let settings = loadSettings();

function refresh() {
    const all = getBooks();
    const regex = compileRegex(view.query, view.ignoreCase);
    const shown = sortBooks(filterBooks(all, regex || null), view.sortKey, view.sortDir);

    renderLibrary(shown, {...view, regex, total: all.length });
    renderSortButtons(view.sortKey, view.sortDir);
    renderDashboard(all, settings);
} 

function showView(name) {
    document.querySelectorAll('.view').forEach(section => {
        section.hidden = section.id !== 'view-' + name;
    });
    document.querySelectorAll('.tab').forEach(tab => {
        if (tab.dataset.view === name) tab.setAttribute('aria-current', 'page');
        else tab.removeAttribute('aria-current');

    });

    document.querySelector(`#view-${name} h1`).focus();
}

document.addEventListener('click', event => {
    const link = event.target.closest('[data-view]');
    if (link) showView(link.dataset.view);
});

document.getElementById('search-input').addEventListener('input', event => {
    view.query = event.target.value;
    refresh();
});

document.getElementById('case-toggle').addEventListener('click', event => {
    view.ignoreCase = !view.ignoreCase;
    event.currentTarget.setAttribute('aria-pressed', view.ignoreCase);
    refresh();
});

document.querySelectorAll('[data-sort]').forEach(button => {
    button.addEventListener('click', () =>{
        const key = button.dataset.sort;
        if (view.sortKey === key) {
            view.sortDir = view.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            view.sortKey = key;
            view.sortDir = key ==='title' ? 'asc' : 'desc';
        }
        refresh();
        document.querySelector(`[data-sort="${key}"]`).focus();
    });
});

function focusRowButton(id, action) {
    const button = document.querySelector(`tr[data-id="${id}"] [data-action="${action}"]`);
  if (button) button.focus();
}

function saveEdit(id) {
    let valid = true;
    const changes = {};

    for (const field of FIELDS) {
        const input= document.getElementById('edit-' + field);
        const message = validateField(field, input.value);
        showError(input, message);
        if (message) valid = false;
        changes[field] = input.value;
    }

    if (!valid) {
        document.querySelector('.editing [aria-invalid="true"]').focus();
        return;
    }

    changes.pages = Number(changes.pages);
    updateBook(id, changes);
    view.editingId = null;
    refresh();
    focusRowButton(id, 'edit');
}

document.getElementById('book-rows').addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const id = button.closest('tr').dataset.id;
    const action = button.dataset.action;

    if (action === 'edit') {
        view.editingId = id;
        view.confirmId = null;
        refresh();
        document.getElementById('edit-title').focus();
    }

    if (action === 'cancel') {
        view.editingId = null;
        refresh();
        focusRowButton(id, 'edit');
    }

    if (action === 'save') {
        saveEdit(id);
    }

    if (action === 'delete') {
        if (view.confirmId === id) {
            deleteBook(id);
            view.confirmId = null;
            refresh();
            document.getElementById('search-status').textContent = 'Book deleted.';
            document.getElementById('search-input').focus();
       } else {
        view.confirmId = id;
        refresh();
        focusRowButton(id, 'delete');
       }
    }

});

document.getElementById('book-rows').addEventListener('keydown', event => {
    const row = event.target.closest('tr');
    if (!row) return;

    if (event.key === 'Escape') {
        view.editingId = null;
        view.confirmId = null;
        refresh();
        focusRowButton(row.dataset.id, 'edit');
    }

if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
    saveEdit(row.dataset.id);
}
});

const form = document.getElementById('add-form');

function readForm() {
  const values = {};
  for (const field of FIELDS) {
    values[field] = document.getElementById(field).value;
  }
  return values;
}

// live validation while typing
form.addEventListener('input', event => {
  const input = event.target;
  showError(input, validateField(input.name, input.value));
  renderPreview(readForm());
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const status = document.getElementById('form-status');
  let firstInvalid = null;

  for (const field of FIELDS) {
    const input = document.getElementById(field);
    const message = validateField(field, input.value);
    showError(input, message);
    if (message && !firstInvalid) firstInvalid = input;
  }

  if (firstInvalid) {
    status.textContent = 'Fix the fields in red first.';
    firstInvalid.focus();
    return;

  }

  const values = readForm();
  values.pages = Number(values.pages);
  addBook(values);

  form.reset();
  document.getElementById('dateAdded').value = toDateKey(new Date());
  renderPreview(readForm());
  status.textContent = `"${values.title}" was added to your vault.`;
  refresh();
});

document.getElementById('goal-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = document.getElementById('goal-input');
  const error = document.getElementById('goal-error');

  if (!/^[1-9]\d*$/.test(input.value)) {
    error.textContent = 'Enter a whole number of pages, like 6000.';
    input.setAttribute('aria-invalid', 'true');
    return;
  }

  error.textContent = '';
  input.setAttribute('aria-invalid', 'false');
  settings.goal = Number(input.value);
  saveSettings(settings);
  refresh();
});

document.getElementById('pages-per-hour').addEventListener('input', event => {
    const value = Number(event.target.value);
    if (value > 0) {
        settings.pagesPerHour = value;
        saveSettings(settings);
        renderConvertedTotal(getStats(getBooks()).totalPages, settings);
    }
});

document.getElementById('unit-select').addEventListener('change', event => {
    settings.unit = event.target.value;
    saveSettings(settings);
    renderConvertedTotal(getStats(getBooks()).totalPages, settings);
});

const dataStatus = document.getElementById('data-status');

document.getElementById('export-button').addEventListener('click', () => {
    downloadJSON(getBooks());
    dataStatus.textContent = 'Backup downloaded.';
});

document.getElementById('import-input').addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const data = await readJSONFile(file);
        if (!Array.isArray(data) || !data.every(isValidBook)) {
      throw new Error('wrong shape');
    }
        replaceAllBooks(data);
    refresh();
    dataStatus.textContent = `Imported ${data.length} books.`;
  } catch {
    dataStatus.textContent = "This file isn't a valid vault backup. Nothing was changed.";
  }
  event.target.value = ''; // lets you import the same file again
});

document.getElementById('seed-button').addEventListener('click', async () => {
  try {
    const response = await fetch('seed.json');
    replaceAllBooks(await response.json());
    refresh();
    dataStatus.textContent = 'Sample books loaded.';
  } catch {
    dataStatus.textContent = 'Could not load seed.json. Open the app with a local server.';
  }
});

function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Fiinsi';
    if (hour < 18) return 'Good afternoon, Fiinsi';
    return 'Good evening, Fiinsi';
}

document.getElementById('home-title').textContent = greeting();
document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-GB', {weekday: 'long', day: 'numeric', month: 'long'});
document.getElementById('goal-input').value = settings.goal;
document.getElementById('pages-per-hour').value = settings.pagesPerHour;
document.getElementById('unit-select').value = settings.unit;
document.getElementById('dateAdded').value = toDateKey(new Date());
renderPreview(readForm());
refresh();

if (getBooks().length === 0) {
    document.getElementById('seed-button').click();
}
