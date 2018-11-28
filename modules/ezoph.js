/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */

/**
 * A number, or a string containing a number.
 * @typedef {(number|string)} numberLike
 */

//Private constants
var C = {
  read      : 'R',
  calLow    : 'Cal,low,4.00',
  calMid    : 'Cal,mid,7.00',
  calHigh   : 'Cal,high,10.00',
  readTime  : 900, //It takes 900ms to do a read
  otherTime : 300, //It takes 300ms to do most other things
};

/**
 * Communicate with the EZO pH device and sensor
 * @module ezoph
 * 
 * @property {Object} i2c - an i2c object
 * @property {number} address - address of the device
 * @property {numberLike} ph - the last pH value read
 * @property {number} timeout - the time taken to carry out operation, in ms. defaults to 900, the longest time needed for any operation.
 * @returns {numberLike} value - the output of the device. this can be anything from the pH to the current status of the device.
 */
function ezoph(i2c, address) {
  this.i2c = i2c;
  this.address = address;
  this.ph = 0;
  this.timeout = 900;
}
exports = ezoph;

/**
 * Public Constants (mainly used for debugging)
 */
ezoph.prototype.C = {

};

/** ------------------ Common functions --------------------- */

/**
 * Reads ph
 * @method  ezoph/read
 * @returns {numberLike} data - value returned from device
 */
ezoph.prototype.read = function(callback) {
  this.sendCommand(C.read);
  this.getData(callback, this.timeout);
};

/**
 * Single point calibration at midpoint
 * @method ezoph/calMid
 * @returns {numberLike} data - 1 if successful 2,254,255 if unsuccessful
 */
ezoph.prototype.calMid = function() {
  this.sendCommand(C.calMid);
  return this.getData();
};

/**
 * Two point calibration at low point
 * @method ezoph/calLow
 * @returns {numberLike} data - 1 if successful, 2,254,255 if unsuccessful
 */
ezoph.prototype.calLow = function() {
  this.sendCommand(C.calLow);
  return this.getData();
};

/**
 * Three point calibration at high point
 * @method ezoph/calHigh
 * @returns {numberLike} data - 1 if successful, 2,254,255 if unsuccessful
 */
ezoph.prototype.calHigh = function() {
  this.sendCommand(C.calHigh);
  return this.getData();
};

/**
 * Sends specific command to ezo ph circuit
 * @function ezoph/command
 * @param {function} callback
 * @param {numberLike} comm - command to send to circuit, ie. 'sleep', or 'i'
 * @returns {numberLike} data - 1 if successful, 2,254,255 if unsuccessful
 */
ezoph.prototype.command = function(callback, comm) {
  this.sendCommand(comm);
  this.getData(callback, this.timeout);
};

/** ------------------ Helper functions --------------------- */

/**
 * Clears the command and data arrays (used before sending a new command)
 * @function ezoph/clear
 */
ezoph.prototype.clear = function() {
  this.C.command = [];
  this.C.data = [];
};

/**
 * Read a command as a string
 * @method ezoph/sendCommand
 * @param {numberLike} comm - the command that the device will carry out
 */
ezoph.prototype.sendCommand = function(comm) {
  //initialize arrays for debugging
  this.clear();
  //send command to device
  this.i2c.writeTo(this.address, comm);

  this.C.command = comm;
/*  this.C.getData();

  return this.ph;*/
};

/**
 * Retreive data from device
 * @method ezoph/getData
 * @param {function} callback - value of the data reived from device
 * @param {int} timeout - the amount of time needed for the device to complete function. minimum is 900
 */
ezoph.prototype.getData = function(callback, timeout) {
  //receive data from device after 900ms
  var self = this;
  if (timeout === undefined) { timeout = C.readTime; }
  var addr = self.address;
  if ( self.C.command.toLowerCase() != "sleep" ) {
    setTimeout(function() {

      var data = self.i2c.readFrom(addr, 21);

      //changes received data to a string
      var strArray = [];
      if (data[0] == 1) {
        for ( i=1; i<data.length; i++ ) {
          if (data[i]!==0) {
            strArray.push(String.fromCharCode(data[i]));
          }
        }
      }
      self.C.data = data; 
      self.ph = strArray.join("");
      //concatenates the string so that it actually looks like a srting rather than an array
      callback(self.ph);
    },timeout);
  } else {
     callback(null); 
  }
};

/** ---------------------- Exports ------------------------- */

/** 
 * This is 'exported' so it can be used with `require('ezoph.js').connect(pin1,pin2)`
 * @example <caption>How to use ezoph module</caption>
 * //create a new instance of ph sensor
 * var i2c = new I2C();     // create new i2c object
 * var phAddress = 0x63;    // EZO pH i2c address
 * var sda = D23;           // setup i2c pins
 * var scl = D22;
 * i2c.setup({              // setup I2C bus
 *   scl:scl,
 *   sda:sda
 * });
 * phSensor = new ( require('ezoph') )( i2c, phAddress );
 */
exports.connect = function(i2c, address) {
  return new ezoph(i2c,address);
};
