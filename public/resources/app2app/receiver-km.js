// This sample consumes messages from a Kaleido managed destination
const socket = require('socket.io-client').connect('APP2APP MESSAGING SERVICE API ENDPOINT',
  {
    extraHeaders: {
      Authorization: 'Basic ' + Buffer.from('APP CREDENTIAL USER' + ':' + 'APP CREDENTIAL PASSWORD').toString('base64')
    }
  })
  .on('connect', () => {
    console.log('Connected.')
    socket.emit('subscribe', ['DESTINATION URI OR NAME'], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
      }
    });
  }).on('disconnect', () => {
    console.log('Disconnected.');
  }).on('exception', exception => {
    console.log('Exception: ' + exception);
  }).on('error', err => {
    console.log('Error: ' + err);
  }).on('connect_error', err => {
    console.log('Connection error: ' + err);
  }).on('data', (message, key, timestamp) => {
    console.log('Message from: ' + message.headers.from);
    console.log('Content: ' + message.content);
    console.log('key: ' + key);
    console.log('timestamp: ' + timestamp);
  });
