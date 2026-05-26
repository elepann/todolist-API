const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'todolist'
});

db.connect((err) => {
    if(err) return console.log('error');
    console.log('db connected');
});

module.exports = db;