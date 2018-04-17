var wifi = require("Wifi");
//Uncomment the following lines to connect to wifi
//wifi.connect("WWU-Aruba-HWauth", {authMode:0});
//wifi.stopAP();
//comment if connecting to wifi
wifi.startAP("Bioreactor-ESP", {authMode:0});
wifi.disconnect();

var i2c = new I2C();
i2c.setup({scl:NodeMCU.D2, sda:NodeMCU.D1});
var isp = new ISP();
isp.setup({miso:NodeMCU.D5, sck:NodeMCU.D7});
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
var ph = 0.0;
var temp = 0.0;
var co2 = 0;
var data = [];


function phComm(comm) {
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

function co2Begin() {
  i2c.writeTo(0x4d, [iocontrol, 0x08]);
  i2c.writeTo(0x4d, [fcr, 0x07]);
  i2c.writeTo(0x4d, [lcr, 0x83]);
  i2c.writeTo(0x4d, [dll, 0x60]);
  i2c.writeTo(0x4d, [dlh, 0x00]);
  i2c.writeTo(0x4d, [lcr, 0x03]);
}

function co2Read() {
  i2c.writeTo(0x4d, [fcr, 0x07]);
  i2c.writeTo(0x4d, txlvl);
  if (i2c.readFrom(0x4d, 1) >= readPPM.length) {
    i2c.write(0x4d, [thr, 0x07]);
}