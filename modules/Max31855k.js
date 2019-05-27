/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */
/**
 * A number, or a string containing a number.
 * @typedef {Object} pin
 */

/**
 * Communicate with the MAX38155k device and sensor
 * @module Max31855k
 * @param {Object} spi - an SPI object
 * @param {pin} sck - the pin that the spi clock is connected to
 * @param {pin} miso - the pin that the spi MISO connected to
 * @param {pin} cs - chip select for the device
 */

function Max31855k(spi, sck, miso, cs) {
  this.spi = spi;
  this.miso = miso;
  this.sck = sck;
  this.cs = cs;

  this.begin();
  this.read();
}

exports = Max31855k;

/**
 * Initialize the spi bus (Must be ran first!)
 * @function ezoph/begin
 */
Max31855k.prototype.begin = function () {
  this.spi.setup({ miso: this.miso, sck: this.sck });
};

/**
 * Reads temperature in Celsius
 * @method ezoph/read
 * @returns {number} temp - the current temparature read from the sensor in Celsius
 */
Max31855k.prototype.read = function () {
  const data = this.spi.send([0, 0, 0, 0], this.cs);
  let temp = (data[0] << 24) | (data[1] << 16) | (data[2] << 8) | (data[3]);

  if (temp & 0x7) {
    return NaN;
  }

  if (temp & 0x80000000) {
    temp = 0xffffc000 | ((temp >> 18) & 0x0003ffff);
  } else {
    temp >>= 18;
  }

  return temp / 4;
};

/**
 * Reads temperature in Farenheit
 * @method ezoph/readF
 * @returns {number} temp - the current temparature read from the sensor in Farenheit
 */
Max31855k.prototype.readF = function () {
  return (this.readTempC() * 9 / 5) + 32;
};

/**
 * Reads temperature in Kelvin
 * @method ezoph/readK
 * @returns {number} temp - the current temparature read from the sensor in Kelvin
 */
Max31855k.prototype.readK = function () {
  return this.readTempC() + 273.15;
};

/**
 * Reads temperature in Rankine
 * @method ezoph/readR
 * @returns {number} temp - the current temparature read from the sensor in Rankine
 */
Max31855k.prototype.readR = function () {
  return this.readTempK() * 9 / 5;
};

exports.connect = function (i2c, address) {
  return new Max31855k(i2c, address);
};
