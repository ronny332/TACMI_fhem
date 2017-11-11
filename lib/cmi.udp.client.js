'use strict';

const cmiUdpClient = (() => {
  const config = require(__base + 'lib/config'),
    Message = require(__base + 'lib/cmi.message.class');

  const dgram = require('dgram');

  const send = (message, cb) => {
    if (!message instanceof Message) {
      throw ('parameter message has to be a instance of Message');
    }

    if (!Buffer.isBuffer(message.data) || message.data.length !== config.cmi.message.length) {
      throw ('invalid data in message');
    }

    const client = dgram.createSocket('udp4');

    client.send(message.data, config.cmi.coe.port, config.cmi.coe.host, (err) => {
      if (err) {
        console.error(`(err) unable to send udp message to C.M.I.: `, err.message);
      }
      client.close();

      if (typeof cb === 'function') {
        setImmediate(() => {
          cb(err);
        });
      }
    });
  };

  return {
    send: send
  };
})();

module.exports = cmiUdpClient;