var PeerServer = require('peer').PeerServer;
var fs = require('fs');

var server = new PeerServer({
  port: process.env.PORT || 9000,
  key: 'webrtc-bbs',
  allow_discovery: true,
});

function sendResponse(path, type, res, next) {
  fs.readFile("./public/" + path, function (err, data) {
    if (err) {
      next(err);
      return;
    }

    res.setHeader('Content-Type', type);
    res.writeHead(200);
    res.end(data);
    next();
  });
}

server._app.get(server._options.path, function(req, res, next) {
  sendResponse('index.html', 'text/html', res, next);
});

server._app.get(server._options.path + 'js/webrtc-bbs.js', function(req, res, next) {
  sendResponse('js/webrtc-bbs.js', 'text/javascript', res, next);
});

server._app.get(server._options.path + 'css/index.css', function(req, res, next) {
  sendResponse('css/index.css', 'text/css', res, next);
});

console.log("Started on " +
            (server._options.ip ? server._options.ip : 'localhost') +
            ":" + server._options.port);
