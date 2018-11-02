/*eslint no-undef: "error"*/
/*eslint-env node*/

'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const http = require('http');
const http_server = http.createServer(app);

const settings = require('./settings');
console.log(settings);

const deltaIP = settings.deltaIP;
var deltaRegisters = {'udp1_status' : 'stop', 'udp2_status' : 'stop'};
var real_time_sensors = {};

var udp1 = require('./udp.server')(deltaRegisters, 'udp1');
var udp2 = require('./udp.server')(deltaRegisters, 'udp2');
var udp3 = require('./udp.server')(deltaRegisters, 'udp3');
var udp4 = require('./udp.server')(real_time_sensors, 'udp4');

function sendDataToDelta(udp, sending_data){
  var udp_info = udp.address();
  var sending_buffer = new Int16Array(sending_data);
  var message = Buffer.from(sending_buffer.buffer);
  udp.send(message, 0, message.length, udp_info.port, deltaIP, function(err, bytes) {
    console.log ('sending ' + bytes + ' bytes to ' + deltaIP + ':' + udp_info.port);
  });
}

http_server.on('listening', () => {
  const address = http_server.address();
  console.log(`listening http request on: ${address.address}:${address.port}`);
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/info', (req, res, next) => {
  res.json(deltaRegisters);
});

app.get('/writeDOutputs', (req, res, next) => {
  var data = req.query.dOutputs;
  console.log(data);
  if (data && data.length > 0) {
    sendDataToDelta(udp1.server, data);
  }
  res.json(data);
});

app.use('/', express.static(__dirname + '/'));
app.use(bodyParser.json());

http_server.listen(settings.HTTP_PORT);

udp1.server.bind(settings.UDP1_PORT);
udp2.server.bind(settings.UDP2_PORT);
udp3.server.bind(settings.UDP3_PORT);
udp4.server.bind(settings.UDP4_PORT);

var log_timer = setInterval( () => {
  deltaRegisters.udp1_status = test_connection(deltaRegisters.udp1_status);
  deltaRegisters.udp2_status = test_connection(deltaRegisters.udp2_status);
}, settings.LOG_TIMER_INTERVAL);

var test_connection = (udp_status) => {
  console.log(udp_status);
  if (udp_status == 'active') {
    return 'checking';
  }
  return 'stop';
};


