// Setup variables
var wifi = require("Wifi");
var http = require("http");
var led = NodeMCU.D4;
var on = 0;
var off = 1;
// Start Access point for Ad-Hoc network and wifi newtork
//close wifi connection
wifi.connect("WWU-Aruba-HWauth", {authMode:0});
wifi.disconnect();
wifi.startAP("Bioreactor-esp", {authMode:0});
wifi.save();

// Setup webpages
// turn on led
function ledOn(res) {
  digitalWrite(led, on);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("led on");
}
// turn off led
function ledOff(res) {
  digitalWrite(led, off);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("led off");
}
// Handle wrong addresses
function handleNotFound(res, a) {
  digitalWrite(led, on);
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end("404: Page "+a.pathname+" not found");
  digitalWrite(led, off);
}
// Serve up different webpages
function onPageRequest(req, res) {
  var a = url.parse(req.url, true);
  if (a.pathname=="/") {
    digitalWrite(led, on);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("Index Page");
    digitalWrite(led, off);
  } else if (a.pathname=="/ledOn") {
    ledOn(res);
  } else if (a.pathname=="/ledOff") {
    ledOff(res);
  } else {
    handleNotFound(res,a);
  }
}
// Begin web server
// Port 80 chosen so that server is at address http://espruino
http.createServer(onPageRequest).listen(80);