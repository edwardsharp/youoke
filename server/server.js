// index.js
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');


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


//boot.
app.listen(process.env.PORT || 8091);
console.log(`listening on http://localhost:${process.env.PORT || 8091}`);
