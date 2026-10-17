const BOOKS_KEY = 'vault:books';
const SETTINGS_KEY = 'vault:settings';
const DEFAULT_SETTINGS = { goal: 6000, pagesPerHour: 40, unit: 'pages' };

export function loadBooks() {
    try{
        const data = JSON.parse(localStorage.getItem(BOOKS_KEY));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export function saveBooks(books) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function loadSettings() {
    try{
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
            return { ...DEFAULT_SETTINGS, ...saved };
    } catch {
        return {...DEFAULT_SETTINGS };
    }
}

export function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function downloadJSON(books) {
const text = JSON.stringify(books, null, 2);
const file = new Blob([text], { type: 'application/json' });
const url = URL.createObjectURL(file);

const link =document.createElement('a');
link.href = url;
link.download = 'vault-backup.json';
link.click();

setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readJSONFile(file) {
    const text = await file.text()
    return JSON.parse(text);
}