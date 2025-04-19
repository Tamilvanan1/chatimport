import mysql from 'mysql2/promise';


export const dataBase = mysql.createPool({
    host     : '127.0.0.1',
    user     : 'root',
    password : '#Tamil27vkl',
    database : 'tamildb'
});

