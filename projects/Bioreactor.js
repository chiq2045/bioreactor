/**
 * Bioreactor code setup
 */
/***** Imports *****/
const wifi = require('Wifi');
const http = require('http');

/***** Setup Communication Protocols *****/
let i2c = new I2C();
let spi = new SPI();
let phAddress = 0x63;   // EZO pH i2c address
let co2Address = 0x4d;  // mh-z16 I2C/UART bridge address

// I2C pins
let sda = D23;
let scl = D22;

// SPI pins
let miso = D25;
let cs = D33;
let sck = D32;

// setup I2C bus
i2c.setup({
  scl:scl,
  sda:sda
});

let phSensor = new (require('ezoph'))( i2c, phAddress );
let co2Sensor = new (require('mh_z16'))( i2c, co2Address );
let tempSensor = new (require('max31855k'))( spi, sck, miso, cs );

let co2Timer = setInterval(() => {
    digitalWrite(actuators.co2, true);
    console.log("Co2 on");
    setTimeout(() => {
        digitalWrite(actuators.co2, false);
        console.log("Co2 off");
    }, 5000);
}, (1000 * 60 * 5));



co2Sensor.begin(); // initialize the co2 Sensor
tempSensor.begin(); //initialise temperature sensor
// measure the CO2 concentration every 10 seconds
let readCO2 = setInterval(() => {co2Sensor.measure( () => {});}, 2000 );
// measure the temperature
let readTemp = setInterval(() => {tempSensor.readC();}, 2000);
// measure pH
let readPH = setInterval(() => {phSensor.read(() => {});}, 2000);
//actuators
let actuators = {
  temp: D19,
  co2 : D18,
  tempTime:getTime(),
  co2Time: getTime(),
  tempStatus : false,
  co2Status : false
};

let bioData = {
  ph   : 0,
  co2  : 0,
  temp : 0
};

let updateData = setInterval(() => {
  bioData.co2 = co2Sensor.ppm;
  bioData.temp = tempSensor.temp;
  bioData.ph = phSensor.ph;
}, 4000);


let updateActuators = setInterval(() => {
  //actuators.temp = actuators.tempStatus;
  //actuators.co2 = actuators.co2Status;

  if (!actuators.tempStatus
      && bioData.temp < 36.25
      && getTime()-actuators.tempTime > 15) {
    digitalWrite(actuators.temp, true);
    actuators.tempStatus = true;
    actuators.tempTime= getTime();
    console.log('on');
  }
  if (actuators.tempStatus
      && (bioData.temp >= 37
      || getTime()-actuators.tempTime > 5)) {
    digitalWrite(actuators.temp, false);
    actuators.tempStatus = false;
    actuators.tempTime = getTime();
    console.log('off');
  }
}, 1000);
analogWrite(D13, .15)

/* Useful information for later
  100 ms is the amount of time to deliver one drop of NaOH 
  out of 5 drops a 6th drop will happen
  80 ms will cause only 4 out of 5 drops to happen
let addNaOH = function() {
 D12.write(false)
 setTimeout(()=> {
  D12.write(true)
 }, 100)
}
*/ 