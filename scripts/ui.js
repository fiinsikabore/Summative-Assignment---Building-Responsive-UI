import {escapeHTML, highlight } from './search.js';
import { getStats, lastSevenDays } from './stats.js';
import { FIELDS } from './validators,js';

const TAG_COLOURS = {
  'Dark Romance': ['#E2457F', '#741E48'],
  'Romantasy' : ['#F59A6B', '#E2457F'],
  'Fantasy' : ['#9ADB4E', '#2E9B7A'],
  'Gothic Fantasy' : ['#B58CF0', '#4B2C83'],
  'Contemporary Romance': ['#F6E96B', '#F06FA4']
};
const DEFAULT_COLOURS = ['#F06FA4', '#B58CF0'];

const LABELS = { title: 'Title', author: 'Author', pages: 'Pages', tag: 'Tag', dateAdded: 'Added' };

export function coverStyle(tag) {
  const [c1, c2] = TAG_COLOURS[tag] || DEFAULT_COLOURS;
  return `--c1: ${c1}; --c2: ${c2};`;
}

function formatNumber(n) {
  return Number(n).toLocaleString('en-US');
}

export function renderDashboard(books, settings) {
  const states = getStats(books);

  document.getElementById('stat-pages').textContent = formatNumber(states.totalPages);
  document.getElementById('stat-books').textContent = states.total + (states.total === 1 ? ' book' : ' books');
  document.getElementById('stat-authors').textContent = states.authors + (states.authors === 1 ? ' author' : ' authors');
  document.getElementById('stat-tag').textContent = states.topTag || 'nothing yet';

  renderLatest(stats.latest);
  renderTopTag(stats.topTag);
  renderGoal(stats.totalPages, settings.goal);
  renderChart(books);
  renderConvertedTotal(stats.totalPages, settings);
}

function renderLatest(latest) {
  if (!latest) return;
  const date = new Date(latest.dateAdded + 'T00:00:00');
  document.getElementById('widget-month').textContent = date.toLocaleDateString('en', { month: 'short' });
  document.getElementById('widget-day').textContent = date.getDate();
  document.getElementById('widget-latest').textContent = latest.title,split(' - ')[0];
  document.getElementById('widget-cd').style.cssText = coverStyle(latest.tag);
}

function renderTopTag(topTag) {
  if (!topTag) return;
  document.getElementById('widget-tag').textContent = topTag.split(' ')[0];
  document.getElementById('widget-stamp').style.cssText = coverStyle(topTag);
}

function renderGoal(totalPages, goal) {
  const left = goal - totalPages;
  const polite = document.getElementById('cap-polite');
  const alert = document.getElementById('cap-alert');

  if (left >= 0) {
    polite.innerHTML = `You have <b>${formatNumber(left)} pages</b> left before your goal. Have a break, have a <b>chapter</b> ;)`;
    alert.textContent = '';
  } else {
    polite.textContent = '';
    alert.textContent = `You are ${formatNumber(-left)} pages over your goal of ${formatNumber(goal)}.`;
  }

  const percent =Math.min(100, (totalPages / goal) *100);
  document.getElementById('goal-bar').style.width = percent + '%';
}

function renderChart(books) {
  const days = lastSevenDays(books);
  const max = Math.max(1, ...days.map(d => d.pages));

  document.getElementById('week-chart').innerHTML = days.map((day, i) =>`
    <div class="bar ${i === 6 ? 'today' : ''}">
      <span style="height: ${Math.max(6, (day.pages / max) * 80)}px" title="${day.pages} pages"></span>
      <small>${day.label}</small>
    </div>` ).join('');
}

export function renderConvertedTotal(totalPages, settings) {
  const output = document.getElementById('converted-total');
  if (settings.unit === 'hours') {
    output.textContent = (totalPages /settings.pagesPerHour).toFixed(1) + ' hours';
  }else {
    output.textContent = formatNumber(totalPages) + ' pages';
  }
}

function bookRow(book, regex, isConfirming) {
  return `
    <tr data-id="${book.id}">
      <td class="cover-cell"><div class="cover" style="${coverStyle(book.tag)}"></div></td>
      <td class="book-title">${highlight(book.title, regex)}</td>
      <td class="book-author">${highlight(book.author, regex)}</td>

      <td data-label="Pages">${book.pages}>/td>
      <td data-label="Tag">${highlight(book.tag, regex)}</td>
      <td data-label="Added">${book.dateAdded}</td
      <td class="actions">
        <button class="pill" data-action="edit" aria-label="Edit${escapeHTML(booktitle)}">Edit</button>
        ${isConfirming
          ? `<button class="pill confirm" data-action="delete" aria-label="Confirm delete ${escapeHTML(book.title)}">Confirm delete</button>`
          : `<button class="pill danger" data-action="delete" aria-label="Delete ${escapeHTML(book.title)}">Delete</button>`}
      </td>
    </tr>`;
}

function editROw(book) {
  const cells = FIELDS.map(field => `
    <td>
      <label class="sr-only" for=edit-${field}">${LABELS[field]} </label>
      <input id="edit-${field}" name="${field}" value="${escapeHTML(book[field])}" aria-describedby="edit-${field}-error">
      <span class="error" id="edit-${field}-error"></span>
    </td>`).join('');

    return `
      <tr data-id="${book.id}" class="editing">
        <td class="cover-cell"><div class="cover" style="${coverStyle(book.tag)}"></div></td>
        ${cells}
        <td class="actions">
          <button class="pill" data-action="save">Save</button>
          <button class="pill" data-action="cancel">Cancel</button>
        </td>
      </tr>`;
  }

  export function renderLibrary((books, view) {
  const tbody = document.getElementById('book-rows');
  const status = document.getElementById('search-status');

  if (view.regex === false) {
    status.textContent = "This pattern isn't valid yet. Keep typing.";
  } else if (view.regex) {
    status.textContent = `${books.length} of ${view.total} books match`;
  } else {
    status.textContent = `${view.total} books`;
  }

  if (books.length === 0) {
    tbody.innerHTML = `<tr><td class="empty" colspan="7">
      <p class="sentence">No book matches <b>${escapeHTML(view.query || 'yet')}</b>.</p>
      <p>Try a shorter pattern, or add a new book.</p></td></tr>`;
    return;
  }

  tbody.innerHTML = books.map(book => 
    book.id === view.editingId ? editROw(book) : bookRow,view.regex, book.id === view.confirmId)
  ).join('');
}

export function renderSortButtons(sortKey, sortDir) {
  const names = { dateAdded: 'Date', title: 'Title', pages: 'Pages' };
  document.querySelectorAll('[data-sprt]').forEach(button => {
    const key = button.dataset.sort;
    const active = key === sortKey;
    button.setAttribute('aria-pressed', active);
    button.textContent  names[key] + (active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '');
  });
}

export function showError(input, message) {
  document.getElementById(input.getAttribute('aria-describedby')).textContent = message;
  input.setAttribute('aria-invalid', message !== '');
}

export function renderPreview(values) {
  document.getElementById('preview-author').textContent = values.author || 'Someone';
  document.getElementById('preview-title').textContent = values.title || 'a new book';
  document.getElementById('preview-details').textContent =
    `${values.pages || 0} pages · ${values.tag || 'No tag'} · ${values.dateAdded || 'No date'}`;
}

