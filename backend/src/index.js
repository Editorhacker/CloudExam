const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes.js');
const examRoutes = require('./routes/examRoutes.js');

dotenv.config();

const app = express();
app.use(cors({origin: '*'}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);

module.exports = app;