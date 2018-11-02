var work_functions = {};

work_functions.getInfoFromUDPPacket = (msg, dest) => {
  var reg_size = msg.length / 8;
  var int32View = new Int32Array(reg_size);
  for (let i = 0; i < reg_size; i++) {
    int32View[i] = msg.readUInt32LE( i*8+4 );
    dest[ msg.slice( i*8, i*8+4 ) ] = int32View[i];
  };
  return int32View;
};

work_functions.getInfoFromFastUDP = (msg, dest) => {
  var reg_size = msg.length / 2;
  var int16View = new Int16Array(reg_size);
  for (let i = 0; i < reg_size; i++) {
    int16View[i] = msg.readUInt16LE( i*2 );
    dest[ i ] = int16View[i];
  };
  return int16View;
};

module.exports = work_functions;