const dgram = require('dgram');
const work_module = require('./work_functions');

module.exports = function(work_registers, udp_name) {
  var udp_module = {};

  var handlerFunction;
  if (udp_name == 'udp4') {
    handlerFunction = work_module.getInfoFromFastUDP;
  } else {
    handlerFunction = work_module.getInfoFromUDPPacket;
  };

  udp_module.server = dgram.createSocket('udp4');

  udp_module.server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    udp_module.server.close();
  });

  udp_module.server.on('message', (msg, rinfo) => {
    var intViewUDP = handlerFunction(msg, work_registers);
    work_registers[udp_name + '_status'] = 'active';
    //console.log(`server got from ${udp_name} : ${rinfo.address}:${rinfo.port} - ${rinfo.size} bytes: ${intViewUDP}`);
  });

  udp_module.server.on('listening', () => {
    const udp_address = udp_module.server.address();
    console.log(`listening udp-socket on: ${udp_address.address}:${udp_address.port}`);
  });

  return udp_module;
};

