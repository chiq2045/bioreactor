var wifi = require("Wifi");
//Uncomment the following lines to connect to wifi
//wifi.connect("WWU-Aruba-HWauth", {authMode:0});
//wifi.stopAP();
//comment if connecting to wifi
wifi.startAP("Bioreactor-ESP", {authMode:0});
wifi.disconnect();

var i2c = new I2C();
i2c.setup({scl:NodeMCU.D2, sda:NodeMCU.D1});
var spi = new SPI();
spi.setup({miso:NodeMCU.D5, sck:NodeMCU.D7});
var cs = NodeMCU.D6;

var reg = {
  iocontrol  : 0x0e<<3,
  fcr        : 0x02<<3,
  lcr        : 0x03<<3,
  dll        : 0x00<<3,
  dlh        : 0x01<<3,
  thr        : 0x00<<3,
  rhr        : 0x00<<3,
  txlvl      : 0x08<<3,
  rxlvl      : 0x09<<3
};

var readPPM = [0xFF,0x01,0x9C,0x00,0x00,0x00,0x00,0x00,0x63];

function phComm(i2c, comm) {
  i2c.writeTo(0x63, comm);
  var phData = [];
  var str = [];
  if (comm !== 'sleep') {
    setTimeout(function() {
      phData = i2c.readFrom(0x63, 21);
      for (var i=0; i<phData.length; i++) {
        if (phData[i] !== 0) {
          str.push(String.fromCharCode(phData[i]));
        }
      }
    }, 900);
  }
  return str.join("");
}

function co2Begin(reg) {
  i2c.writeTo(0x4d, [reg.iocontrol, 0x08]);
  i2c.writeTo(0x4d, [reg.fcr, 0x07]);
  i2c.writeTo(0x4d, [reg.lcr, 0x83]);
  i2c.writeTo(0x4d, [reg.dll, 0x60]);
  i2c.writeTo(0x4d, [reg.dlh, 0x00]);
  i2c.writeTo(0x4d, [reg.lcr, 0x03]);
}

function co2Read(reg, readPPM) {
  i2c.writeTo(0x4d, [reg.fcr, 0x07]);
  i2c.writeTo(0x4d, reg.txlvl);
  if (i2c.readFrom(0x4d, 1) >= readPPM.length) {
    i2c.write(0x4d, [reg.thr, readPPM]);
  }
  setTimeout(function() {
    var rx = 0;
    var n = 9;
    var buf = [];
    while (n>0) {
      i2c.writeTo(0x4d, reg.rxlvl);
      rx = i2c.readFrom(0x4d, 1);

      if (rx>n) {
        rx = n;
      }

      i2c.writeTo(0x4d, reg.rhr);
      buf.push(i2c.readFrom(0x4d, rx));
      n = n-rx;
    }
  }, 1);
  return buf;
}

function tempC(spi) {
  var d = spi.send([0,0,0,0], cs);
  var v = d[0]<<24 | d[1]<<16 | d[2]<<8 | d[3];

  if (v & 0x7) {
    return NaN;
  }

  if (v & 0x80000000) {
    v = 0xffffc000 | ((v>>18) & 0x0003ffff);
  } else {
    v>>=18;
  }

  return v/4;
}