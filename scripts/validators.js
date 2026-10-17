export const PATTERNS = {
    noEdgeSpaces: /^\S(?:.*\S)?$/,                                  // no space at the start or the end
  doubleSpace: / {2,}/,                                          // two spaces or more in a row
  repeatedWord: /\b(\w+)\s+\1\b/i,                               // ADVANCED: back-reference \1
  pages: /^(0|[1-9]\d*)(\.\d{1,2})?$/,                           // 528 or 12.5
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,         // YYYY-MM-DD
  tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/                            // letters, spaces, hyphens
};

export const FIELDS = [ 'title', 'author', 'pages', 'tag', 'dateAdded'];
export function validateField(name, value) {
if (value === '') {
    return 'This field is required.';
}

if (name === 'title' || name === 'author') {
    if (!PATTERNS.noEdgeSpaces.test(value)) {
      return 'Remove the space at the start or the end.';
    }
    if (PATTERNS.doubleSpace.test(value)) {
      return 'Use only one space between words.';
    }
    const repeated = value.match(PATTERNS.repeatedWord);
    if (repeated) {
        return `"${repeated[1]}" is written twice.`;
    }
  }

  if (name === 'pages' && !PATTERNS.pages.test(value)) {
    return 'Enter a number like 528.';
  }

   if (name === 'dateAdded' && !PATTERNS.date.test(value)) {
    return 'Use the format YYYY-MM-DD, like 2025-09-18.';
  }

  if (name === 'tag' && !PATTERNS.tag.test(value)) {
    return 'Use letters, spaces or hyphens only.';
  }

  return '';
}
export function isValidBook(book) {
  if (typeof book !== 'object' || book === null) return false;
  if (typeof book.id !== 'string') return false;

  return FIELDS.every(field => {
    const value = book[field] === undefined ? '' : String(book[field]);
    return validateField(field, value) === '';
  });
}
