const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const JWT_SECRET = 'access';

const isValid = (username)=>{ //returns boolean
    if (!username || typeof username !== 'string') return false;
    return !users.some(u => u.username === username);
};

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(u => u.username === username && u.password === password);
};

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid login. Check username and password" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  req.session.authorization = { token, username };

  return res.status(200).json({
    message: "User successfully logged in",
    token   : token
  });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
  const review = req.query.review;

  const sessionUser = req.session?.authorization?.username;
  const jwtUser = req.user?.username;               // 由 index.js 的 jwt.verify 塞入
  const username = sessionUser || jwtUser;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized: login required" });
  }
  if (!isbn || !books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN "${isbn}" not found` });
  }
  if (typeof review !== "string" || review.trim() === "") {
    return res.status(400).json({ message: "Query parameter 'review' is required" });
  }

  if (!books[isbn].reviews || typeof books[isbn].reviews !== 'object') {
    books[isbn].reviews = {};
  }

  const isUpdate = Object.prototype.hasOwnProperty.call(books[isbn].reviews, username);
  books[isbn].reviews[username] = review.trim();

  return res.status(200).json({
    message: isUpdate ? "Review updated successfully" : "Review added successfully",
    isbn,
    user: username,
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
  
    // 取得已登入使用者（來源於 session / JWT 中介軟體）
    const sessionUser = req.session?.authorization?.username;
    const jwtUser = req.user?.username;
    const username = sessionUser || jwtUser;
  
    if (!username) {
      return res.status(401).json({ message: "Unauthorized: login required" });
    }
    if (!isbn || !books[isbn]) {
      return res.status(404).json({ message: `Book with ISBN "${isbn}" not found` });
    }
  
    const reviews = books[isbn].reviews || {};
    if (!Object.prototype.hasOwnProperty.call(reviews, username)) {
      return res.status(404).json({ message: "No review by this user to delete" });
    }
  
    // 僅刪除自己的評論
    delete reviews[username];
    books[isbn].reviews = reviews; // 保持物件引用一致
  
    return res.status(200).json({
      message: "Review deleted successfully",
      isbn,
      user: username,
      reviews
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
