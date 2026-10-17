import { getBooks, addBook, updateBook, deleteBook, replaceAllBooks } from './state.js';
import { loadSettings, saveSettings, downloadJSON, readJSONFile } from './storage.js';
import { validateField, isValidBook, FIELDS } from './validators.js';
import { compileRegex, filterBooks, sortBooks } from './search.js';
import { renderDashboard, renderLibrary, renderSortButtons, renderPreview, showError, renderConvertedTotal } from './ui.js';
import { getStats, toDateKey } from './stats.js';

// What the library is showing right now
const view = {
  query: '',
  ignoreCase: true,
  sortKey: 'dateAdded',
  sortDir: 'desc',
  editingId: null,
  confirmId: null
};

let settings = loadSettings();