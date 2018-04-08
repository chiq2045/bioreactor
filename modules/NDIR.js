/* Interract with MH-Z16 NDIR CO2 Sensor with I2C/UART Interface Board from Sandbox Electronics
https://sandboxelectronics.com/?product=mh-z16-ndir-co2-sensor-with-i2cuart-5v3-3v-interface-for-arduinoraspeberry-pi */

var exports = {};

var C = {
  /**
   * Register set for SC16IS750PW I2C/UART bridge
   * check part 8 on the datasheet for more information
   */

  //General Register Set for SC16IS750PW I2C/UART bridge
  //Only accessible if lcr[7] = 0
  rhr       : 0x00, //Receive Holding Register       (R)
  thr       : 0x00, //Transmit Holding Register      (W)
  ier       : 0x01, //Interrupt Enable Register      (R/W)
  iir       : 0x02, //Interrupt indication Register  (R)
  fcr       : 0x02, //FIFO Control Register          (R)
  lcr       : 0x03, //Line Control Register          (R)
  mcr       : 0x04, //Modem Control Register         (R)
  lsr       : 0x05, //Line Status Register           (R)
  tcr       : 0x06, //Transmission Control Register  (R/W)
  tlr       : 0x07, //Trigger Level Register         (R/W)
  msr       : 0x06, //Modem Static Register          (R)
  spr       : 0x07, //Scratchpad Register            (R/W)
  txlvl     : 0x08, //Transmit FIFO Level Register   (R)
  rxlvl     : 0x09, //Receive FIFO Level Register    (R)
  iodir     : 0x0a, //I/O pin Direction Register     (R/W)
  iostate   : 0x0b, //I/O pin States Register        (R)
  iointena  : 0x0c, //I/O Interrupt Enable Register  (R/W)
  //0x0d is reserved
  iocontrol : 0x0e, //I/O pins Control Regiser       (R/W)
  efcr      : 0x0f, //Extra Features Register        (R/W)

  //Special Register Set for SC16IS750PW I2C/UART bridge
  //Only accessible when lcr[7]=1 and lcr/=0xbf
  dll       : 0x00, //divisor latch lsb              (R/W)
  dlh       : 0x01, //divisor latch msb              (R/W)

  //Enhanced Register Set for SC16IS750PW I2C/UART bridge
  //Only accessible when lcr=0xbf
  efr       : 0x02, //Enhanced feature Register      (R/W)
  xon1      : 0x04, //Xon1 word                      (R/W)
  xon2      : 0x05, //Xon2 word                      (R/W)
  xoff1     : 0x06, //Xoff1 word                     (R/W)
  xoff2     : 0x07, //Xoff2 word                     (R/W)
};

/**
 * Make a new instance of the MH_Z16 sensor with SC16IS750PW I2C/UART bridge
 * @param {Object} i2c - an instance of an I2C object
 * @param {int} address - the address of device (default is 0x9a)
 */
function mh_z16(i2c, address) {
  this.i2c = i2c;
  this.address = address;
  this.ppm = 0;
}

/**
 * Public Constants
 */
mh_z16.prototype.C = {
  readData : [ 0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00 ],
  readCommand : [ 0xff,0x01,0x86,0x00,0x00,0x00,0x00,0x00,0x79 ],
  calCommand : [ 0xff,0x01,0x87,0x00,0x00,0x00,0x00,0x00,0x78 ]
};

/**
 * Initiallise the sensor for I2C communication
 */
mh_z16.prototype.begin = function() {
  var ad = this.address;
  this.i2c.writeTo( ad, [C.iocontrol, 0x08] );
  this.i2c.writeTo( ad, [C.fcr, 0x07] );
  this.i2c.writeTo( ad, [C.lcr, 0x83] );
  this.i2c.writeTo( ad, [C.dll, 0x60] );
  this.i2c.writeTo( ad, [C.dlh, 0x00] );
  this.i2c.writeTo( ad, [C.lcr, 0x03] );
  this.measure();
};

/**
 * Measure the co2 Concentration
 * @returns {int} this.ppm - the concentration of CO2 in parts per million
 */
mh_z16.prototype.measure = function() {
  this.i2c.writeTo( this.address, [C.fcr, 0x07] );
  this.send(this.C.readCommand);
  this.C.readData = this.receive();
  this.ppm = this.parse(this.C.readData);
  return this.ppm;
};

/**
 * Calibrate the zero level for ppm
 * Must be done in normal air ~ 400ppm
 */
mh_z16.prototype.calZero = function() {
  this.i2c.writeTo( this.address, [C.fcr, 0x07] );
  this.send(this.C.calCommand);
};

/** ------------------ Helper functions --------------------- */

/**
 * Send data to the MH_Z16
 * @param {Array} pdata - an array of 9 integers to send to the device
 */
mh_z16.prototype.send = function(pdata) {
  var ad = this.address;
  this.i2c.writeTo( ad, C.txlvl );
  var result = this.i2c.readFrom( ad, 1 );
  if ( result>=9 ) {
    this.i2c.writeTo( ad, [C.thr, pdata] );
  }
};

/**
 * Recieve data from device
 * @returns {Array} pdata - an array of 9 integers
 */
mh_z16.prototype.receive = function() {
  var ad = this.address;
  this.i2c.writeTo( ad, C.rhr );
  return this.i2c.readFrom( ad, 9 );
};

/**
 * parse received data and calculate ppm
 * @returns {Array} ppm - an integer value of the ppm concentration
 */
mh_z16.prototype.parse = function(pdata) {
  var ad = this.address;
  var checksum = 0;
  for (var i=0; i<9; i++) {
    checksum += pdata[i];
  }
  if (pdata[0] == 0xff && pdata[1] == 0x9c && checksum == 0xff) {
    return pdata[2]<<24 | pdata[3]<<16 | pdata[4]<<8 | pdata[5];
  }
};

exports.connect = function(i2c, address) {
  return new mh_z16(i2c,address);
};