var zetta = require('zetta');
var stateMachineScout = require('./scout.js');
var stateMachineApp = require('./app.js');

zetta()
  .name('State Machine Zetta')
  .use(stateMachineScout)
  .use(stateMachineApp)
  .listen(1337, function(){
      console.log('Zetta is running at http://127.0.0.1:1337');
});
