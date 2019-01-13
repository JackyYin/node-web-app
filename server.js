'use strict';

const app = require('express')();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const socketAuth = require('socketio-auth');
const User = require('./models/user');
const redis = require('./redis');

require("./passportStrategy")(passport);

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

mongoose.connect('mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin' );

//middleware
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(function (req, res, next) {
  console.log('Time:', Date.now());
  next();
});

//route definition
const routes = require("./routes");

app.use("/api/v1/auth", routes.auth);

app.get('/', (req, res) => {
  res.send('Hello world\n');
});

app.get('/index.html', (req, res) => {
  res.sendFile('/usr/app/src/index.html');
});

const server = app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

const io = require('socket.io').listen(server);

// dummy user verification
async function verifyUser (email, password) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({ email: email }).exec();

    if (!user) {
      return reject('USER_NOT_FOUND');
    }

    user.comparePassword(password, (err, passwordMatch) => {
      if (passwordMatch) {
        return resolve(user);
      } else {
        console.log(err);
        return reject('INCORRECT_PASSWORD');
      }
    });
  });
};

socketAuth(io, {
  authenticate: async (socket, data, callback) => {
    const { email, password } = data;

    try {
      const user = await verifyUser(email, password);
      const canConnect = await redis
        .setAsync(`users:${user.email}`, socket.id, 'NX', 'EX', 30);
  
      if (!canConnect) {
        return callback({ message: 'ALREADY_LOGGED_IN' });
      }

      socket.user = user;

      return callback(null, true);
    } catch (e) {
      console.log(`Socket ${socket.id} unauthorized.`);
      return callback({ message: 'UNAUTHORIZED' });
    }
  },
  postAuthenticate: (socket) => {
    console.log(`Socket ${socket.id} authenticated.`);

    socket.conn.on('packet', async (packet) => {
      if (socket.auth && packet.type === 'ping') {
        await redis.setAsync(`users:${socket.user.email}`, socket.id, 'XX', 'EX', 30);
      }
    });
  },
  disconnect: async (socket) => {
    console.log(`Socket ${socket.id} disconnected.`);

    if (socket.user) {
      await redis.delAsync(`users:${socket.user.email}`);
    }
  },
});

var players = {};

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} connected.`);

  players[socket.id] = {
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  };

  socket.emit('currentPlayer', players[socket.id]);

  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.emit('currentPlayers', players);

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected.`);
    socket.broadcast.emit('playerLeft', players[socket.id]);
  });
});
