require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const { globalLimiter } = require('./middlewares/rateLimiter');
const apiRoutes = require('./routes'); 

const app = express();

app.set('trust proxy', 1);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(globalLimiter);

// JANGAN gunakan fs.mkdirSync di Vercel. 
// Jika butuh file statis, simpan di folder 'public' dan Vercel akan menyajikannya.
// app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); 

app.use('/', apiRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Server error', error: err.message });
});

// PENTING: Export app agar Vercel bisa menjalankan aplikasinya
module.exports = app;