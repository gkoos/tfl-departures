var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:3000?atcocode=490003025W');
ws.on('open', function() {
    console.log("Connected");
});

ws.on('message', function(data, flags) {
  console.log(data);
});

ws.on('close', function(data) {
  console.log("DISCONNECTED");
});

ws.on('error', function(data, flags) {
  console.log(data);
});