var path = require('path');

console.log(path.join(__dirname, '', '.env'));

require('dotenv-safe').load({
  allowEmptyValues: true,
  path: path.join(__dirname, '', '.env'),
  sample: path.join(__dirname, '', '.env.example')
});

const settings = {
  deltaIP   : process.env.deltaIP,
  HTTP_PORT : process.env.HTTP_PORT,
  UDP1_PORT : process.env.UDP1_PORT, 
  UDP2_PORT : process.env.UDP2_PORT, 
  UDP3_PORT : process.env.UDP3_PORT, 
  UDP4_PORT : process.env.UDP4_PORT, 
  LOG_TIMER_INTERVAL : process.env.LOG_TIMER_INTERVAL 
};

module.exports = settings;