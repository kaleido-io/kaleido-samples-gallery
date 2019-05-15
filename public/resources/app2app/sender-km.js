
// This sample sends a message every two seconds from a Kaleido managed destination
const socket = require('socket.io-client').connect('APP2APP MESSAGING SERVICE API ENDPOINT',
  {
    extraHeaders: {
      Authorization: 'Basic ' + Buffer.from('APP CRED USER' + ':' + 'APP CRED PASSWORD').toString('base64')
    }
  })
  .on('connect', () => {
    console.log('Connected.');
    setInterval(send, 2000);
  }).on('delivery-report', data => {
    console.log('Delivery report: ' + JSON.stringify(data));
  }).on('disconnect', () => {
    console.log('Disconnected.');
  }).on('exception', exception => {
    console.log('Exception: ' + exception);
  }).on('error', err => {
    console.log('Error: ' + err);
  }).on('connect_error', err => {
    console.log('Connection error: ' + err);
  });

function send() {
  socket.emit('produce', {
    headers: {
      from: 'SENDER DESTINATION URI',
      to: 'RECEPIENT DESTINATION URI',
    }
    , content: 'Testing 1-2-3'
  },
    'samplekey',
    err => {
      if (err) {
        console.log('Delivery error: ' + err);
      }
    });
}