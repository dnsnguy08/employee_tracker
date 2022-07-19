require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    // add .env file in root directory with db user and password
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'employee_db',
}).promise();

module.exports = connection;
