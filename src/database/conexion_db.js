const mysql = require('mysql');

const mysqlConnection = mysql.createPool({
   connectionLimit: 20,
   host: 'localhost',
   user: 'root',
   password: 'root',
   database: 'prescripciones_colgate'
});

module.exports = mysqlConnection;