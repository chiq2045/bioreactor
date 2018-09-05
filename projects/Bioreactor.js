/**
 * Bioreactor code setup
 */
/***** Imports *****/
var wifi = require('Wifi');
var http = require('http');

/***** Setup Communication Protocols *****/
var i2c = new I2C();
var spi = new SPI();
var phAddress = 0x63;   // EZO pH i2c address
var co2Address = 0x4d;  // mh-z16 I2C/UART bridge address

// I2C pins
var sda = D23;
var scl = D22;

// SPI pins
var miso = D25;
var cs = D33;
var sck = D32;

// setup I2C bus
i2c.setup({
  scl:scl,
  sda:sda
});

P = new (require('ezoph'))( i2c, phAddress );
C = new (require('mh_z16'))( i2c, co2Address );
T = new (require('max31855k'))( spi, sck, miso, cs );

var co2Timer = setInterval(() => {
    digitalWrite(actuators.co2, true);
    console.log("Co2 on");
    setTimeout(() => {
        digitalWrite(actuators.co2, false);
        console.log("Co2 off");
    }, 5000);
}, (1000 * 60 * 5));

/*
const CMDS = {
  readData: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  readCommand: [0xff, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79],
  calCommand: [0xff, 0x01, 0x87, 0x00, 0x00, 0x00, 0x00, 0x00, 0x78]
};

Serial2.setup(9600, {tx: D4, rx: D15});

function sendcommand(arr) {
	Serial2.write(arr);
}

function measure() {
	sendcommand(CMDS.readCommand);
	
    console.log(Serial2.available());
	while(Serial2.available()) {
		console.log("reading data: ");
		var result = Serial2.read();
		console.log(result);
	}
}

/*
C.begin(); // initialize the co2 Sensor
T.begin(); //initialise temperature sensor
// measure the CO2 concentration every 10 seconds
var readCO2 = setInterval(function(){C.measure( () => {});}, 2000 );
// measure the temperature
var readTemp = setInterval(() => {T.readC();}, 2000);
// measure pH
var readPH = setInterval(() => {P.read(() => {});}, 2000);
//actuators
var actuators = {
  temp : D19,
  co2:D18,
  tempTime:getTime(),
  co2Time: getTime(),
  tempStatus : false,
  co2Status : false
};

var bioData = {
  ph   : 0,
  co2  : 0,
  temp : 0
};

var updateData = setInterval(() => {
  bioData.co2 = C.ppm;
  bioData.temp = T.temp;
  bioData.ph = P.ph;
}, 4000);

/*
var updateActuators = setInterval(() => {
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
    digitalWrite(D19, false);
    actuators.tempStatus = false;
    actuators.tempTime = getTime();
    console.log('off');
  }
}, 1000);
analogWrite(D13, .15)

var addNaOH = function() {
 D12.write(false)
 setTimeout(()=> {
  D12.write(true)
 }, 100)
}

*/