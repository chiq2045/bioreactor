/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */
var exports = {};

exports.connect = function(/*=SPI*/spi, /*=PIN*/sck, /*=PIN*/mosi, /*=PIN*/cs) {
  spi.setup({sck:sck, mosi:mosi});

  //Read the temperature in Celcuis
  return {
    readC : function() {
      var d = spi.send([0,0,0,0], cs);
      var v = d[0]<<24 | d[1]<<16 | d[2]<<8 | d[3];

      if (v & 0x7) {
        return NAN;
      }

      if (v & 0x80000000) {
        v = 0xffffc000 | ((v>>18) & 0x0003ffff);
      } else {
        v>>=18;
      }

      return v/4;
    },

    readF : function() {
      return (readTempC()*9/5) + 32;
    },

    readK : function() {
      return readTempC() + 273.15;
    },

    readR : function() {
      return readTempK()*9/5;
    }
  };
};