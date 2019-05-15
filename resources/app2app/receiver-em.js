// This sample consumes messages from a Kaleido managed destination
const socket = require('socket.io-client').connect('APP2APP MESSAGING SERVICE API ENDPOINT',
  {
    extraHeaders: {
      Authorization: 'Basic ' + Buffer.from('APP CREDENTIAL USER' + ':' + 'APP CREDENTIAL PASSWORD').toString('base64')
    }
  })
  .on('connect', () => {
    console.log('Connected.');
    socket.emit('subscribe', ['RECEPIENT DESTINATION URI OR NAME'], (err, result) => {
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
  }).on('data', (pkcs7Envelope, key, timestamp) => {

    const forge = require('node-forge');
    const pkcs7 = forge.pkcs7.messageFromPem(pkcs7Envelope);
    pkcs7.decrypt(pkcs7.recipients[0], forge.pki.privateKeyFromPem('RECEPIENT PRIVATE KEY PEM'));
    const message = JSON.parse(pkcs7.content.toString());
    console.log('Message: ' + message.content);
    console.log('Key: ' + key + ', timestamp: ' + timestamp);
    console.log('Signature checks out: ' +
      require('crypto').createVerify('RSA-SHA256')
        .update(message.content)
        .verify('SENDER CERTIFICATE PEM OBTAINED FROM ID REGISTRY BASED ON SENDER DESTINATION URI',
          Buffer.from(message.headers.signature)));
  });