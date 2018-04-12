var wifi;
/*
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
var ssid = "WWU-Aruba-HWauth";
var options = {/*password:"my-pwd",*/ authMode:0};

function onInit() {
  wifi = require("Wifi");
  wifi.connect(ssid, options, function(err) {
    if (err) {
      console.log("Connection error: "+err);
      return;
    }
    console.log("connected? err=", err, "info=", wifi.getIP());
  });
}
wifi.stopAP();