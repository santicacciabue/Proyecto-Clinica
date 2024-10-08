import mysql from "promise-mysql";
// poder conectarme a la BD
import config from "./../config";

const connection = mysql.createConnection({
    host: config.host,
    database: config.database,
    user: config.user,
    password: config.password
});

const getConnection = () => {
    return connection;
}

module.exports = {
    getConnection
}