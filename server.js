/* eslint-disable no-console */
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
  res.sendFile(__dirname + '/index.html');
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

app.use('/', express.static(__dirname + '/'));
app.use(bodyParser.json());

http_server.listen(settings.HTTP_PORT);

udp1.server.bind(settings.UDP1_PORT);
udp2.server.bind(settings.UDP2_PORT);
udp3.server.bind(settings.UDP3_PORT);
udp4.server.bind(settings.UDP4_PORT);


var virtual_reg = JSON.parse('{"udp1_status":"active","udp2_status":"active","udp3_status":"active","AI25":-3,"AI26":12352,"AI27":7222,"AI28":0,"AI29":0,"AI30":0,"AI31":0,"DOY0":21845,"DOY1":37451,"DOY2":55663,"DOY3":61166,"DOY4":43690,"DIX0":0,"DIX1":128,"DIX2":0,"AO01":10223,"AO02":27252,"AO03":6389,"AO04":8000,"AO05":10000,"AO06":12000,"AO07":14000,"AO08":16000,"AO09":18000,"AO10":20000,"udp2_packets":1674,"AO11":22000,"AO12":24000,"AO13":26000,"AO14":28000,"AO15":30000,"AO16":32000,"AI32":0,"AI33":0,"AI34":0,"AI35":0,"GTCN":3736940,"udp3_packets":1674,"AI00":6364,"AI01":-9,"AI02":-4,"AI03":-8,"AI04":6346,"AI05":1,"AI06":-6,"AI07":15886,"AI08":-10,"AI09":-5,"AI10":18580,"AI11":12718,"AI12":6389,"AI13":11801,"AI14":25336,"AI15":22578,"AI16":-14,"AI17":-11,"AI18":3900,"AI19":4566,"AI20":6390,"AI21":11715,"AI22":5010,"AI23":19252,"AI24":-6,"udp1_packets":1674,"ws_count":368}');


var c_i = 0;
var log_timer = setInterval( () => {
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
    c_i += 1;
    deltaRegisters.ws_count = c_i;
    virtual_reg.GTCN = parseInt(virtual_reg.GTCN) + 40;
    virtual_reg.AO01 = parseInt(virtual_reg.AO01) + 200;
    ws_connection.send(JSON.stringify(virtual_reg));
  }
}, settings.LOG_TIMER_INTERVAL);

var sendWStoClient = function(){


  if (ws_connection) {
    //ws_connection.send(JSON.stringify(deltaRegisters));
    //ws_connection.send(virtual_reg);
  }
};

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

  udp1.server.on('message', (msg, rinfo) => {
    if (ws_connection) {
      sendWStoClient();
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



