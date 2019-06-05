/** Declare modules */
var exports={};

function ezoph(i2c, address) {
  this.i2c = i2c;
  this.address = address;
  this.ph = 0;
  this.timeout = 900;
}

function max31855k(spi, sck, miso, cs) {
  this.spi = spi;
  this.miso = miso;
  this.sck = sck;
  this.cs = cs;
}

function mh_z16(i2c, address) {
  this.i2c = i2c;
  this.address = address;
  this.ppm = 0;
}

mh_z16.prototype.reg = {
  rhr: 0x00 << 3,
  thr: 0x00 << 3,
  ier: 0x01 << 3,
  iir: 0x02 << 3,
  fcr: 0x02 << 3,
  lcr: 0x03 << 3,
  mcr: 0x04 << 3,
  lsr: 0x05 << 3,
  tcr: 0x06 << 3,
  tlr: 0x07 << 3,
  msr: 0x06 << 3,
  spr: 0x07 << 3,
  txlvl: 0x08 << 3,
  rxlvl: 0x09 << 3,
  iodir: 0x0a << 3,
  iostate: 0x0b << 3,
  iointena: 0x0c << 3,
  
  iocontrol: 0x0e << 3,
  efcr: 0x0f << 3,

  dll: 0x00 << 3,
  dlh: 0x01 << 3,

  efr: 0x02 << 3,
  xon1: 0x04 << 3,
  xon2: 0x05 << 3,
  xoff1: 0x06 << 3,
  xoff2: 0x07 << 3
};

ezoph.prototype.read = function(callback) {
  this.sendCommand(C.read);
  this.receiveData(callback);
};

ezoph.prototype.calMid = function(callback) {
  this.sendCommand(C.calMid);
  return this.receiveData(callback);
};

ezoph.prototype.calLow = function(callback) {
  this.sendCommand(C.calLow);
  return this.receiveData(callback);
};

ezoph.prototype.calHigh = function(callback) {
  this.sendCommand(C.calHigh);
  return this.receiveData(callback);
};

ezoph.prototype.sendCommand = function(comm) {
  this.i2c.writeTo(this.address, comm);
};

ezoph.prototype.receiveData = function(callback) {
  let self = this;

  let address = self.address;
  let data;
  setTimeout(() => {
    data = self.i2c.readFrom(address, 21);
    callback(self.charToString(data));
  }, 900);
};

ezoph.prototype.charToString = function(data) {
  let array = [];
  if (data[0] == 1) {
    for ( let i=1; i<data.length; i++ ) {
      if (data[i]!==0) {
        array.push(String.fromCharCode(data[i]));
      }
    }
  }
  return array.join("");
};

max31855k.prototype.begin = function() {
  let self = this;
  
  self.spi.setup({miso: self.miso, sck: self.sck});
};

max31855k.prototype.read = function(callback) {
  let self = this;

  let data = self.spi.send([0,0,0,0], self.cs);
  let temp = data[0]<<24 | data[1]<<16 | data[2]<<8 | data[3];

  if (temp & 0x7) {
    return NaN;
  }

  if (temp & 0x80000000) {
    temp = 0xffffc000 | ((temp>>18) & 0x0003ffff);
  } else {
    temp>>=18;
  }

  callback(temp/4);
};

mh_z16.prototype.C = {
  readCommand: [0xff, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79],
};

mh_z16.prototype.begin = function() {
  let self = this;

  let ad = self.address;
  let i2c = self.i2c;
  i2c.writeTo(ad, [self.reg.iocontrol, 0x08]);
  i2c.writeTo(ad, [self.reg.fcr, 0x07]);
  i2c.writeTo(ad, [self.reg.lcr, 0x83]);
  i2c.writeTo(ad, [self.reg.dll, 0x60]);
  i2c.writeTo(ad, [self.reg.dlh, 0x00]);
  i2c.writeTo(ad, [self.reg.lcr, 0x03]);
};

mh_z16.prototype.measure = function(callback) {
  let self = this;

  self.send(self.C.readCommand);
  self.receive(function(ppmArray) {
    self.C.readData = ppmArray;
    if (ppmArray === null || ppmArray === undefined) {
      console.log("Co2 censor returned nothing");
      callback(0);
    } else {
      self.ppm = self.parse(ppmArray);
      callback(self.ppm);
    }
  });
};

mh_z16.prototype.send = function(data) {
  let self = this;
  
  let ad = self.address;
  self.i2c.writeTo(ad, [self.reg.fcr, 0x07]);
  self.i2c.writeTo(ad, self.reg.txlvl);
  self.i2c.writeTo(ad, [self.reg.thr, data]);
};

mh_z16.prototype.receive = function(callback) {
  let self = this;

  let ad = self.address;
  self.i2c.writeTo(ad, self.reg.rxlvl);
  setTimeout(function() {
    let rx = self.i2c.readFrom(ad, 1);
    if (rx[0] > 9) {
      rx[0] = 9;
    }
    self.i2c.writeTo(ad, self.reg.rhr);
    callback(self.i2c.readFrom(ad, rx));
  }, 50);
};

mh_z16.prototype.parse = function(data) {
  return (data[2] << 8) | data[3];
};

exports.ph = (i2c, address) => {
  return new ezoph(i2c, address);
};

exports.co2 = (i2c, address) => {
  return new mh_z16(i2c, address);
};

exports.temp = (spi, sck, miso, cs) => {
  return new max31855k(spi, sck, miso, cs);
};

/** Define communication protocols */
let i2c = new I2C();
let spi = new SPI();
const phAddress = 0x63;
const co2Address = 0x4d;

const sda = D23;
const scl = D22;

const miso = D25;
const cs = D33;
const sck = D32;

/** Setup Sensors */
i2c.setup({
  scl: scl,
  sda: sda,
});

const phSensor = exports.ph(i2c, phAddress);
const co2Sensor = exports.co2(i2c, co2Address);
const tempSensor = exports.temp(spi, sck, miso, cs);

let co2Update;
let tempUpdate;
let bioreactorUpdate;
let controllerUpdate;
let intervals = {
  temp: false,
  co2: false,
};

let bioreactorData = {
  co2: 0,
  temp: 0,
};

let controllers = {
  co2: {
    pin: D18,
    timeOn: 5000,
    timeOff: 1000 * 60 * 5,
  },
  temp: {
    pin: D21,
    timeOn: 7000,
    timeOff: 14000,
  },
};

function co2Control(on) {
  if (on) {
    co2Update = setInterval(() => {
      console.log('co2 loop is on');
      //digitalWrite(D18, true);
      //console.log('co2 is on');
      setTimeout(() => {
        //digitalWrite(D18, false);
        console.log('co2 is off');
      }, 5000);
    }, 1000 * 60 * 5);
  } else {
    //digitalWrite(D18, false);
    clearInterval(co2Update);
    console.log('co2 loop is off');
  }
}

function tempControl(on) {
  if (on) {
    console.log('temp loop is on');
    tempUpdate = setInterval(() => {
      digitalWrite(D21, true);
      console.log('temp is on');
      setTimeout(() => {
        digitalWrite(D21, false);
        console.log('temp is off');
      }, 7000);
    }, 21000);
  } else {
    digitalWrite(D21, false);
    if (intervals.temp) { clearInterval(tempUpdate); }
    console.log('temp loop is off');
  }
}

function getBioreactorData(start) {
  if (start) {
    bioreactorUpdate = setInterval(() => {
      console.log('getting data');
      co2Sensor.measure(res => { bioreactorData.co2 = res; });
      tempSensor.read(res => { bioreactorData.temp = res; });
    }, 5000);
  } else {
    clearInterval(bioreactorUpdate);
  }
}

function updateControllers(start) {
  if (start) {
    controllerUpdate = setInterval(() => {
      if (bioreactorData.temp <= 35 && !intervals.temp) {
        intervals.temp = true;
        tempControl(true);
      } else if (bioreactorData.temp > 36) {
        intervals.temp = false;
        tempControl(false);
      } else {
        console.log('temperature is stabilising');
      }

      if (bioreactorData.co2 <= 40000 && !intervals.co2) {
        console.log('co2 is being controlled');
        intervals.co2 = true;
        co2Control(true);
      } else if (bioreactorData.co2 > 48000) {
        intervalse.co2 = false;
        co2Control(false);
      } else {
        console.log('co2 is stabilising');
      }
    }, 5000);
  } else {
    clearInterval(controllerUpdate);
    tempControl(false);
    co2Control(false);
  }
}

function startBioreactor(start) {
    console.log('initialising sensors');
    co2Sensor.begin();
    tempSensor.begin();

    setTimeout(() => { getBioreactorData(true); }, 10000);
    setTimeout(() => { updateControllers(true); }, 20000);
}
