/* ========== Initialise the variables and board =========== 
require("Wifi").restore();
//Uncomment the following lines to connect to wifi
//wifi.connect("WWU-Aruba-HWauth", {authMode:0});
//wifi.stopAP();
//comment if connecting to wifi
//wifi.startAP("Bioreactor-ESP", {authMode:0});
//wifi.disconnect();

/* Dustin was here */

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

var phData = [];
var strData = [];
var phReturn; //possibly no use

var tempData = [];

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
var phPID = {
  P         : 0.2,
  I         : 0.3,
  D         : -0.2,
  target    : 7.4,
  current   : 47000,
  last      : 47000,
  tolerance : 0.5,
  offTime   : 5*60*readTime,
  onTime    : 0,
  samples   : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
};
var tempPID = {
  P         : 100,
  I         : 50,
  D         : -100,
  target    : 37.0,
  current   : 47000,
  last      : 47000,
  tolerance : 1.5,
  offTime   : 14*readTime,
  onTime    : 0,
  samples   : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
               0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
};

var actuators = {
  on        : true,
  off       : false,
  co2Valve  : NodeMCU.D4,
  phStep    : NodeMCU.D1,
  phDir     : NodeMCU.D0,
  tempValve : NodeMCU.D8
};

var bioData = {
  ph        : phPID.current,
  phAvg     : 0,
  phOn      : 0,
  co2       : co2PID.current,
  co2Avg    : 0,
  co2On     : 0,
  temp      : tempPID.current,
  tempAvg   : 0,
  tempOn    : 0,
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
  if ((timeInterval(t)-timeInterval(t1))>=intvl) {
    return true;
  } else {
    return false;
  }
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

/* =============== Main functions =============== */
/** Read the pH */
/*var phComm = setInterval(function() {
  i2c.writeTo(99, 'R');
  setTimeout(function() {
    phData = i2c.readFrom(99, 21);
    strData = [];
    for (var i=1; i<phData.length; i++) {
      if (phData[i]!==0) {
        strData.push(String.fromCharCode(phData[i]));
      }
    }
    ph = strData.join("");
  }, 900);
}, readTime);*/

function bioreactorBegin() {
  co2Setup();
}

/** Read the CO2 concentration */
var co2Comm = setInterval(function(buf) {
  //if (time.secs%30 >10 && time.secs%30<=15) {
    i2c.writeTo(0x4d, [reg.fcr, 0x07]);
    i2c.writeTo(0x4d, reg.txlvl);
    if (i2c.readFrom(0x4d, 1)[0] >= readPPM.length) {
      i2c.writeTo(0x4d, [reg.thr, readPPM]);
    }
    rx = 0;
    i2c.writeTo(0x4d, reg.rxlvl);
    setTimeout(function() {
      rx = i2c.readFrom(0x4d, 1);
      if (rx[0]>9) {
        rx[0] = 9;
      }
      i2c.writeTo(0x4d, reg.rhr);
      buf = i2c.readFrom(0x4d, rx);
      co2PID.current = buf[2]<<24 | buf[3]<<16 | buf[4]<<8 | buf[5];
    }, 50);
  //}
}, readTime*5);

/** Communicate with EZO pH */
var phComm = setInterval(function() {
//  if (time.secs%30 >0 && time.secs%30<=5) {
    i2c.writeTo(99, 'R');
    if (comm.toLowerCase() != 'sleep') {
      setTimeout(function() {
        phData = i2c.readFrom(99, 21);
        strData = [];
        for (var i=1; i<phData.length; i++) {
          if (phData[i]!==0) {
            strData.push(String.fromCharCode(phData[i]));
          }
        }
        if (comm.toLowerCase() == 'r') {
          phPID.current = parseFloat(strData.join(""));
        } else {
          phReturn = strData.join("");
        }
      }, 900);
    }
//  }
}, readTime*5);

/** Read the temperature */
var tempComm = setInterval(function() {
  var temp = 0;
  tempData = spi.send([0,0,0,0], cs);
  temp = tempData[0]<<24 | tempData[1]<<16 | tempData[2]<<8 | tempData[3];

  if (temp & 0x7) {
    tempPID.current = NaN;
  }

  if (temp & 0x80000000) {
    temp = 0xffffc000 | ((temp>>18) & 0x0003ffff);
  } else {
    temp>>=18;
  }
  tempPID.current = temp/4;
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
  bioData.ph = phPID.current;
  bioData.co2 = co2PID.current;
  bioData.temp = tempPID.current;

  //update averages
  if (phPID.samples[39] !== 0 &&
      co2PID.samples[39] !== 0 &&
      tempPID.samples[39] !== 0) {
    bioData.phAvg = phPID.samples.reduce(getSum)/phPID.samples.length;
    bioData.co2Avg = co2PID.samples.reduce(getSum)/co2PID.samples.length;
    bioData.tempAvg = tempPID.samples.reduce(getSum)/tempPID.samples.length;
  } else {
    bioData.phAvg = 0;
    bioData.co2Avg = 0;
    bioData.tempAvg = 0;
  }

  /* Research better ways of doing debug
  //update actuator values (mainly for debug)
  bioData.phValve = actuators.phValve;
  bioData.co2Valve = digitalRead(actuators.co2Valve);

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

  if (!bioData.tempOn &&
      timeInterval(time)>tempPID.offTime*4 &&
      tempPID.current<tempPID.target &&
      timeComp(tempTime, time, tempPID.offTime)) {
    digitalWrite(actuators.tempValve, actuators.on);
    bioData.tempOn = true;
    setTime(tempTime);
    tempPID.onTime = 5 +
                    tempPID.P*(tempPID.target-tempPID.current) +
                    tempPID.I*(tempPID.target-tempPID.average) +
                    tempPID.D*(tempPID.current-tempPID.last);
    tempPID.last = tempPID.current;
    console.log('on update');
  }
  if (bioData.tempOn &&
      (tempPID.current>=tempPID.target ||
       timeComp(tempTime, time, tempPID.onTime*4))) {
    digitalWrite(actuators.tempValve, actuators.off);
    bioData.temOn = false;
    setTime(tempTime);
    console.log('off update');
  }

  if (!bioData.phOn &&
        timeComp(phTime, time, phPID.offTime) &&
        ph<phPID.target) {
    oneDropNaOH();
    bioData.phOn = true;
    setTime(phTime);
    phPID.onTime = actuators.phValveResponseOffset +
                    phPID.P*(ph-phPID.target) +
                    phPID.I*(phPID.target-phPID.average) +
                    phPID.D*(ph-ph0);
    ph0 = ph;
  }
  if (bioData.phOn) {
    biodata.phOn = false;
  }
}, readTime);

/** Store Samples */
/*var storeSamples = setInterval(function() {
  if (timeInterval(time)-timeInterval(co2Time) >= co2PID.offTime*co2PID.sample.length/40) {
    if (co2PID.samples.length >=40) {
      co2PID.samples.shift();
    }
    co2PID.samples.push(ppm);
    co2PID.average = co2PID.samples.reduce(getSum)/co2PIDsamples.length;
  }

  if (timeInterval(time)-timeInterval(phTime) >= phPID.offTime*phPID.sample.length/40) {
    if (phPID.samples.length >=40) {
      phPID.samples.shift();
    }
    phPID.samples.push(ppm);
    phPID.average = phPID.samples.reduce(getSum)/phPIDsamples.length;
  }

  if (timeInterval(time)-timeInterval(tempTime) >= tempPID.offTime*tempPID.sample.length/40) {
    if (tempPID.samples.length >=40) {
      tempPID.samples.shift();
    }
    tempPID.samples.push(ppm);
    tempPID.average = tempPID.samples.reduce(getSum)/tempPIDsamples.length;
  }
}, readTime);*/

