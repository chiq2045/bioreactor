/**
 * Code to run the bioreactor
 */

/** ***** Setup I2C and SPI **** */
const i2c = new I2C();
const spi = new SPI();

/** **** Setup pins for I2C and SPI **** */
const sda = D23;
const scl = D22;

const miso = D25;
const cs = D33;
const sck = D32;

/** **** Setup I2C bus **** */
const phAddress = 0x63;
const co2Address = 0x4d;
i2c.setup({
  scl,
  sda,
});

/** **** Create instances of all devices **** */
const phSensor = require('Ezoph').connect(i2c, phAddress);
const co2Sensor = require('MH_Z16').connect(i2c, co2Address);
const tempSensor = require('Max31855k').connect(spi, sck, miso, cs);

/** TODO: Initialise devices */
co2Sensor.begin();
tempSensor.begin();

/** TODO: Define all variables to be used for data processing */
const readTime = 2000;
const updateTime = 5000;

const bioreactorData = {
  ph: 0,
  co2: 0,
  temp: 0,
  timeStamp: 0,
};

const controllers = {
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
    timeOff: 1000 * 60 * 5,
    startTime: 0,
    stopTime: 0,
  },
  ph: {
    pin: {
      dir: D2,
      step: D15,
    },
    status: false,
    timeOn: 100,
  },
};

/** TODO: Start intervals for data reading tasks */
const updateBioreactorData = setInterval(() => {
  phSensor.read((res) => { bioreactorData.ph = res; });
  co2Sensor.measure((res) => { bioreactorData.co2 = res; });
  bioreactorData.temp = tempSensor.read();
}, updateTime);

/** TODO: Functions for controllers */
function addNAOH() {
  const { step } = controllers.ph.pin;
  const { timeOn } = controllers.ph;

  step.write(on);
  setTimeout(() => { step.write(false); }, timeOn);
}

const updateCO2Controller = setInterval(() => {
  const { pin, timeOn, timeOff } = controllers.co2;
  let { status, startTime, stopTime } = controllers.co2;
  const timePassed = getTime();

  if (status) {
    if (timePassed - startTime < timeOn) {
      pin.write(true);
    } else {
      stopTime = getTime();
      status = false;
    }
  } else if (timePassed - stopTime < timeOff) {
    pin.write(false);
  } else {
    startTime = getTime();
    status = true;
  }
});
/** TODO: Start intervals for data processing */
/** TODO: Start http server */
