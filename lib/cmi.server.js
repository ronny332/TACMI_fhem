'use strict';

let cmiServer = (() => {
  const config = require(__base + 'lib/config');
  let callback = null;

  const dgram = require('dgram'),
    server = dgram.createSocket('udp4');

  // default callback
  const defaultMessageCallback = () => {
    if (config.cmi.server._debug) {
      console.info('(dbg) this is the default message callback, replace it with your own implementation');
    }
  };

  callback = defaultMessageCallback;

  // overwrite default callback
  const setCallback = (cb) => {
    callback = cb;
  };

  // listener functions
  server.on('error', (err) => {
    console.error(`(err) cmi server error:\n${err.stack}`);
    server.close();
  });

  server.on('listening', () => {
    if (config.cmi.server._debug) {
      const address = server.address();
      console.info(`(dbg) cmi server listing to ${address.address}:${address.port}`);
    }
  });

  server.on('message', (msg, rinfo) => {
    if (msg.length !== config.cmi.message.length) {
      console.error(`(err) cmi server got wrong message length of ${msg.length} bytes (should be ${config.cmi.message.length} bytes) from ${rinfo.address}:${rinfo.port}`);
      return;
    }

    if (config.cmi.server._debug) {
      const msgBin = [],
        msgHex = [];

      msg.forEach((val) => {
        msgBin.push(parseInt(val, 10).toString(2).padStart(8, '0'));
        msgHex.push(parseInt(val, 10).toString(16).padStart(2, '0'));
      });

      console.info(`(dbg) message bin: ${msgBin.join(' ')}`);
      console.info(`(dbg) message hex: ${msgHex.join(' ')} from ${rinfo.address}:${rinfo.port}`);
    }

    process.nextTick(() => {
      callback(msg);
    });
  });

  // bind server
  server.bind(config.cmi.server.port);

  return {
    setCallback: setCallback
  };
})();

module.exports = cmiServer;