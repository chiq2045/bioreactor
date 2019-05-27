/* Interract with MH-Z16 NDIR CO2 Sensor with I2C/UART Interface Board from Sandbox Electronics
https://sandboxelectronics.com/?product=mh-z16-ndir-co2-sensor-with-i2cuart-5v3-3v-interface-for-arduinoraspeberry-pi */

const reg = {
  /**
   * Register set for SC16IS750PW I2C/UART bridge
   * check part 8 on the datasheet for more information
   * @private
   */

  // General Register Set for SC16IS750PW I2C/UART bridge
  // Only accessible if lcr[7] = 0
  rhr: 0x00 << 3, // Receive Holding Register       (R)
  thr: 0x00 << 3, // Transmit Holding Register      (W)
  ier: 0x01 << 3, // Interrupt Enable Register      (R/W)
  iir: 0x02 << 3, // Interrupt indication Register  (R)
  fcr: 0x02 << 3, // FIFO Control Register          (R)
  lcr: 0x03 << 3, // Line Control Register          (R)
  mcr: 0x04 << 3, // Modem Control Register         (R)
  lsr: 0x05 << 3, // Line Status Register           (R)
  tcr: 0x06 << 3, // Transmission Control Register  (R/W)
  tlr: 0x07 << 3, // Trigger Level Register         (R/W)
  msr: 0x06 << 3, // Modem Static Register          (R)
  spr: 0x07 << 3, // Scratchpad Register            (R/W)
  txlvl: 0x08 << 3, // Transmit FIFO Level Register   (R)
  rxlvl: 0x09 << 3, // Receive FIFO Level Register    (R)
  iodir: 0x0a << 3, // I/O pin Direction Register     (R/W)
  iostate: 0x0b << 3, // I/O pin States Register        (R)
  iointena: 0x0c << 3, // I/O Interrupt Enable Register  (R/W)
  // 0x0d is reserved
  iocontrol: 0x0e << 3, // I/O pins Control Regiser       (R/W)
  efcr: 0x0f << 3, // Extra Features Register        (R/W)

  // Special Register Set for SC16IS750PW I2C/UART bridge
  // Only accessible when lcr[7]=1 and lcr/=0xbf
  dll: 0x00 << 3, // divisor latch lsb              (R/W)
  dlh: 0x01 << 3, // divisor latch msb              (R/W)

  // Enhanced Register Set for SC16IS750PW I2C/UART bridge
  // Only accessible when lcr=0xbf
  efr: 0x02 << 3, // Enhanced feature Register      (R/W)
  xon1: 0x04 << 3, // Xon1 word                      (R/W)
  xon2: 0x05 << 3, // Xon2 word                      (R/W)
  xoff1: 0x06 << 3, // Xoff1 word                     (R/W)
  xoff2: 0x07 << 3, // Xoff2 word                     (R/W)
};

/**
 * Make a new instance of the MH_Z16 sensor with SC16IS750PW I2C/UART bridge
 * @module MH_Z16
 *
 * @param {Object} i2c - an instance of an I2C object
 * @param {number} address - the address of device (default is 0x9a)
 * @property {number} ppm - the last measured co2 concentration (can be used for debug)
 * @returns {number} - the co2 concentration measured by the device
 */
function MH_Z16(i2c, address) {
  this.i2c = i2c;
  this.address = address;
  this.ppm = 0;
}
exports = MH_Z16;

/**
 * Public Constants (mainly used for debugging)
 */
MH_Z16.prototype.C = {
  readData: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  readCommand: [0xff, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79],
  calCommand: [0xff, 0x01, 0x87, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78],
};

/**
 * Initializes the MH_Z16 sensor
 * @function MH_Z16/begin
 */
MH_Z16.prototype.begin = function () {
  const ad = this.address;
  const { i2c } = this;
  i2c.writeTo(ad, [reg.iocontrol, 0x08]);
  i2c.writeTo(ad, [reg.fcr, 0x07]);
  i2c.writeTo(ad, [reg.lcr, 0x83]);
  i2c.writeTo(ad, [reg.dll, 0x60]);
  i2c.writeTo(ad, [reg.dlh, 0x00]);
  i2c.writeTo(ad, [reg.lcr, 0x03]);
};

/**
 * Measure the co2 Concentration
 * @method MH_Z16/measure
 * @param {requestCallback} callback - handle the result
 * @returns {number} - the value of the concentration, or 0, when there is a problem
 * @example <caption>How to use MH_Z16.measure</caption>
 * // if the concentration is to be stored in a variable ppm then:
 * MH_Z16.measure( ()=>{} );
 * ppm = MH_Z16.ppm
 */
MH_Z16.prototype.measure = function (callback) {
  const self = this;
  self.send(self.C.readCommand);

  self.receive((ppmArray) => {
    self.C.readData = ppmArray;

    if (ppmArray === null || ppmArray === undefined) {
      callback(-1);
    } else {
      self.ppm = self.parse(ppmArray);
      callback(self.ppm);
    }
  });
};

/**
 * Calibrate the zero level for ppm
 * Must be done in normal air ~ 400ppm
 * @method MH_Z16/calZero
 */
MH_Z16.prototype.calZero = function () {
  this.send(this.C.calCommand);
};

/** ------------------ Helper functions --------------------- */

/**
 * Send data to the MH_Z16
 * @function MH_Z16/send
 * @param {Array} data - an array of 9 integers to send to the device
 */
MH_Z16.prototype.send = function (data) {
  const ad = this.address;
  this.i2c.writeTo(ad, [reg.fcr, 0x07]);
  this.i2c.writeTo(ad, reg.txlvl);
  // var result = this.i2c.readFrom( ad, 1 );
  // if ( result>=9 ) {
  this.i2c.writeTo(ad, [reg.thr, data]);
  //   console.log('sent');
  // }
};

/**
 * Receive data from device
 * @function MH_Z16/recieve
 * @callback resultCallback - an array of 9 integers
 */
MH_Z16.prototype.receive = function (callback) {
  const ad = this.address;
  this.i2c.writeTo(ad, reg.rxlvl);
  setTimeout(function () {
    // If device has more than 9 bytes available, read first 9 only
    const rx = this.i2c.readFrom(ad, 1);
    if (rx[0] > 9) {
      rx[0] = 9;
    }
    this.i2c.writeTo(ad, reg.rhr);
    callback(this.i2c.readFrom(ad, rx));
  }, 50);
};

/**
 * parse the device data and calculate ppm
 * bytes (2 - 5) are the actual values of the co2
 * @function MH_Z16/parse
 * @param {Array} data - a 9 element array
 * @returns {Array} ppm - an integer value of the ppm concentration
 */
MH_Z16.prototype.parse = function (data) {
  // var checksum = 0;
  // for (var i=0; i<data.length; i++) {
  //   checksum += data[i];
  // }
  // if (data[0] == 0xff && data[1] == 0x9c /*&& checksum == 0xff*/) {
  // return data[2]<<24 | data[3]<<16 | data[4]<<8 | data[5];
  // test new parsing calculation
  return (data[2] << 8) | data[3];
  // } else {
  // return NaN;
  // }
};

/** ---------------------- Exports ------------------------- */

/**
 * This is 'exported' so it can be used with `require('MH_Z16.js').connect(pin1,pin2)`
 * @example <caption>How to use MH_Z16 module</caption>
 * //create a new instance of ph sensor
 * var i2c = new I2C();     // create new i2c object
 * var co2Address = 0x47;    // EZO pH i2c address
 * var sda = D23;           // setup i2c pins
 * var scl = D22;
 * i2c.setup({              // setup I2C bus
 *   scl:scl,
 *   sda:sda
 * });
 * phSensor = new ( require('MH_Z16') )( i2c, co2Address );
 */
exports.connect = function (i2c, address) {
  return new MH_Z16(i2c, address);
};
