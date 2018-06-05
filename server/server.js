// index.js
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');


const server = require('http').createServer(app);
const io = require('socket.io')(server);
// const io = require('socket.io')(3000);
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

app.use(bodyParser.json()); // for parsing application/json

const corsOptions = {
  origin: [ 
  	'http://localhost:4200',
    'http://localhost:8091',
    'https://youoke.party'],
  optionsSuccessStatus: 200 
}
app.options('*', cors(corsOptions)) // cors for all options pre-flight requests

app.use(express.static(__dirname + '/../dist/partyline'));
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/../dist/partyline/index.html'));
});

//SOCKET STUFF
io.on('connection', (socket) => {
  console.log('socket connection! socket:',socket.id);
  socket.emit('o hai', { hello: 'world' });
  // socket.broadcast.emit('hello', 'to all clients except sender');
  // socket.to('room42').emit('hello', "to all clients in 'room42' room except sender");
  socket.on('event', function(data){ console.log('event data:',data)});
  socket.on('disconnect', function(){ console.log('DISCONNECT! socket:',socket.id) });
});

//boot.
server.listen(process.env.PORT || 8091);
console.log(`listening on http://localhost:${process.env.PORT || 8091}`);
