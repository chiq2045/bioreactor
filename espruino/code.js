var i2c = new I2C();
i2c.setup({scl:D0,sda:D2});
var data = new Array(20);

function clear() {
  for (i = 0; i < 20; i++) {
    data[i] = 0;
  }
}


var ph;
//var files = require('fs').readdirSync();

function read() {
  clear();
  console.log(data);
  data[1] = 'R'.charCodeAt(0);
  console.log(data);
  i2c.writeTo(99,data);
  setTimeout(function(){
    ph = i2c.readFrom(99,20);
  },2000);

  console.log(ph);
}

setInterval(function(){read();},3000);