var options = {
  hostname: "http://127.0.0.1:1337/newdata",
  method: "POST",
  port: 1337,
  path:"/newdata",
  headers: {"Content-Type":"application/json"}
};

var req = http.request(options, function(res) {
  console.log('Status: ' + res.statusCode);
  console.log('Headers: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function(body) {
    console.log('Body: ' + body);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

var data = JSON.stringify({"ph":parseInt(bioData.ph), "co2":bioData.co2, "temp":bioData.temp});

req.write(data);

req.end();