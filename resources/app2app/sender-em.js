// This sample sends a message every two seconds from an externally managed destination
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
    console.log('Client disconnected.');
  }).on('exception', exception => {
    console.log('Service reported an exception: ' + exception);
  }).on('error', err => {
    console.log('Error: ' + err);
  }).on('connect_error', err => {
    console.log('Connection error: ' + err);
  });

function send() {
  let content = 'Testing 1-2-3';
  let signature = require('crypto').createSign('RSA-SHA256').update(content).sign('PRIVATE KEY PEM');
  socket.emit('produce', {
    headers: {
      from: 'SENDER DESTINATION URI',
      to: 'RECEPIENT DESTINATION URI',
      signature
    }
    , content
  },
    'samplekey',
    err => {
      if (err) {
        console.log('Delivery error: ' + err);
      }
    });
}