/* eslint-disable no-console */
/*eslint no-undef: "error"*/
/*eslint-env node*/

'use strict';

const settings = require('./settings');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const http_server = http.createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: settings.WS_PORT});
var ws_connection;

const deltaIP = settings.deltaIP;
const deltaRegisters = {
  'udp1_status': 'stop',
  'udp2_status': 'stop',
  'udp3_status': 'stop'
};

const real_time_sensors = {'udp4_status' : 'stop'};

const udp1 = require('./udp.server')(deltaRegisters, 'udp1');
const udp2 = require('./udp.server')(deltaRegisters, 'udp2');
const udp3 = require('./udp.server')(deltaRegisters, 'udp3');
const udp4 = require('./udp.server')(real_time_sensors, 'udp4');

function sendDataToDelta(udp, sending_data){
  var udp_info = udp.address();
  var sending_buffer = new Int16Array(sending_data);
  var msg = Buffer.from(sending_buffer.buffer);
  udp.send(msg, 0, msg.length, udp_info.port, deltaIP, function(_, n) {
    console.log('sending ' + n + ' bytes to ' + deltaIP + ':' + udp_info.port);
  });
}

http_server.on('listening', () => {
  const address = http_server.address();
  console.log(`listening http request on: ${address.address}:${address.port}`);
});

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/info', (req, res) => {
  res.json(deltaRegisters);
});

app.get('/writeDOutputs', (req, res) => {
  var data = req.query.dOutputs;
  console.log(data);
  if (data && data.length > 0) {
    sendDataToDelta(udp1.server, data);
  }
  res.json(data);
});

app.use('/', express.static(path.join(__dirname, '/public')));
app.use(bodyParser.json());

http_server.listen(settings.HTTP_PORT);

udp1.server.bind(settings.UDP1_PORT);
udp2.server.bind(settings.UDP2_PORT);
udp3.server.bind(settings.UDP3_PORT);
udp4.server.bind(settings.UDP4_PORT);


var virtual_reg = {};
fs.readFile(path.join(__dirname,'/deltaRegistresExample.json'), (err, data) => {
  virtual_reg = err ? {'error': 'no find json example file'} : JSON.parse(data);
});


setInterval( () => {
  var testConnection = (stat) => stat == 'active' ? 'checking' : 'stop';
  var dr = deltaRegisters;
  var rs = real_time_sensors;

  console.log(moment().format('LTS'), 
    'UDP1', dr.udp1_status, '& get', dr.udp1_packets, 'pkgs; ',
    'UDP2', dr.udp2_status, '& get', dr.udp2_packets, 'pkgs; ',
    'UDP3', dr.udp3_status, '& get', dr.udp3_packets, 'pkgs; ',
    'UDP4', rs.udp4_status, '& get', rs.udp4_packets, 'pkgs; ');

  dr.udp1_status = testConnection( dr.udp1_status );
  dr.udp2_status = testConnection( dr.udp2_status );
  dr.udp3_status = testConnection( dr.udp3_status );
  rs.udp4_status = testConnection( rs.udp4_status );

  if (ws_connection) {
    virtual_reg.GTCN = parseInt(virtual_reg.GTCN || 0) + 40;
    //uncomment all for virtual PLC
    //virtual_reg.AO01 = parseInt(virtual_reg.AO01 || 0) + 50;
    //ws_connection.send(JSON.stringify(virtual_reg));
  }
}, settings.LOG_TIMER_INTERVAL);

var prepareData = function(data){
  var arr = data.split(',');
  if (arr[0] == 'UDP1') {
    arr.shift();
    arr = arr.map( function(d) {
      let n = parseInt(d);
      return isNaN(n) ? -1 : n;
    }); 

    const MAX_OUTPUT_BUFFER = 30;
    for (let i = arr.length; i < MAX_OUTPUT_BUFFER; i++){
      arr.push(-1);
    }
    return arr;
  }  
  return null;
};

wss.on('connection', client => {
  ws_connection = client;

  udp1.server.on('message', () => {
    if (ws_connection) {
      //sendWStoClient();
      ws_connection.send(JSON.stringify(deltaRegisters));
    }
  });

  ws_connection.on('message', data => {
    console.log(`Received message => ${data}`);
    var res = prepareData(data);
    console.log( res );
    if (res){
      sendDataToDelta(udp1.server, res);
    }  
  });

  ws_connection.onclose = function() {
    console.log('echo-protocol Client Closed');
    ws_connection = null;
  };
});


  
//console.log(settings.WS_PORT);
//process.exit(1);



