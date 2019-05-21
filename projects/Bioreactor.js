/**
 * Bioreactor code setup
 */
/***** Imports *****/
// const wifi = require('Wifi');
// const http = require('http');

/***** Setup Communication Protocols *****/
let i2c = new I2C();
let spi = new SPI();
let phAddress = 0x63; // EZO pH i2c address
let co2Address = 0x4d; // mh-z16 I2C/UART bridge address

// I2C pins
let sda = D23;
let scl = D22;

// SPI pins
let miso = D25;
let cs = D33;
let sck = D32;

// setup I2C bus
i2c.setup({
  scl: scl,
  sda: sda,
});

let phSensor = new (require('ezoph'))(i2c, phAddress);
let co2Sensor = new (require('mh_z16'))(i2c, co2Address);
let tempSensor = new (require('max31855k'))(spi, sck, miso, cs);

let co2Timer = setInterval(() => {
  digitalWrite(actuators.co2, true);
  console.log('Co2 on');
  setTimeout(() => {
    digitalWrite(actuators.co2, false);
    console.log('Co2 off');
  }, actuators.co2.timeOn);
}, actuators.co2.timeBetweenOpeningGates);

co2Sensor.begin(); // initialize the co2 Sensor
tempSensor.begin(); //initialise temperature sensor
// measure the CO2 concentration every 10 seconds
let readCO2 = setInterval(() => {
  co2Sensor.measure(() => {});
}, 2000);
// measure the temperature
let readTemp = setInterval(() => {
  tempSensor.readC();
}, 2000);
// measure pH
let readPH = setInterval(() => {
  phSensor.read(() => {});
}, 2000);
//actuators
let actuators = {
  temp: {
    pin: D19,
    status: false,
    timeOn: 7000,
    timeOff: 14000,
  },
  co2: {
    pin: D18,
    status: false,
    timeOn: 5000,
    timeBetweenOpeningGates: 1000 * 60 * 5,
  },
  ph: {
    pin: {
      dir: D2,
      step: D15,
    },
    status: false,
    timeOn: 500,
  },
};

let bioreactorData = {
  ph: 0,
  co2Upstream: 0,
  temp: 0,
  co2Downstream: 0,
};

const updateTime = 4000;
const readTime = 1000;

let updateBioreactorData = setInterval(() => {
  bioreactorData.co2Upstream = co2Sensor.ppm;
  bioreactorData.temp = tempSensor.temp;
  bioreactorData.ph = phSensor.ph;
}, updateTime);

let updateActuators = setInterval(() => {
  // TODO: Update the position of the actuators
});

/* Useful information for later
let addNaOH = function() {
 D12.write(false)
 setTimeout(()=> {
  D12.write(true)
 }, 100)
}*/
