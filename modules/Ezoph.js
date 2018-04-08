/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */

var exports = {};

//Private constants
var C = {
  read : 'R',
  
};

/**
 * Communicate with the EZO pH device and sensor
 * @param {object} i2c - an i2c object
 * @param {int} address - address of the device
 * @returns {string} value - the output of the device
 */
function Ezoph(i2c, address) {
  this.i2c = i2c;
  this.address = address;
  this.value = 0;
}

/**
 * Public Constants (mainly used for debug
 */
Ezoph.prototype.C = {
  command : new Array(16),
  data    : new Array(21)
};

/**
 * Read a command as a string
 * @param {String} comm - the command that the device will carry out
 */
Ezoph.prototype.sendCommand = function(comm) {
  //initialize array
  var cmd = [];

  //populate the command array
  for ( var i=0; i<comm.length; i++ ) {
    cmd.push(comm[i].charCodeAt(0));
  }

  //send command to device
  this.i2c.writeTo(this.address, cmd);

  this.C.command = cmd;
};

Ezoph.prototype.getData = function() {
  //initialaize array
  var data = [];

  //receive data from device after 900ms
  if ( comm.toLowerCase() != "sleep" ) {
    setTimeout(function() {
      data.push(this.i2c.readFrom(this.address, 21));},900);
  }

  //changes received data to a string
  var strArray = [];
  if (data[0] == 1) {
    for ( i=1; i<data.length; i++ ) {
      strArray.push(String.fromCharCode(data[i]));
    }
  }

  //concatenates the string so that it actually looks like a srting rather than an array
  this.value = strArray.join("");
};

/** ------------------ Helper functions --------------------- */

/**
 * Clears the command array
 */
Ezoph.prototype.clear = function() {
  for (i = 0; i < 16; i++) {
    this.C.command[i] = 0;
  }

  for (i = 0; i < 21; i++) {
    this.C.data[i] = 0;
  }

  C.done = false;
};

Ezoph.prototype.getValue = function() {
  var temp = new Array(20);
  var val;
  setTimeout(function(){C.done = true;},3000);
  this.C.data = this.i2c.readFrom(this.address, 21);

  //changes received data to a string
  if (this.C.data[0] == 1) {
    for ( var i=0; i<this.C.data.length-1; i++ ) {
      temp[i] = String.fromCharCode(this.C.data[i+1]);
    }
  }

  //concatenates the string so that it actually looks like a srting rather than an array
  this.value = temp.join("");
};

/** ---------------------- Exports ------------------------- */

/** This is 'exported' so it can be used with `require('Ezoph.js').connect(pin1,pin2)` */
exports.connect = function(i2c, address) {
  return new Ezoph(i2c,address);
};

