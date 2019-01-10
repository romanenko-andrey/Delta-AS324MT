/*eslint no-undef: "error"*/
/*eslint-env node*/

'use strict';

const settings = require('./settings');
var moment = require('moment');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const http_server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: settings.WS_PORT})
var ws_connection;

const deltaIP = settings.deltaIP;
const deltaRegisters = {
    'udp1_status' : 'stop', 
    'udp2_status' : 'stop', 
    'udp3_status' : 'stop'
  };

const real_time_sensors = {'udp4_status' : 'stop'};

const udp1 = require('./udp.server')(deltaRegisters, 'udp1');
const udp2 = require('./udp.server')(deltaRegisters, 'udp2');
const udp3 = require('./udp.server')(deltaRegisters, 'udp3');
const udp4 = require('./udp.server')(real_time_sensors, 'udp4');

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

var c_i = 0;
var log_timer = setInterval( () => {
  var test_connection = (stat) => stat == "active" ? "checking" : "stop";
  var dr = deltaRegisters;
  var rs = real_time_sensors;

  console.log(moment().format('LTS'), dr.udp1_status, dr.udp2_status, dr.udp3_status, rs.udp4_status);

  dr.udp1_status = test_connection( dr.udp1_status );
  dr.udp2_status = test_connection( dr.udp2_status );
  dr.udp3_status = test_connection( dr.udp3_status );
  rs.udp4_status = test_connection( rs.udp4_status );

  if (ws_connection) {
    c_i += 1;
    deltaRegisters.ws_count = c_i;
  }
}, settings.LOG_TIMER_INTERVAL);

var send_to_ws = function(){
  if (ws_connection) {
    ws_connection.send(JSON.stringify(deltaRegisters));
  }
}

var prepare_data = function(data){
  var arr = data.split(',');
  if (arr[0] == 'UDP1') {
    arr.shift();
    arr = arr.map( function(d) {
      let n = parseInt(d);
      return isNaN(n) ? -1 : n
    }); 

    const MAX_OUTPUT_BUFFER = 30;
    for (let i = arr.length; i < MAX_OUTPUT_BUFFER; i++){
      arr.push(-1);
    };
    return arr
  }  
  return null;
}

wss.on('connection', client => {
  ws_connection = client;

  udp1.server.on('message', (msg, rinfo) => {
    //console.log(`server got from msg: `);
    send_to_ws();
  });

  ws_connection.on('message', data => {
    console.log(`Received message => ${data}`);
    var res = prepare_data(data);
    console.log( res );
    if (res){
      sendDataToDelta(udp1.server, res);
    };  
  })

  ws_connection.onclose = function() {
    console.log('echo-protocol Client Closed');
    ws_connection = null;
  }
  
  ws_connection.send('ho!')

});


  
//console.log(settings.WS_PORT);
//process.exit(1);



