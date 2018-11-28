/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */
/**
 * A number, or a string containing a number.
 * @typedef {Object} pin
 */

/**
 * Communicate with the MAX38155k device and sensor
 * @module max38155k
 * 
 * @param {Object} spi - an SPI object
 * @param {pin} sck - the pin that the spi clock is connected to
 * @param {pin} miso - the pin that the spi MISO connected to
 * @param {pin} cs - chip select for the device
 *
 * @property {number} temp - the last temperature that the sensor recorded
 * @property {Array} data - the array that holds the data from the sensor (for debug)
 */

function max38155k(/*=SPI*/spi, /*=PIN*/sck, /*=PIN*/miso, /*=PIN*/cs) {
  this.spi = spi;
  this.miso = miso
  this.sck = sck;
  this.cs = cs;
  this.temp = 0;
  this.data
}

/** 
 * This is 'exported' so it can be used with `require('max31855k.js').connect(pin1,pin2)`
 * @example <caption>How to use max31855k module</caption>
 * //create a new instance of ph sensor
 * var spi = new SPI();     // create new spi object
 * var phAddress = 0x63;    // EZO pH i2c address
 * var miso = D25;          // setup spi pins
 * var cs = D33;
 * var sck = D32;
 * tempSensor = new ( require('max31855k') )( spi, sck, miso, cs );
 */
exports = max38155k;

/**
 * Initialize the spi bus (only needs to be run once)
 * @function ezoph/begin
 */
max38155k.prototype.begin = function() {
  this.spi.setup({miso:this.miso, sck:this.sck});
}

/**
 * Reads temperature in Celsius
 * @method ezoph/readC
 * @returns {number} temp - the current temparature read from the sensor in Celsius
 */
max38155k.prototype.readC = function() {
  this.data = this.spi.send([0,0,0,0], cs);
  this.temp = this.data[0]<<24 | this.data[1]<<16 | this.data[2]<<8 | this.data[3];

  if (this.temp & 0x7) {
    return NaN;
  }

  if (this.temp & 0x80000000) {
    this.temp = 0xffffc000 | ((this.temp>>18) & 0x0003ffff);
  } else {
    this.temp>>=18;
  }

  this.temp = this.temp/4;

  return this.temp;
};

/**
 * Reads temperature in Farenheit
 * @method ezoph/readF
 * @returns {number} temp - the current temparature read from the sensor in Farenheit
 */
max38155k.prototype.readF = function() {
  return (this.readTempC()*9/5) + 32;
};

/**
 * Reads temperature in Kelvin
 * @method ezoph/readK
 * @returns {number} temp - the current temparature read from the sensor in Kelvin
 */
max38155k.prototype.readK = function() {
  return this.readTempC() + 273.15;
};

/**
 * Reads temperature in Rankine
 * @method ezoph/readR
 * @returns {number} temp - the current temparature read from the sensor in Rankine
 */
max38155k.prototype.readR = function() {
  return this.readTempK()*9/5;
};
