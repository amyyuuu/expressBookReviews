// index.js
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// 建議把 JWT 秘鑰集中管理（之後 login 也會用到同一把）
const JWT_SECRET = 'access';  // 教學環境可用硬編碼；實務請改用環境變數

app.use(express.json());

// 先掛 session（僅作用於 /customer 路徑底下）
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// 針對需要授權的路由，先做會話 + JWT 驗證
app.use("/customer/auth/*", function auth(req, res, next) {
  // 1) 會話是否存在授權資訊
  if (!req.session || !req.session.authorization || !req.session.authorization.token) {
    return res.status(401).json({ message: "Unauthorized: missing session or token" });
  }

  const token = req.session.authorization.token;

  // 2) 驗證 JWT 是否有效
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: invalid or expired token" });
    }

    // 3) 將 payload 掛到 req 讓後續處理器可用（例如 req.user.username）
    req.user = payload;
    return next();
  });
});

const PORT = 5000;

// 掛載實作路由
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
