var wifi = require("Wifi");
/**
wifi.scan(function(arrayOfAcessPoints) {
  if ( arrayOfAcessPoints !== null) {
    for (var i=0; i<arrayOfAcessPoints.length; i++) {
      print("Access point: " + i + " = " + JSON.stringify(arrayOfAcessPoints[i]));
    }
  }
  else {
  print("no Access points found");
  }
});
*/
var ssid = "cwu-public";
var options = {/*password:"my-pwd",*/ authMode:0};
wifi.connect(ssid, options, function(err){
  console.log("connected? err=", err, "info=", wifi.getIP());
});