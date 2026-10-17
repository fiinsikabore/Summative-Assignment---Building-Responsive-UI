export function getStats(books) {
    const totalPages = books.reduce((sum, book)=> sum + Number(book.pages), 0);
  const authors = new Set(books.map(book => book.author)).size;

  const tagCount = {};
  for (const book of books) {
    tagCount[book.tag] = (tagCount[book.tag] || 0) + 1;
  }


const topTag = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a])[0];

const latest = [...books].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded))[0];
return { total: books.length, totalPages, authors, topTag, latest};
}

export function toDateKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}` ;
}

export function lastSevenDays(books, today = new Date()) {
    const days = [];
    for (let i = 6; i >=0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const key = toDateKey(day);
        const pages = books
            .filter(book => book.dateAdded === key)
            .reduce((sum, book) => sum + Number(book.pages), 0);
        days.push({ label: day.toLocaleDateString('en', { weekday: 'narrow' }), pages });

    }
    return days;
}