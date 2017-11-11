'use strict';

let cmiMessage = (() => {
  const config = require(__base + 'lib/config'),
    data = require(__base + 'lib/cmi.data'),
    server = require(__base + '/lib/cmi.udp.server');

  const Message = require(__base + 'lib/cmi.message.class');

  // const test = new Message();
  // test.setValue('D', 3, false);
  // test.setValue('D', 4, false);
  // test.setValue('D', 10, false);
  // test.setValue('D', 10, false);
  // test.setValue('D', 11, false);
  // test.setKnot(52);
  // test.setIndex(9);
  // console.log(test.toString());
  //
  // const test2 = new Message();s
  // test2.setValue('A', 1, 12.2, 2);
  // test2.setValue('A', 4, 12.2, 2);
  // test2.setKnot(51);
  // test2.setIndex(4);
  // console.log(test2.toString());
  //
  // const client = require(__base + 'lib/cmi.udp.client');
  // client.send(test, (err) => {
  //   console.log(err);
  // });
  //
  // client.send(test2, (err) => {
  //   console.log(err);
  // });


  // message callback to get the input from server instance
  server.setCallback((msgData) => {
    const message = new Message(msgData);
    data.setMessage(message);

    if (config.cmi.udp.server._debug) {
      // const util = require('util');
      // console.info('(dbg) cmi message: ' + util.inspect(message, {depth: 4}));
      console.info('(dbg) message dec: ' + message);
    }
  });
})();

module.exports = cmiMessage;