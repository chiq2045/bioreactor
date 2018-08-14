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

phSensor = new (require('ezoph'))( i2c, phAddress );
co2Sensor = new (require('mh_z16'))( i2c, co2Address );
tempSensor = new (require('max31855k'))( spi, sck, miso, cs );
