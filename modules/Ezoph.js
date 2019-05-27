/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */

/**
 * preset constants to make the code more readable
 * @private
 */
const C = {
  read: 'R',
  calLow: 'Cal,low,4.00',
  calMid: 'Cal,mid,7.00',
  calHigh: 'Cal,high,10.00',
  readTime: 900, // It takes 900ms to do a read
  otherTime: 300, // It takes 300ms to do most other things
};

/**
 * Communicate with the EZO pH device and sensor
 * @module Ezoph
 * @param {Object} i2c - an i2c object
 * @param {number} address - address of the device
 * @property {Object} i2c - an i2c object
 * @property {number} address - address of the device
 * @property {number} timeout - the time given for operation
 */
function Ezoph(i2c, address) {
  this.i2c = i2c;
  this.address = address;
  this.timeout = 900;

  this.read();
  this.calLow();
  this.calMid();
  this.calHigh();
  this.getSlope();
}
exports = Ezoph;

/**
 * Public Constants (mainly used for debugging)
 */
Ezoph.prototype.C = {

};

/** ------------------ Common functions --------------------- */

/**
 * Reads ph
 * @method Ezoph/read
 * @param {requestCallback} callback - handles the response
 */
Ezoph.prototype.read = function (callback) {
  this.sendCommand(C.read);
  this.getResponse(callback);
};

/**
 * Single point calibration at midpoint
 * @method Ezoph/calMid
 */
Ezoph.prototype.calMid = function () {
  this.sendCommand(C.calMid);
  this.getResponse();
};

/**
 * Two point calibration at low point
 * @method Ezoph/calLow
 */
Ezoph.prototype.calLow = function () {
  this.sendCommand(C.calLow);
  this.getResponse();
};

/**
 * Three point calibration at high point
 * @method Ezoph/calHigh
 */
Ezoph.prototype.calHigh = function () {
  this.sendCommand(C.calHigh);
  this.getResponse();
};

/**
 * Returns the slope of the pH probe
 * @method Ezoph/getSlope
 */
Ezoph.prototype.getSlope = function (callback) {
  this.sendCommand('Slope,?');
  this.getResponse(callback);
};

/** ------------------ Helper functions --------------------- */
// These functions are not supposed to be called externally except for debug

/**
 * Sends command to device
 * @function Ezoph/command
 * @param {String} comm - command to sed
 * @param {requestCallback} callback - a function to handle the response: res=>{console.log(res)}
 */
Ezoph.prototype.sendCommand = function (comm, callback) {
  this.sendCommand(comm);
  this.getResponse(callback);
};

/**
 * Get response from device
 * @method Ezoph/getResponse
 * @param {function} callback
 */
Ezoph.prototype.getResponse = function (callback) {
  const self = this;
  const { address } = self;
  let data;
  const arraySize = 21; // max size of array expeocted from device
  setTimeout(() => {
    data = self.i2c.readFrom(address, arraySize);
    callback(self.asciiToString(data));
  }, this.timeout);
};

/**
 * Changes ASCII array to string
 * @method Ezoph/asciiToString
 * @param {Array} data
 * @returns {String}
 */
Ezoph.prototype.asciiToString = function (data) {
  const array = [];
  if (data[0] === 1) {
    // Don't know how to deal with the error of accessing data from unidentified
    for (let i = 1; i < data.length; i += 1) {
      if (data[i] !== 0) {
        array.push(String.fromCharCode(data[i]));
      }
    }
  }
  return array.join('');
};

/** ---------------------- Exports ------------------------- */

/**
 * @example <caption>How to use Ezoph module</caption>
 * const i2c = new I2C();     // create new i2c object
 * const phAddress = 0x63;    // EZO pH i2c address
 * const sda = D23;           // setup i2c pins
 * const scl = D22;
 * i2c.setup({              // setup I2C bus
 *   scl:scl,
 *   sda:sda
 * });
 * let phSensor = require('Ezoph').( i2c, phAddress );
 */
exports.connect = function (i2c, address) {
  return new Ezoph(i2c, address);
};
