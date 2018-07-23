var i2c = new I2C();
i2c.setup({scl:NodeMCU.D2, sda:NodeMCU.D3});

var phData = [];
var strData = [];
var ph0 = 0;

var time = {
  days  : 0,
  hours : 0,
  mins  : 0,
  secs  : 0
};

var phTime = time;
var dataTime = 5000;
var readTime = 1000;

var phPID = {
  P         : 0.2,
  I         : 0.3,
  D         : -0.2,
  target    : 7.4,
  tolerance : 0.5,
  offTime   : 5*60*readTime,
  onTime    : 0,
  samples   : [0]
};

var actuators = {
  on        : true,
  off       : false,
  phValve   : 0,
  phStep    : NodeMCU.D1,
  phDir     : NodeMCU.D0,
};

var bioData = {
  ph : 0,
  phAvg : phPID.average,
  phValve : 0,
};

/* =============== Helper Functions =============== */
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
var phComm = setInterval(function() {
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
}, readTime);

/** Advance time counter */
var getTime = setInterval(function() {
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

/** Publish data to console */
var dataComm = setInterval(function() {
  bioData.ph = parseInt(strData.join(""));
  bioData.phAvg = phPID.average;
  bioData.phValve = digitalRead(actuators.phValve);
  bioData.time = time;
  console.log(bioData);
}, dataTime);

/** Update Actuators */
var updateActuators = setInterval(function() {
  if (!actuators.phValve &&
        timeComp(phTime, time, phPID.offTime) &&
        bioData.ph<phPID.target) {
    digitalWrite(actuators.phValve, actuators.on);
    setTime(phTime);
    phPID.onTime = phPID.P*(bioData.ph-phPID.target) +
                   phPID.I*(phPID.target-phPID.average) +
                   phPID.D*(bioData.ph-ph0);
    ph0 = bioData.ph;
  }
  if (digitalRead(actuators.phValve) &&
               (bioData.ph>=phPID.target ||
                  timeComp(phTime, time, phPID.onTime))) {
    actuators.phValve = 1;
    setTime(phTime);
  }
}, readTime);

/** Store Samples */
var storeSamples = setInterval(function() {
  if (timeInterval(time)-timeInterval(phTime) >= phPID.offTime*phPID.sample.length/40) {
    if (phPID.samples.length >=40) {
      phPID.samples.shift();
    }
    phPID.samples.push(bioData.ph);
    phPID.average = phPID.samples.reduce(getSum)/phPID.samples.length;
  }
}, readTime);
