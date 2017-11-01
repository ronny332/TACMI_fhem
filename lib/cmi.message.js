'use strict';

let cmiMessage = (() => {
  const config = require(__base + 'lib/config'),
    data = require(__base + 'lib/cmi.data'),
    server = require(__base + '/lib/cmi.server');

  const Message = require(__base + 'lib/cmi.message.class');

  // message callback to get the input from server instance
  server.setCallback((msgData) => {
    const message = new Message(msgData);
    data.set(message);

    if (config.cmi.server._debug) {
      // const util = require('util');
      // console.info('(dbg) cmi message: ' + util.inspect(message, {depth: 4}));
      console.info('(dbg) ' + message);
    }
  });
})();

module.exports = cmiMessage;