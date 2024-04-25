const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();




const app = express();
const PORT = process.env.PORT || 3000;

// MySQL Pool Connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB
});

// Session Store
const sessionStore = new MySQLStore({}, pool);

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// import and use volunteer Route




// Import and use blogRoutes with MySQL pool
const blogRoutes = require('./routes/blogRoutes')(pool); // Make sure your blogRoutes are adapted for MySQL
app.use('/blog', blogRoutes);

// Serve index.ejs for the root route
app.get('/', async (req, res) => {
    try {
        const [blogs] = await pool.query('SELECT * FROM blogs ORDER BY createdAt DESC LIMIT 3');
        res.render('index', { blogs });
    } catch (error) {
        console.error('Error fetching blog data:', error);
        res.status(500).send('Error fetching blog data');
    }
});

// Dynamically create routes for each page not covered by blogRoutes
const pages = [
  'about',
  'contact',
  'blog'
];

pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.render(page); // Render the page directly without '.html'
  });
});

// Catch-all for 404 Not Found responses
app.use((req, res) => {
  res.status(404).render('404'); // Use render for 404.ejs
});





app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
