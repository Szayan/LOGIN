// Import required modules
const path = require('path');
const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.urlencoded({ extended: true }));

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Shayandrago1',
  database: 'user_info',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create the users table if it doesn't already exist in the database
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
  )
`);
// Handle GET requests to the root URL by sending the login HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});
// Handle GET requests to the signup URL by sending the signup HTML file
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});
// Handle POST requests to the signup URL by inserting user data into the users table
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

// Insert user data into the users table using the connection pool
  pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    console.log('User data saved!');
    res.send('Sign up successful!');
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

// Handle POST requests to the root URL by checking for user in the users table with matching credentials
  pool.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }

    if (result.length > 0) {
      res.send(`<script>alert("Welcome, ${username}!"); window.location.href="/";</script>`);
    } else {
      res.send(`<script>alert("Invalid username or password."); window.location.href="/";</script>`);
    }
  });
});
// localhost
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});