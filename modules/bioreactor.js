/* =============== Initialise the variables and board =============== */
require("Wifi").restore();
//Uncomment the following lines to connect to wifi
//wifi.connect("WWU-Aruba-HWauth", {authMode:0});
//wifi.stopAP();
//comment if connecting to wifi
//wifi.startAP("Bioreactor-ESP", {authMode:0});
//wifi.disconnect();

var i2c = new I2C();
i2c.setup({scl:NodeMCU.D2, sda:NodeMCU.D3});
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

var co2Setup = function() {
  i2c.writeTo(0x4d, [reg.iocontrol, 0x08]);
  i2c.writeTo(0x4d, [reg.fcr, 0x07]);
  i2c.writeTo(0x4d, [reg.lcr, 0x83]);
  i2c.writeTo(0x4d, [reg.dll, 0x60]);
  i2c.writeTo(0x4d, [reg.dlh, 0x00]);
  i2c.writeTo(0x4d, [reg.lcr, 0x03]);
};

var readPPM = [0xFF,0x01,0x9C,0x00,0x00,0x00,0x00,0x00,0x63];
var buf = [];
var rx = 0;
var co2Data = [];

var phData = [];
var strData = [];
var phReturn;

var tempData = [];

var time = {
  days  : 0,
  hours : 0,
  mins  : 0,
  secs  : 0
};

var co2Time = time;
var phTime = time;
var tempTime = time;
var readTime = 1000;

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
  samples   : []
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
  samples   : []
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
  samples   : []
};

var actuators = {
  on        : true,
  off       : false,
  co2Valve  : NodeMCU.D4,
  phValve   : 0,
  phStep    : NodeMCU.D1,
  phDir     : NodeMCU.D0,
  tempValve : NodeMCU.D8
};

var bioData = {
  ph        : phPID.current,
  phAvg     : 0,
  phValve   : actuators.phValve,
  co2       : co2PID.current,
  co2Avg    : 0,
  co2Valve  : digitalRead(actuators.co2Valve),
  temp      : tempPID.current,
  tempAvg   : 0,
  tempValve : digitalRead(actuators.tempValve),
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
  var getTime = setInterval(function(){ advanceTime(); }, readTime);
}

var startDataCollection = setInterval(function() {
  if (time.secs == 5 || time.secs == 35) { //read ph twice a minute
    readPH();
  }

  if (time.secs == 15 || time.secs == 45) { //read co2 twice a minute
    readCO2(buf);
  }

  if (time.secs%10 === 0) { //read temp every 10 seconds, print Data every 10 seconds
    readTemp();
    printData();
  }
}, readTime);

/** Read the CO2 concentration */
function readCO2(buf) {
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
}

/** Communicate with EZO pH */
function phComm(comm) {
  i2c.writeTo(99, comm);
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
}

/** Read ph */
function readPH() {
  phComm('R');
}

/** Read the temperature */
function readTemp() {
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
}

/** Advance time counter */
function advanceTime() {
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
}

/** Publish data to console */
function printData() {
  //update current values
  bioData.ph = phPID.current;
  bioData.co2 = co2PID.current;
  bioData.temp = tempPID.current;

  //update averages
  if (phPID.samples.length>0 &&
      co2PID.samples.length>0 &&
      tempPID.samples.length>0) {
    bioData.phAvg = phPID.samples.reduce(getSum)/phPID.samples.length;
    bioData.co2Avg = co2PID.samples.reduce(getSum)/co2PID.samples.length;
    bioData.tempAvg = tempPID.samples.reduce(getSum)/tempPID.samples.length;
  } else {
    bioData.phAvg = 0;
    bioData.co2Avg = 0;
    bioData.tempAvg = 0;
  }

  //update actuator values (mainly for debug)
  bioDataphValve = actuators.phValve;
  bioData.co2Valve = digitalRead(actuators.co2Valve);
  bioData.tempValve = digitalRead(actuators.tempValve);

  //update time and print data
  bioData.time = time;
  console.log(bioData);
}

/** Update Actuators */
/*var updateActuators = setInterval(function() {
  if (!digitalRead(actuators.co2Valve) &&
        timeComp(co2Time, time, co2PID.offTime) &&
        ppm<co2PID.target) {
    digitalWrite(actuators.co2Valve, actuators.on);
    setTime(co2Time);
    co2PID.onTime = actuators.co2ValveResponseOffset +
                    co2PID.P*(ppm-co2PID.target) +
                    co2PID.I*(co2PID.target-co2PID.average) +
                    co2PID.D*(ppm-ppm0);
    ppm0 = ppm;
  }
  if (digitalRead(actuators.co2Valve) &&
               (ppm>=co2PID.target ||
                  timeComp(co2Time, time, co2PID.onTime))) {
    digitalWrite(actuators.co2Valve, actuators.off);
    setTime(co2Time);
  }

  if (!digitalRead(actuators.tempValve) &&
        timeComp(tempTime, time, tempPID.offTime) &&
        temp<tempPID.target) {
    digitalWrite(actuators.tempValve, actuators.on);
    setTime(tempTime);
    tempPID.onTime = actuators.tempValveResponseOffset +
                    tempPID.P*(temp-tempPID.target) +
                    tempPID.I*(tempPID.target-tempPID.average) +
                    tempPID.D*(temp-temp0);
    temp0 = temp;
  }
  if (digitalRead(actuators.tempValve) &&
               (temp>=tempPID.target ||
                  timeComp(tempTime, time, tempPID.onTime))) {
    digitalWrite(actuators.tempValve, actuators.off);
    setTime(tempTime);
  }

  if (!actuators.phValve &&
        timeComp(phTime, time, phPID.offTime) &&
        ph<phPID.target) {
    digitalWrite(actuators.phValve, actuators.on);
    setTime(phTime);
    phPID.onTime = actuators.phValveResponseOffset +
                    phPID.P*(ph-phPID.target) +
                    phPID.I*(phPID.target-phPID.average) +
                    phPID.D*(ph-ph0);
    ph0 = ph;
  }
  if (digitalRead(actuators.phValve) &&
               (ph>=phPID.target ||
                  timeComp(phTime, time, phPID.onTime))) {
    actuators.phValve = 1;
    setTime(phTime);
  }
}, readTime);*/

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

