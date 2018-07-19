/


/** =============== Setup Communication Protocols ====================
 * We will be using I2C for pH and CO2 sensors, and SPI for
 * temperature sensor. Seeing as ESP8266 does not have hardware
 * I2c and SPI, we need to setup software communication.
 */
var i2c = new I2C();
i2c.setup({scl:NodeMCU.D2, sda:NodeMCU.D3});
var spi = new SPI();
spi.setup({miso:NodeMCU.D5, sck:NodeMCU.D7});
var cs = NodeMCU.D6;

/** =============== Setup Non-Controllable Variables =================
 * These variables are static (PRIVATE)
 */
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
var buf = [];
var rx = 0;
var co2Data = [];

var Time = function (){
  this.days  = 0;
  this.hours = 0;
  this.mins  = 0;
  this.secs  = 0;
};

var time = new Time();
var co2Time = new Time();
var phTime = new Time();
var tempTime = new Time();

var readTime = 1000;

function co2Setup() {
  i2c.writeTo(0x4d, [reg.iocontrol, 0x08]); // UART software Reset
  i2c.writeTo(0x4d, [reg.fcr, 0x07]);       // TX/RX FIFO Enable
  i2c.writeTo(0x4d, [reg.lcr, 0x83]);       // Enabling divisor latch, with word length of 2 bits
  i2c.writeTo(0x4d, [reg.dll, 0x60]);       // Divisor latch low, 16 bit, baud 1200 (maybe)
  i2c.writeTo(0x4d, [reg.dlh, 0x00]);       // Divisor latch high, 16 bit, baud 1200 (maybe)
  i2c.writeTo(0x4d, [reg.lcr, 0x03]);       // Disable latch, word length 2 bits
}

var co2PID = {
  P         : 0.01,
  I         : 0.015,
  D         : -0.01,
  target    : 47000,
  current   : 47000,
  last      : 47000,
  tolerance : readTime,
  offTime   : 30*readTime,
  onTime    : 0,
  samples   : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
};

var actuators = {
  on        : true,
  off       : false,
  co2Valve  : NodeMCU.D4,
};

var bioData = {
  co2       : co2PID.current,
  co2Avg    : 0,
  co2On     : 0,
  time      : time
};

/* =============== Helper Functions =============== */
//clearInterval(dataComm);
//clearInterval(storeSamples);
//clearInterval(updateActuators);
function clearArray(ar) {
  if (ar.length>0) {
    for (var i=0; i<ar.length; i++) {
      ar[i]=0;
    }
  }
}

function timeComp(t1, t, intvl) {
  return ((timeInterval(t)-timeInterval(t1))>=intvl);
}

function timeInterval(t) {
  return t.secs + t.mins*60 + t.hours*3600 + t.days*3600*24;
}

function setTime(t) {
  t.days = time.days;
  t.hours = time.hours;
  t.mins = time.mins;
  t.secs = time.secs;
}

function getSum(total, num) {
    return total + num;
}

/** Read the CO2 concentration */
co2Setup(); //setup the CO2 Sensor

var co2Comm = setInterval(function(buf) {
  //if (time.secs%30 >10 && time.secs%30<=15) {

    // we hope we transfered 9 bits, 
    i2c.writeTo(0x4d, [reg.fcr, 0x07]);
    i2c.writeTo(0x4d, reg.txlvl);
    if (i2c.readFrom(0x4d, 1)[0] >= readPPM.length) {
      i2c.writeTo(0x4d, [reg.thr, readPPM]);
    }
    rx = 0;
    i2c.writeTo(0x4d, reg.rxlvl);
    setTimeout(function() {
      rx = i2c.readFrom(0x4d, 1);

      // Only read the first 9 bits
      if (rx[0]>9) {
        rx[0] = 9;
      }

      i2c.writeTo(0x4d, reg.rhr);
      buf = i2c.readFrom(0x4d, rx);

      // Read the current value from the buffer 
      // bytes (2 - 5) are the actual values of the co2
      co2PID.current = buf[2]<<24 | buf[3]<<16 | buf[4]<<8 | buf[5];
    }, 50);
  //}
}, readTime*5);

/** Advance time counter */
var advanceTime = setInterval(function() {
  time.secs++;
  if (time.secs>=60) {
    time.secs = 0;
    time.mins++;
    if (time.mins>=60) {
      time.mins = 0;
      time.hours++;
      if (time.hours>=24) {
        time.hours = 0;
        time.days++;
      }
    }
  }
}, readTime);

/** Publish data to console every 10 seconds */
var dataComm = setInterval(function() {
  //update current values
  bioData.co2 = co2PID.current;

  //update averages
  if (co2PID.samples[39] !== 0) {
    bioData.co2Avg = co2PID.samples.reduce(getSum)/co2PID.samples.length;
    } else {
    bioData.co2Avg = 0;
  }

  //update time and print data*/
  bioData.time = time;
  console.log(bioData);
}, readTime*5);

/** Update Actuators */
var updateActuators = setInterval(function() {
  if (!bioData.co2On &&
      timeComp(co2Time, time, co2PID.offTime) &&
      ppm<co2PID.target) {
    digitalWrite(actuators.co2Valve, actuators.on);
    bioData.co2On = true;
    setTime(co2Time);
    co2PID.onTime = actuators.co2ValveResponseOffset +
      co2PID.P*(ppm-co2PID.target) +
      co2PID.I*(co2PID.target-co2PID.average) +
      co2PID.D*(ppm-ppm0);
    ppm0 = ppm;
  }
  if (bioData.co2On &&
      (ppm>=co2PID.target ||
       timeComp(co2Time, time, co2PID.onTime))) {
    digitalWrite(actuators.co2Valve, actuators.off);
    bioData.co2On = false;
    setTime(co2Time);
  }
}, readTime*20);

/** Store Samples */
var storeSamples = setInterval(function() {
  if (timeInterval(time)-timeInterval(co2Time) >= 300) {
    co2PID.samples.shift();
    co2PID.samples.push(co2PID.current);
    co2PID.average = co2PID.samples.reduce(getSum)/co2PIDsamples.length;
  }
}, readTime*20);