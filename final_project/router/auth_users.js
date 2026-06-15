const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    if (!username) return false;
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JSON Web Token using secret key "access"
    let accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });

    // Store access token in the session authorization object
    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const reviewText = req.query.review;

  const username = req.session.authorization?.username || req.user?.data;

  if (!reviewText) {
    return res.status(400).json({ message: "Review content is required in query parameters (?review=...)" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  books[isbn].reviews[username] = reviewText;

  return res.status(200).json({ 
    message: `The review for the book with ISBN ${isbn} has been added/updated successfully.` 
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username || req.user?.data;

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ 
          message: `Reviews for ISBN ${isbn} posted by user ${username} have been deleted.` 
        });
      } else {
        return res.status(404).json({ message: `No review found for user ${username} under ISBN ${isbn}` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
