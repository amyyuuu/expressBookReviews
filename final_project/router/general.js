const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios'); // ← 新增
const public_users = express.Router();

public_users.get('/data/books', (req, res) => {
    return res.status(200).json(books);
  });

  public_users.get('/async/books', async (req, res) => {
    try {
      // 依你的埠號組合 URL（與 index.js 的 PORT 一致）
      const PORT = process.env.PORT || 5000;
      const url = `http://localhost:${PORT}/data/books`;
  
      // 以 Axios 取得資料
      const response = await axios.get(url);
      const data = response.data;
  
      // 美化輸出
      const pretty = JSON.stringify(data, null, 2);
      res.set('Content-Type', 'application/json');
      return res.status(200).send(pretty);
    } catch (err) {
      console.error('Failed to fetch books via axios:', err.message);
      return res.status(500).json({ message: 'Failed to fetch books' });
    }
  });

  public_users.get('/data/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: `Book with ISBN "${isbn}" not found` });
    }
    return res.status(200).json(book);
  });

  public_users.get('/async/isbn/:isbn', async (req, res) => {
    try {
      const { isbn } = req.params;
      const base = `${req.protocol}://${req.get('host')}`; // 自動帶正確 host:port
      const { data } = await axios.get(`${base}/data/isbn/${encodeURIComponent(isbn)}`);
  
      const pretty = JSON.stringify(data, null, 2);
      res.set('Content-Type', 'application/json');
      return res.status(200).send(pretty);
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return res.status(404).json(err.response.data);
          }
          console.error('Failed to fetch by ISBN via axios:', err.message);
          return res.status(500).json({ message: 'Failed to fetch by ISBN' });
        }
      });


public_users.get('/data/author/:author', (req, res) => {
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
  return res.status(200).json(results);
});


public_users.get('/async/author/:author', async (req, res) => {
    try {
      const { author } = req.params;
      const base = `${req.protocol}://${req.get('host')}`; // 自動帶正確 host:port
      const url = `${base}/data/author/${encodeURIComponent(author)}`;
  
      const { data } = await axios.get(url);
  
      const pretty = JSON.stringify(data, null, 2);
      res.set('Content-Type', 'application/json');
      return res.status(200).send(pretty);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return res.status(404).json(err.response.data);
      }
      console.error('Failed to fetch by author via axios:', err.message);
      return res.status(500).json({ message: 'Failed to fetch by author' });
    }
  });

  public_users.get('/data/title/:title', (req, res) => {
    const { title } = req.params;
    const results = Object.keys(books).reduce((acc, isbn) => {
      const book = books[isbn];
      if (book.title && book.title.toLowerCase() === title.toLowerCase()) {
        acc.push({ isbn, ...book });
      }
      return acc;
    }, []);

    if (results.length === 0) {
        return res.status(404).json({ message: `No books found for title "${title}"` });
      }
      return res.status(200).json(results);
    });

    public_users.get('/async/title/:title', async (req, res) => {
        try {
          const { title } = req.params;
          const base = `${req.protocol}://${req.get('host')}`; // 自動帶正確 host:port
          const url = `${base}/data/title/${encodeURIComponent(title)}`;
      
          const { data } = await axios.get(url);
      
          const pretty = JSON.stringify(data, null, 2);
          res.set('Content-Type', 'application/json');
          return res.status(200).send(pretty);
        } catch (err) {
          if (err.response && err.response.status === 404) {
            return res.status(404).json(err.response.data);
          }
          console.error('Failed to fetch by title via axios:', err.message);
          return res.status(500).json({ message: 'Failed to fetch by title' });
        }
      });

      

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
