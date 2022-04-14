const connection = require('./connection.js');
var newPromise = new Promise((resolve, reject) => {
  connectDatabase()
    .then(() => {
      return createDatabase();
    })
    .then(() => {
      return createUserTable();
    })
    .then(() => {
      return createMessageTable();
    })
    .then(resolve)
    .catch(reject);
});
function connectDatabase() {
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        return reject(err);
      } else {
        console.log('DATABASE CONNECTED SUCCESSFULLY')
        return resolve();
      }
    })
  });
}
function createDatabase() {
  return new Promise((resolve, reject) => {
    connection.query(`CREATE DATABASE IF NOT EXISTS chatapplication`, (err) => {
      if (err) {
        return reject(err);
      } else {
        console.log('CREATED DATABASE SUCCESSFULLY')
        return resolve();
      }
    })
  });
}
function createUserTable() {
  return new Promise((resolve, reject) => {
    connection.query(`CREATE TABLE IF NOT EXISTS chatapplication.user (id int(11) NOT NULL AUTO_INCREMENT, name varchar(255) NOT NULL , 
    email varchar(255) NOT NULL , password varchar(255) NOT NULL, PRIMARY KEY (id))`, (err) => {
      if (err) {
        return reject(err);
      } else {
        console.log('CREATED USER TABLE SUCCESSFULLY')
        return resolve();
      }
    })
  });
}
function createMessageTable() {
  return new Promise((resolve, reject) => {
    connection.query(`CREATE TABLE IF NOT EXISTS chatapplication.message_history (id int(11) NOT NULL AUTO_INCREMENT, text varchar(1024) NOT NULL , 
    username varchar(255) NOT NULL, PRIMARY KEY (id))`, (err) => {
      if (err) {
        return reject(err);
      } else {
        console.log('CREATED MESSAGE HISTORY TABLE SUCCESSFULLY')
        return resolve();
      }
    })
  });
}
newPromise
  .then(() => {
    return Promise.resolve();
  })
  .then(() => {
    return process.exit(0)
  })
  .catch((err) => {
    return Promise.reject(err);
  })
