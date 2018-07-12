function postData(data){
  content = JSON.stringify(data);
  var options = {
    host: '172.25.16.152',
    port: '1337',
    path:'/newdata',
    method:'POST',
  };
  require("http").request(options, function(res)  {
    var d = "";
    res.on('data', function(data) { d += data; });
    res.on('close', function(data) {
      console.log("Closed: " + d);
    });
  }).end(content);
}

// Loop and send packets to the server / client
var loop = setInterval(() => {
    postData({
        tomato: "potato"
    });
}, 2000);