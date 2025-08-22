const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
      }
      users.push({ username, password });

      return res.status(201).json({ message: "User successfully registered. Now you can login" });
    });
    
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const pretty = JSON.stringify(books, null, 2);
  res.set('Content-Type', 'application/json');
  return res.status(200).send(pretty);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];    
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN "${isbn}" not found` });
  }
  const pretty = JSON.stringify(book, null, 2);
  res.set('Content-Type', 'application/json');
  return res.status(200).send(pretty);
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const { author } = req.params;
  const results = Object.keys(books).reduce((acc, isbn) => {
    const book = books[isbn];
    if (book.author && book.author.toLowerCase() === author.toLowerCase()) {
        acc.push({ isbn, ...book }); 
    }
    return acc;
  }, []);

  if (results.length === 0) {
    return res.status(404).json({ message: `No books found for author "${author}"` });
  }

  const pretty = JSON.stringify(results, null, 2);
  res.set('Content-Type', 'application/json');
  return res.status(200).send(pretty);
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const { title } = req.params;
  const results = Object.keys(books).reduce((acc, isbn) => {
    const book = books[isbn];
    if (book.title && book.title.toLowerCase() === title.toLowerCase()) {
        acc.push({ isbn, ...book }); // 回應時附上 isbn，方便辨識
      }
      return acc;
    }, []);

  if (results.length === 0) {
        return res.status(404).json({ message: `No books found for title "${title}"` });
      }
  const pretty = JSON.stringify(results, null, 2);
  res.set('Content-Type', 'application/json');
  return res.status(200).send(pretty);  
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const { isbn } = req.params;
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `Book with ISBN "${isbn}" not found` });
      }
      const payload = { isbn, reviews: book.reviews || {} };
      const pretty = JSON.stringify(payload, null, 2);
      res.set('Content-Type', 'application/json');
      return res.status(200).send(pretty);
    });

module.exports.general = public_users;
