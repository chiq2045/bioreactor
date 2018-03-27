/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */

var C = {
  dataError : 0xFF,
  timeError : 0xFE,
  failed : 0x02,
  success : 0x01,
  error : ["no data to send", "still processing, not ready", "syntax error", "successful request"],
  mode : 0
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
  this.command = new Array(16);
  this.data = new Array(21);
  this.ezoTime = 300;
}

/**
 * Public Constants
 */
ezoph.prototype.C = {
  done : false
};

/**
 * Read the ph
 * @returns {string} value - retuns the ph level
 */
ezoph.prototype.read = function() {
  this.clear();
  this.command[0] = 'R'.charCodeAt(0);
  this.ezoTime = 900;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Get the device status
 * @returns {string} value - retuns the status of the device
 */
ezoph.prototype.deviceStatus = function() {
  this.clear();
  this.command[0] = 'S'.charCodeAt(0);
  this.command[1] = 't'.charCodeAt(0);
  this.command[2] = 'a'.charCodeAt(0);
  this.command[3] = 't'.charCodeAt(0);
  this.command[4] = 'u'.charCodeAt(0);
  this.command[5] = 's'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Get device information
 * @returns {string} value - retuns the status of the device
 */
ezoph.prototype.deviceInfo = function() {
  this.clear();
  this.command[0] = 'i'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Single point calibration at midpoint
 */
ezoph.prototype.calMid = function() {
  this.clear();
  this.command[0] = 'C'.charCodeAt(0);
  this.command[1] = 'a'.charCodeAt(0);
  this.command[2] = 'l'.charCodeAt(0);
  this.command[3] = ','.charCodeAt(0);
  this.command[4] = 'm'.charCodeAt(0);
  this.command[5] = 'i'.charCodeAt(0);
  this.command[6] = 'd'.charCodeAt(0);
  this.command[7] = ','.charCodeAt(0);
  this.command[8] = '7'.charCodeAt(0);
  this.command[9] = '.'.charCodeAt(0);
  this.command[10] = '0'.charCodeAt(0);
  this.command[11] = '0'.charCodeAt(0);
  this.ezoTime = 900;

  this.i2c.writeTo(this.address, this.command);
  setTimeout(function(){
    this.data = this.i2c.readFrom(this.address, 21);
  }, this.ezoTime);

  this.value = this.getEzoValue().join("");
};

/**
 * Two point calibration at lowpoint
 */
ezoph.prototype.calLow = function() {
  this.clear();
  this.command[0] = 'C'.charCodeAt(0);
  this.command[1] = 'a'.charCodeAt(0);
  this.command[2] = 'l'.charCodeAt(0);
  this.command[3] = ','.charCodeAt(0);
  this.command[4] = 'l'.charCodeAt(0);
  this.command[5] = 'o'.charCodeAt(0);
  this.command[6] = 'w'.charCodeAt(0);
  this.command[7] = ','.charCodeAt(0);
  this.command[8] = '4'.charCodeAt(0);
  this.command[9] = '.'.charCodeAt(0);
  this.command[10] = '0'.charCodeAt(0);
  this.command[11] = '0'.charCodeAt(0);
  this.ezoTime = 900;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Three point calibration at highpoint
 */
ezoph.prototype.calHigh = function() {
  this.clear();
  this.command[0] = 'C'.charCodeAt(0);
  this.command[1] = 'a'.charCodeAt(0);
  this.command[2] = 'l'.charCodeAt(0);
  this.command[3] = ','.charCodeAt(0);
  this.command[4] = 'h'.charCodeAt(0);
  this.command[5] = 'i'.charCodeAt(0);
  this.command[6] = 'g'.charCodeAt(0);
  this.command[7] = 'h'.charCodeAt(0);
  this.command[8] = ','.charCodeAt(0);
  this.command[9] = '1'.charCodeAt(0);
  this.command[10] = '0'.charCodeAt(0);
  this.command[11] = '.'.charCodeAt(0);
  this.command[12] = '0'.charCodeAt(0);
  this.command[13] = '0'.charCodeAt(0);
  this.ezoTime = 900;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Delete calibration data
 */
ezoph.prototype.calClear = function() {
  this.clear();
  this.command[0] = 'C'.charCodeAt(0);
  this.command[1] = 'a'.charCodeAt(0);
  this.command[2] = 'l'.charCodeAt(0);
  this.command[3] = ','.charCodeAt(0);
  this.command[4] = 'c'.charCodeAt(0);
  this.command[5] = 'l'.charCodeAt(0);
  this.command[6] = 'e'.charCodeAt(0);
  this.command[7] = 'a'.charCodeAt(0);
  this.command[8] = 'r'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Query the type of calibration
 */
ezoph.prototype.calType = function() {
  this.clear();
  this.command[0] = 'C'.charCodeAt(0);
  this.command[1] = 'a'.charCodeAt(0);
  this.command[2] = 'l'.charCodeAt(0);
  this.command[3] = ','.charCodeAt(0);
  this.command[4] = '?'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Export the calibration string from calibrated device
 * Needs to be called 11 times. Information will be given
 * as ascii string.
 * @returns {array} value - returns example: [59,6F,75,20,61,72]
 * @example
 * var export = new Array(11);
 * for (i = 0; i < export.length; i++) {
 *   export[i] = $ezoph.calExport();
 * }
 */
ezoph.prototype.calExport = function() {
  this.clear();
  this.command[0] = 'E'.charCodeAt(0);
  this.command[1] = 'x'.charCodeAt(0);
  this.command[2] = 'p'.charCodeAt(0);
  this.command[3] = 'o'.charCodeAt(0);
  this.command[4] = 'r'.charCodeAt(0);
  this.command[5] = 't'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Import the calibration string from calibrated device
 * Needs to be called 10 times, once for each 6 byte number
 * @param {array} value - example: value = [59,6F,75,20,61,72]
 * @example
 * $ezoph.calImport(value);
 */
ezoph.prototype.calImport = function(value) {
  this.clear();
  this.command[0] = 'I'.charCodeAt(0);
  this.command[1] = 'm'.charCodeAt(0);
  this.command[2] = 'p'.charCodeAt(0);
  this.command[3] = 'o'.charCodeAt(0);
  this.command[4] = 'r'.charCodeAt(0);
  this.command[5] = 't'.charCodeAt(0);
  this.command[6] = ','.charCodeAt(0);
  this.command[7] = value[0];
  this.command[8] = value[1];
  this.command[9] = value[2];
  this.command[10] = value[3];
  this.command[11] = value[4];
  this.command[12] = value[5];

  this.i2c.writeTo(this.address, this.command);
};

/**
 * Read the slope of the pH probe
 * The slope shows how closely (in percentage) the calibrated
 * pH probe is working compared to the "ideal" pH probe.
 */
ezoph.prototype.slope = function() {
  this.clear();
  this.command[0] = 'S'.charCodeAt(0);
  this.command[1] = 'l'.charCodeAt(0);
  this.command[2] = 'o'.charCodeAt(0);
  this.command[3] = 'p'.charCodeAt(0);
  this.command[4] = 'e'.charCodeAt(0);
  this.command[5] = ','.charCodeAt(0);
  this.command[6] = '?'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Set the temperature compensation
 * The EZO TM pH circuits default temperature compensation is set to
 * 25° C. If the temperature of the calibration solution is +/-2° C
 * from 25° C, consider setting the temperature compensation first.
 * Temperature changes of < 2° C are insignificant.
 * @param {float} value - a float between 10 and 50: one decimal point
 */
ezoph.prototype.temperatureCompensation = function(value) {
  this.clear();
  var val = value;
  if (val < 10 || val > 50) {
    this.value = "temperature must be within range (10 < temp < 50)";
  }
  else {
    var comp = new Array(3);
    for (i = 0; i < comp.length; i++) {
      comp[i] = Math.floor(val%10);
      val = (val-comp[i])*10;
    }
    this.command[0] = 'T'.charCodeAt(0);
    this.command[1] = ','.charCodeAt(0);
    this.command[2] = comp[0]+48;
    this.command[3] = comp[1]+48;
    this.command[4] = '.'.charCodeAt(0);
    this.command[5] = comp[2]+48;
    this.ezoTime = 300;

    this.i2c.writeTo(this.address, this.command);

    this.readValue();
  }
};

/**
 * Query the temperature compensation
 * @returns {string} value - example: ?T,20.2
 */
ezoph.prototype.queryCompensation = function() {
  this.clear();
  this.command[0] = 'T'.charCodeAt(0);
  this.command[1] = ','.charCodeAt(0);
  this.command[2] = '?'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Sends the device to sleep/low power mode
 * Can be woken up by sending any other command
 * When woken it will execute the command given to it
 */
ezoph.prototype.sleep = function() {
  this.clear();
  this.command[0] = 'S'.charCodeAt(0);
  this.command[1] = 'l'.charCodeAt(0);
  this.command[2] = 'e'.charCodeAt(0);
  this.command[3] = 'e'.charCodeAt(0);
  this.command[4] = 'p'.charCodeAt(0);

  this.i2c.writeTo(this.address, this.command);
};

/**
 * Lock device to i2c mode
 */
ezoph.prototype.plockEnable = function() {
  this.clear();
  this.command[0] = 'P'.charCodeAt(0);
  this.command[1] = 'l'.charCodeAt(0);
  this.command[2] = 'o'.charCodeAt(0);
  this.command[3] = 'c'.charCodeAt(0);
  this.command[4] = 'k'.charCodeAt(0);
  this.command[5] = ','.charCodeAt(0);
  this.command[6] = '1'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Unlock device from i2c (if you want to change to UART)
 */
ezoph.prototype.plockDisable = function() {
  this.clear();
  this.command[0] = 'P'.charCodeAt(0);
  this.command[1] = 'l'.charCodeAt(0);
  this.command[2] = 'o'.charCodeAt(0);
  this.command[3] = 'c'.charCodeAt(0);
  this.command[4] = 'k'.charCodeAt(0);
  this.command[5] = ','.charCodeAt(0);
  this.command[6] = '0'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Query whether Protocol Lock is on or off
 * @returns {string} value - example(when plock on) ?Plock,1
 */
ezoph.prototype.queryPlock = function() {
  this.clear();
  this.command[0] = 'P'.charCodeAt(0);
  this.command[1] = 'l'.charCodeAt(0);
  this.command[2] = 'o'.charCodeAt(0);
  this.command[3] = 'c'.charCodeAt(0);
  this.command[4] = 'k'.charCodeAt(0);
  this.command[5] = ','.charCodeAt(0);
  this.command[6] = '?'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Factory Reset
 * Clears calibration, puts LED on, enables Response codes,
 * reboots device
 */
ezoph.prototype.factoryReset = function() {
  this.clear();
  this.command[0] = 'F'.charCodeAt(0);
  this.command[1] = 'a'.charCodeAt(0);
  this.command[2] = 'c'.charCodeAt(0);
  this.command[3] = 't'.charCodeAt(0);
  this.command[4] = 'o'.charCodeAt(0);
  this.command[5] = 'r'.charCodeAt(0);
  this.command[6] = 'y'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);
};

/**
 * Turn LED on (default)
 */
ezoph.prototype.ledOn = function() {
  this.clear();
  this.command[0] = 'L'.charCodeAt(0);
  this.command[1] = ','.charCodeAt(0);
  this.command[2] = '1'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Turn LED off
 */
ezoph.prototype.ledOff = function() {
  this.clear();
  this.command[0] = 'L'.charCodeAt(0);
  this.command[1] = ','.charCodeAt(0);
  this.command[2] = '0'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Query LED level
 * @returns {string} value - example ?L,1
 */
ezoph.prototype.queryLed = function() {
  this.clear();
  this.command[0] = 'L'.charCodeAt(0);
  this.command[1] = ','.charCodeAt(0);
  this.command[2] = '?'.charCodeAt(0);
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
};

/**
 * Find device
 * LED rapidly blinks white, used to help find device
 * Disables continuous mode
 * Send any command to terminate
 */
ezoph.prototype.findDevice = function() {
  this.clear();
  this.command[0] = 'F'.charCodeAt(0);
  this.command[1] = 'i'.charCodeAt(0);
  this.command[2] = 'n'.charCodeAt(0);
  this.command[3] = 'd'.charCodeAt(0);
  this.command[4] = 13;
  this.ezoTime = 300;

  this.i2c.writeTo(this.address, this.command);

  this.readValue();
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
};

ezoph.prototype.readValue = function() {
  var temp = new Array(20);
  setTimeout(function(){this.C.done = true;},1500);
  this.data = this.i2c.readFrom(this.address, 21);
  /*
  if (this.data[0] == C.success) {
    for (i = 0; i < 20; i++) {
      temp[i] = String.fromCharCode(this.data[i+1]);
    }
  }

  this.value = temp.join("");
  */
};

/** ---------------------- Exports ------------------------- */

/** This is 'exported' so it can be used with `require('ezoph.js').connect(pin1,pin2)` */
exports.connect = function(i2c, address) {
  return new ezoph(i2c,address);
};