const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const userRoutes = require('./routes/users');
const professionalRoutes = require('./routes/professionals');
const appointmentRoutes = require('./routes/appointments');
const serviceRoutes = require('./routes/services');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the Vite build output in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
} else {
  app.use(express.static('public'));
}

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Make db pool available in req object
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);

// Frontend routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, process.env.NODE_ENV === 'production' ? 'dist' : 'public', 'index.html'));
});

app.get('/register/:type', (req, res) => {
  const type = req.params.type;
  const validTypes = ['lawyer', 'accountant', 'engineer'];
  
  if (validTypes.includes(type)) {
    res.sendFile(path.join(__dirname, process.env.NODE_ENV === 'production' ? 'dist' : 'public', `register-${type}.html`));
  } else {
    res.status(404).send('Page not found');
  }
});

// Handle SPA routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});