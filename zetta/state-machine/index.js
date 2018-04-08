var zetta = require('zetta');
var stateMachineDevice = require('./device.js');

zetta()
  .name('State Machine Zetta')
  .use(stateMachineDevice)
  .listen(1337, function(){
      console.log('Zetta is running at http://127.0.0.1:1337');
});
