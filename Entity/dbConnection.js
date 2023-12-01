const mysql = require('mysql2');
require('dotenv').config();

const dbConnection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
});

// Handle connection success or failure
dbConnection.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection was closed.');
    } else {
        throw err;
    }
});

// Listen for when a new connection is established successfully
dbConnection.on('connection', (connection) => {
    console.log('New database connection established.');
});




module.exports = dbConnection;

