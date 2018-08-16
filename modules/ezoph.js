/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */

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
 * @param {object} i2c - an i2c object
 * @param {int} address - address of the device
 * @returns {string} value - the output of the device
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
 * @returns {String} data - value returned from device
 */
ezoph.prototype.read = function(callback) {
  this.sendCommand(C.read);
  this.getData(callback, this.timeout);
};

/**
 * Single point calibration at midpoint
 * @returns {String} data - 1 if successful, 2,254,255 if unsuccessful
 */
ezoph.prototype.calMid = function() {
  this.sendCommand(C.calMid);
  return this.getData();
};

/**
 * Two point calibration at low point
 * @returns {String} data - 1 if successful, 2,254,255 if unsuccessful
 */
ezoph.prototype.calLow = function() {
  this.sendCommand(C.calLow);
  return this.getData();
};

/**
 * Three point calibration at high point
 * @returns {String} data - 1 if successful, 2,254,255 if unsuccessful
 */
ezoph.prototype.calHigh = function() {
  this.sendCommand(C.calHigh);
  return this.getData();
};

/** ------------------ Helper functions --------------------- */

/**
 * Clears the command array
 */
ezoph.prototype.clear = function() {
  this.C.command = [];
  this.C.data = [];
};

/**
 * Read a command as a string
 * @param {String} comm - the command that the device will carry out
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
 * @callback callback - value of the data reived from device
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

/** This is 'exported' so it can be used with `require('ezoph.js').connect(pin1,pin2)` */
exports.connect = function(i2c, address) {
  return new ezoph(i2c,address);
};
