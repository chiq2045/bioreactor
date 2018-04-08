var Scout = require('zetta').Scout;
var util = require('util');
var stateMachine = require('./device.js');

stateMachineScout = module.exports = function() {
  Scout.call(this);
}

util.inherits(stateMachineScout, Scout);

stateMachineScout.prototype.init = function(next) {
  var self = this;
  setTimeout(function() {
    self.discover(stateMachine)
  }, 1000);
  next();
}
