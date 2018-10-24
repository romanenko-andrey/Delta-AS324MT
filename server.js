const dgram = require('dgram');

const express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

const app = express();
const http = require('http');
const path = require('path');
var bodyParser = require('body-parser');

var udp1_server = dgram.createSocket('udp4');
var udp2_server = dgram.createSocket('udp4');
const deltaIP = "192.168.1.5";

const http_server = http.createServer(app);

var index = 0;
var int32ViewUDP1,int32ViewUDP2;
var deltaRegisters = {'active' : 'stop'};

udp1_server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  udp1_server.close();
});

function getInfoFromUDPPacket(msg){
  var reg_size = msg.length / 8;
  var int32View = new Int32Array(reg_size);
  for (let i = 0; i < reg_size; i++) {
     int32View[i] = msg.readUInt32LE( i*8+4 );
     deltaRegisters[ msg.slice( i*8, i*8+4 ) ] = int32View[i];
  };
  return int32View;
};

function sendDataToDelta(udp, sending_data){
  var udp_info = udp.address();
  var sending_buffer = new Int16Array(sending_data);
  var message = Buffer.from(sending_buffer.buffer);
  udp.send(message, 0, message.length, udp_info.port, deltaIP, function(err, bytes) {
    console.log ("sending " + bytes + " bytes to " + deltaIP + ":" + udp_info.port);
  });
}

udp1_server.on('message', (msg, rinfo) => {
  int32ViewUDP1 = getInfoFromUDPPacket(msg);
  deltaRegisters['active'] = 'ready';
  //console.log(`json = ${JSON.stringify(deltaRegisters)}`);
  //console.log(`server got message: ${msg}`);
  console.log(`server got from UDP1 ${rinfo.address}:${rinfo.port} - ${rinfo.size} bytes: ${int32ViewUDP1}`);
  //console.log(`from ${rinfo.address}:${rinfo.port} size = ${rinfo.size}`);
});

udp2_server.on('message', (msg, rinfo) => {
  int32ViewUDP2 = getInfoFromUDPPacket(msg);
  deltaRegisters['active'] = 'ready';
  console.log(`server got from UDP2 ${rinfo.address}:${rinfo.port} - ${rinfo.size} bytes: ${int32ViewUDP2}`);
});

udp1_server.on('listening', () => {
  const udp1_address = udp1_server.address();
  console.log(`listening udp-socket-1 on: ${udp1_address.address}:${udp1_address.port}`);
});

udp2_server.on('listening', () => {
  const udp2_address = udp2_server.address();
  console.log(`listening udp-socket-2 on: ${udp2_address.address}:${udp2_address.port}`);
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get("/info", (req, res, next) => {
  res.json(deltaRegisters);
});

app.get("/writeDOutputs", (req, res, next) => {
  var data = req.query.dOutputs;
  console.log(data);
  if (data && data.length > 0) {
    sendDataToDelta(udp1_server, data);
  };
  res.json(data);
});

udp1_server.bind(3000);
udp2_server.bind(3010);
http_server.listen(3030);

http_server.on('listening', () => {
  const address = http_server.address();
  console.log(`listening http request on: ${address.address}:${address.port}`);
});

app.use('/', express.static(__dirname + '/'));

app.use(bodyParser.json());

router.route('/')
