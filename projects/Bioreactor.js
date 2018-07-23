var i2c = new I2C();
i2c.setup({scl:NodeMCU.D1, sda:NodeMCU.D2});
var ph = new (require('Ezoph'))(i2c, 99);

