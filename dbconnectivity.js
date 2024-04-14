const http = require('http');
const mysql = require('mysql');
const url = require('url');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'expense_manager'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database');
});

// Create a server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  console.log('Received request:', parsedUrl); // Log request URL

  // Handle POST request for creating an account
  if (req.method === 'POST' && parsedUrl.pathname === '/create_account') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      console.log('Received form data:', body); // Log form data

      const data = JSON.parse(body);
      const fullname = data.fullname;
      const email = data.email;
      const password = data.password;
      const confirmPassword = data.confirm_password;

      // Check if the password and confirm password match
      if (password !== confirmPassword) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Passwords do not match');
        return;
      }

      // Insert the new user into the database
      connection.query('INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)', [fullname, email, password], (error, results, fields) => {
        if (error) {
          console.error('Error executing query: ' + error.stack);
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }

        // User created successfully
        res.statusCode = 201;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Account created successfully');
      });
    });
  } else {
    // Handle other requests
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not found');
  }
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
