export function compileRegex(input, ignorCase) {
    if (input === '') return null;
    try{
        return new RegExp(input, ignorCase ? 'gi' : 'g');
    } catch {
        return false;
    }
}

export function escapeHTML(text) {
   return String(text).replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function highlight(text, regex) {
    text = String(text)
    if (!regex) return escapeHTML(text);

    let result = '';
    let lastIndex = 0;

    for (const match of text.matchAll(regex)) {
        result += escapeHTML(text.slice(lastIndex, match.index));
        result += '<mark>' + escapeHTML(match[0]) + '</mark>';
        lastIndex = match.index + match[0].length;
    }

    return result + escapeHTML(text.slice(lastIndex));
}

export function filterBooks(books, regex) {
    if (!regex) return books;
    return books.filter(book=>
    [book.title, book.author, book.tag].some(text => text.search(regex) !== -1)
  );
}

export function sortBooks(books, key, direction) {
    const sorted = [...books].sort((a,b) => {
    if (key === 'pages') return a.pages - b.pages;
    return String(a[key]).localeCompare(String(b[key]));
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}