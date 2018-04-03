/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */

var exports = {};

var C = {
  done : false
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
  this.value = 0;
}

/**
 * Public Constants
 */
ezoph.prototype.C = {
  command : new Array(16),
  ezoTime : 900,
  data    : new Array(21)
};

/**
 * Read a command as a string
 * @param {String} comm - the command that the device will carry out
 */
ezoph.prototype.sendCommand = function(comm) {
  this.clear();
  for ( var i=0; i<comm.length; i++ ) {
    this.C.command[i] = comm[i].charCodeAt(0);
  }

  this.i2c.writeTo(this.address, this.C.command);

  if ( comm.toLowerCase() != "sleep" ) {
    this.getValue();
  }
};

/** ------------------ Helper functions --------------------- */

/**
 * Clears the command array
 */
ezoph.prototype.clear = function() {
  for (i = 0; i < 16; i++) {
    this.command[i] = 0;
  }

  for (i = 0; i < 21; i++) {
    this.data[i] = 0;
  }

  C.done = false;
};

ezoph.prototype.getValue = function() {
  var temp = new Array(20);
  var val;
  setTimeout(function(){C.done = true;},1000);
  this.C.data = this.i2c.readFrom(this.address, 21);

  if (this.data[0] == 1) {
    for ( var i=0; i<data.length-1; i++ ) {
      temp[i] = String.fromCharCode(this.data[i+1]);
    }
  }

  this.value = temp.join("");
};

/** ---------------------- Exports ------------------------- */

/** This is 'exported' so it can be used with `require('ezoph.js').connect(pin1,pin2)` */
exports.connect = function(i2c, address) {
  return new ezoph(i2c,address);
};