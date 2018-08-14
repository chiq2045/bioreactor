/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */

function max38155k(/*=SPI*/spi, /*=PIN*/sck, /*=PIN*/mosi, /*=PIN*/cs) {
  this.spi = spi;
  this.spi.setup({mosi:mosi, sck:sck});
  this.cs = cs;
  this.temp = 0;
}
exports = max38155k;

max38155k.prototype.readC = function() {
  var d = spi.send([0,0,0,0], cs);
  this.temp = d[0]<<24 | d[1]<<16 | d[2]<<8 | d[3];

  if (this.temp & 0x7) {
    return NaN;
  }

  if (v & 0x80000000) {
    this.temp = 0xffffc000 | ((this.temp>>18) & 0x0003ffff);
  } else {
    this.temp>>=18;
  }

  this.temp = this.temp/4;

  return this.temp;
};

max38155k.prototype.readF = function() {
  return (this.readTempC()*9/5) + 32;
};

max38155k.prototype.readK = function() {
  return this.readTempC() + 273.15;
};

max38155k.prototype.readR = function() {
  return this.readTempK()*9/5;
};
