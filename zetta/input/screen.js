Device = require('zetta').Device;
var util = require('util');

//Set up Screen class
var Screen = module.exports = function() {
  Device.call(this);
}

util.inherits(Screen, Device);

Screen.prototype.init = function(config) {
  //Class metadata
  config
    .type('screen')
    .name('state_machin_screen')
    .state('ready');

  //Set up State Machine
  config
    .when('ready', { allow: ['write'] })
    .map('write', this.write, [{ type: 'text', name: 'textToWrite' }])
    .monitor('written');
}

Screen.prototype.write = function(textToWrite, cb) {
  this.written = textToWrite;
  cb();
}
