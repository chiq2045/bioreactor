/**
 * Create a new post request to server with data
 * @param {String} host - The address of the server
 * @param {String} path - The path to post to. Depends on API.
 * @param {Object} data - Object containing data. Will be stringified
 * @param {int} port - The port on which the server is operating
 */
function postData(host, path, data, port) {
  var options = {
    host: host,
    path: path,
    method: 'POST',
    protocol: 'http',
    port: port,
    headers: {
      'content-type':'application/json',
      'content-length':data.length,
      'connection':'close'
    }
  };
  var req = require('http').request(
    options,
    res=> {
      var content = '';
      res.on('data', data=> {
        content += data;
      });
      res.on('close', ()=> {
        console.log(content);
      });
    }
  );
  req.write(JSON.stringify(data));
  req.end();
}
exports = postData;

/**
 * Callback for filling in the options for the request
 * @callback createOptionsCallback
 * @param {Object} options - An object that contains the options
 */
/**
 * A callback that creates the options needed to post data to server
 * @function createOptions
 * @param {createOptionsCallback} - A callback to run
 */
/*postData.prototype.createOptions = function(callback) {
  var self =  this;
  var options = {
    host: self.host,
    path: self.path,
    method: 'POST',
    protocol: 'http',
    port: self.port,
    headers: self.headers,
  };

  callback(options);
};*/

/**
 * 
 */
/*
postData.prototype.sendRequest = function(data) {
  this.data = data;
  var options = {};
  this.createOptions(opt=>{ options = opt; });
  var req = require('http').request(
    options,
    res=> {
      var content = '';
      res.on('data', data=> {
        content += data;
      });
      res.on('close', ()=> {
        console.log(content);
      });
    }
  );
  req.write(JSON.stringify(data));
  req.end();
};
*/