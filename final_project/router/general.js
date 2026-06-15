const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ "username": username, "password": password });
  
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Use status 200 (OK) instead of 300, and send the pretty-printed dataset
    return res.status(200).send(JSON.stringify(books, null, 4));
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    // If found, send it back cleanly formatted
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const targetAuthor = req.params.author.toLowerCase();
  const bookKeys = Object.keys(books);
  let matchingBooks = [];

  bookKeys.forEach((key) => {
    if (books[key].author.toLowerCase() === targetAuthor) {
      matchingBooks.push({
        isbn: key,
        author: books[key].author,
        title: books[key].title,
        reviews: books[key].reviews
      });
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  }

  return res.status(404).json({ message: `No books found by author: ${req.params.author}` });

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const targetTitle = req.params.title.toLowerCase();
  const bookKeys = Object.keys(books);

  let matchingBooks = [];

  bookKeys.forEach((key) => {
    if (books[key].title.toLowerCase() === targetTitle) {
      matchingBooks.push({
        isbn: key,
        author: books[key].author,
        title: books[key].title,
        reviews: books[key].reviews
      });
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
  }

  return res.status(404).json({ message: `No books found with title: ${req.params.title}` });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

module.exports.general = public_users;
