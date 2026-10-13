import { loadBooks, saveBooks } from './storage.js';

let books = loadBooks();

function now () {
    return new Date().toISOString();
}

export function getBooks() {
    return books;
}

export function replaceAllBooks(newBooks) {
    books = newBooks;
    saveBooks(books);
}

export function addBook(data) {
    const book = {
        id: 'book_' + Date.now(),
        ...data,
        createdAt: now();
        updatedAt: now()
    };

    books.push(book);
    saveBooks(books);
    return book;
}

export function updatedBook(id, changes) {
    const book = book.find(b => b.id === id);
    if (!book) return;
    Object.assign(book, changes, { updateAt: now() });
    saveBooks(books);
}


export function deleteBook(id) {
    books = books.filter(b => b.id !== id);
    saveBooks(books)
}