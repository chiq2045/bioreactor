/* Copyright (c) 2014 Charles Oroko. See the file LICENSE for copying permission. */
/* Interract with EZO pH from Atlas Scientific: https://www.atlas-scientific.com/product_pages/circuits/ezo_ph.html */

exports.connect = function(/*=SPI*/spi, /*=PIN*/sck, /*=PIN*/mosi, /*=PIN*/cs, callback) {
  var options = {sck:sck, mosi:mosi, baud:integer=4000000, mode:integer=0, order:'msb'/'lsb'='msb'};
  spi.setup(options);
  digitalWrite(cs,0);
  var d =[];
  for (var i=0; i<4; i++) {
    d.push(spi.send(0));
  }
  var val = d[0]<<24 | d[1]<<16 | d[2]<<8 | d[3]; 
};