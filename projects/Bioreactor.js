/**
 * Bioreactor code setup
 */
/***** Imports *****/
var wifi = require('Wifi');
var http = require('http');

/***** Setup Communication Protocols *****/
var i2c = new I2C();
var spi = new SPI();
var phAddress = 0x63;   // EZO pH i2c address
var co2Address = 0x4d;  // mh-z16 I2C/UART bridge address

// I2C pins
var sda = NodeMCU.D3;
var scl = NodeMCU.D2;

// SPI pins
var miso = NodeMCU.D5;
var cs = NodeMCU.D6; 
var sck = NodeMCU.D7;

// setup I2C bus
i2c.setup({
  scl:scl,
  sda:sda
});

P = new (require('ezoph'))( i2c, phAddress );
C = new (require('mh_z16'))( i2c, co2Address );
T = new (require('max31855k'))( spi, sck, miso, cs );

C.begin(); // initialize the co2 Sensor
T.begin(); //initialise temperature sensor
// measure the CO2 concentration every 10 seconds
var readCO2 = setInterval(function(){C.measure( () => {});}, 2000 );
// measure the temperature
var readTemp = setInterval(() => {T.readC();}, 2000);
// measure pH
var readPH = setInterval(() => {P.read(() => {});}, 2000);
//actuators
var actuators = {
  temp : NodeMCU.D4,
  co2  : NodeMCU.D8,
  tempOn: getTime(),
  tempOff:getTime(),
  co2On: getTime(),
  co2Off: getTime(),
  tempStatus : false,
  co2Status : false
};

var bioData = {
  ph   : 0,
  co2  : 0,
  temp : 0
};

var updateData = setInterval(() => {
  bioData.co2 = C.ppm;
  bioData.temp = T.temp;
}, 4000);

var updateActuators = setInterval(() => {
  actuators.temp = !actuators.tempStatus;
  actuators.co2 = !actuators.co2Status;

  if (!actuators.tempStatus
      && bioData.temp < 35
      && getTime()-actuators.tempOff >=14) {
    digitalWrite(NodeMCU.D0, true);
    actuators.tempStatus = true;
    actuators.tempOn = getTime();
    console.log('on');
  }
  if (actuators.tempStatus
      && bioData.temp >= 35
      && getTime()-actuators.tempOn>=7) {
    digitalWrite(NodeMCU.D0, false);
    actuators.tempStatus = false;
    actuators.tempOff = getTime();
    console.log('off');
  }
}, 1000);