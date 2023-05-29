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
`, (err) => {
  if (err) {
    console.error(err);
  }
});

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Handle GET requests to the root URL by sending the login HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle GET requests to the signup URL by sending the signup HTML file
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
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

  // Handle POST requests to the root URL by checking for a user in the users table with matching credentials
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

// Get the user's timezone
const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Require the needed files
const { countries, zones } = require("moment-timezone/data/meta/latest.json");

var timeZoneCityToCountry = {}; // Declare the variable here

// Create a mapping of city to country
Object.keys(zones).forEach((z) => {
  const cityArr = z.split("/");
  const city = cityArr[cityArr.length - 1];
  timeZoneCityToCountry[city] = countries[zones[z].countries[0]].name;
});

console.log(timeZoneCityToCountry);

// Define the mapping of city to country (if you want to override the previous mapping)
timeZoneCityToCountry = {
  // ... (city to country mapping)
};

var userRegion;

if (Intl) {
  // Get the user's timezone and extract the region, city, and country
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezone = userTimeZone.split("/");
  userRegion = timezone[0];
  console.log(timezone);
}

// If the user is vnot in Europe, show the popup when a button is clicked
if (userRegion != "Europe") {
  app.get('/popup', (req, res) => {
    var popupContent =
      "<p>Dear user, by using the website you are agreeing to your country's GDPR laws.</p>";

    // Access the values from timeZoneCityToCountry and add them to the popup content
    for (var city in timeZoneCityToCountry) {
      var country = timeZoneCityToCountry[city];
      popupContent += "<p>" + city + ": " + country + "</p>";
    }

    res.send(`<script>alert("${popupContent}"); window.location.href="/";</script>`);
  });
}

console.log("Time Zone:", userTimeZone);
console.log("Region:", userRegion);

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
