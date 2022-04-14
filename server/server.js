const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const connection = require('./connection.js');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
io.on('connection', (socket) => {

  socket.on('joining msg', (username) => {
    var name = username;
    io.emit('chat message', `---${name} joined the chat---`);
  });

  socket.on('disconnect', (username) => {
    var name = username;
    io.emit('chat message', `---${name} left the chat---`);

  });
  socket.on('chat message', async (msg) => {
    let username = msg ? msg.split(':')[0].trim() : '';
    let text = msg ? msg.split(':')[1].trim() : '';
    let userCreated = await createMessagingLogs(text, username);
    socket.broadcast.emit('chat message', msg);
  });
});
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, '/../client')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/../client/html/index.html'));
})
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '/../client/html/signupPage.html'));
});
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.psw;
  let hashPassword = '';
  let userName;
  return new Promise((resolve, reject) => {
    let sql = 'select * from chatapplication.user where email=?';
    connection.query(sql, [email], function (err, result) {
      if (err) {
        res.render(path.join(__dirname, '/../client/html/loginpage.html'), { message: 'Error in connection. Please contact support team', userName: '', messageArray: [] });
      }
      let document = result && result[0] ? result[0] : {};
      hashPassword = document && document.password ? document.password : null;
      userName = document && document.name ? document.name.toUpperCase() : null;
      if (hashPassword) {
        if (bcrypt.compareSync(password, hashPassword)) {
          let sql = 'select * from chatapplication.message_history';
          connection.query(sql, [email], function (err, result) {
            if (err) {
              res.render(path.join(__dirname, '/../client/html/loginpage.html'), { message: 'Error in connection. Please contact support team', userName: '', messageArray: [] });
            } else {
              res.render(path.join(__dirname, '/../client/html/loginpage.html'), { message: '', userName: userName, messageArray: result });
            }
          })
        } else {
          res.render(path.join(__dirname, '/../client/html/loginpage.html'), { message: 'Password doesnot match. Please enter correct password', userName: '', messageArray: [] });
        }
      } else {
        res.render(path.join(__dirname, '/../client/html/loginpage.html'), { message: 'User doesnot exist with the given mail', userName: '', messageArray: [] });
      }
    });
  })
});
app.post('/registerNewUser', async (req, res) => {
  let email = req.body.email;
  let password = req.body.psw;
  let userName = req.body.uname;
  userName = userName.toUpperCase();
  const hashPassword = bcrypt.hashSync(password, salt);
  let foundEmail = await checkIfEmailExists(email);
  if (foundEmail.length) {
    res.render(path.join(__dirname, '/../client/html/signupSuccess.html'), { message: 'User Already exists with the given email. Please signup with a new email' });
  } else {
    let newusercreated = await createNewUser(email, hashPassword, userName);
    if (newusercreated) {
      res.render(path.join(__dirname, '/../client/html/signupSuccess.html'), { message: '' });
    } else {
      res.render(path.join(__dirname, '/../client/html/signupSuccess.html'), { message: 'Error while registering user' });
    }
  }
});

server.listen(3000, () => {
  console.log('Server started at http://localhost:3000');
})

function checkIfEmailExists(email) {
  return new Promise((resolve, reject) => {
    let sql = 'select * from chatapplication.user where email=?';
    connection.query(sql, [email], function (err, result) {
      if (err) {
        return reject(err);
      } else {
        return resolve(result);
      }
    });
  });
}

function createNewUser(email, hashPassword, userName) {
  return new Promise((resolve, reject) => {
    let sql = 'INSERT INTO chatapplication.user (email,password,name) values (?,?,?)';
    connection.query(sql, [email, hashPassword, userName], function (err, result) {
      if (err) {
        return reject(err);
      } else {
        return resolve(result);
      }
    });
  })
}

function createMessagingLogs(text, username) {
  return new Promise((resolve, reject) => {
    let sql = 'INSERT INTO chatapplication.message_history (text,username) values (?,?)';
    connection.query(sql, [text, username], function (err, result) {
      if (err) {
        return reject(err);
      } else {
        return resolve(result);
      }
    });
  })
}

