// index.js
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const server = require('http').createServer(app);
const io = require('socket.io')(server);
// const io = require('socket.io')(3000);
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));

app.use(bodyParser.json()); // for parsing application/json

const corsOptions = {
  origin: [ 
  	'http://localhost:4201',
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
  socket.emit('is_connected', true);
  // socket.broadcast.emit('hello', 'to all clients except sender');
  // socket.to('room42').emit('hello', "to all clients in 'room42' room except sender");
  socket.on('event', (data) => { 
    console.log('event data:',data)
  });
  socket.on('join_channel', (channel) => { 
    console.log('join_channel data:',channel);
    io.of('/').adapter.allRooms((err, channels) => {
      console.log('all roomz err:',err,' channels:',channels);
      if(err){
        socket.emit('join_channel', false);
      }else if(channels.includes(channel)){
        socket.join(channel);
        socket.emit('join_channel', true);
      }else{
        socket.emit('join_channel', false);
      }
    });
  });
  
  socket.on('create_channel', (data) => {
    const channel_id = crypto.randomBytes(3).toString('hex');
    console.log('create_channel channel_id:',channel_id);
    socket.join(channel_id);
    socket.emit('create_channel', channel_id);
  });
  

  socket.on('disconnect', function(){ console.log('DISCONNECT! socket:',socket.id) });

  // with callback ack
  // socket.emit('ferret', 'tobi', (data) => {
  //   console.log(data); // data will be 'woot'
  // });
  // the client code
  // client.on('ferret', (name, fn) => {
  //   fn('woot');
  // });

});




//boot.
server.listen(process.env.PORT || 8091);
console.log(`listening on http://localhost:${process.env.PORT || 8091}`);
