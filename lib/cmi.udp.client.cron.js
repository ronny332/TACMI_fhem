'use strict';

const cmiUdpClientCron = (cmiData) => {
  const udpClient = require(__base + 'lib/cmi.udp.client'),
    config = require(__base + 'lib/config'),
    data = cmiData.data,
    Message = require(__base + 'lib/cmi.message.class');

  const knots = {
    'A': [], 'D': []
  };

  Object.keys(config.cmi.knots).forEach((key) => {
    if (config.cmi.knots[key].hasOwnProperty('send') && config.cmi.knots[key].send &&
      config.cmi.knots[key].hasOwnProperty('interval') && +config.cmi.knots[key].interval > 0) {
      knots[config.cmi.knots[key].type][key] = config.cmi.knots[key];
    }
  });

  ['A', 'D'].forEach((type) => {
    knots[type].forEach((knot, key) => {
      setInterval(() => {
      // setTimeout(() => {
        if (Object.keys(data[type][key]).length > 0) {
          const message = new Message(),
            messages = [];

          let len = 0,
            no = Number.MAX_SAFE_INTEGER,
            position;

          Object.keys(data[type][key]).forEach((pos) => {
            position = message.getIndexAndPosition(type, pos);

            if (no > position.no) {
              len = messages.push(new Message());
            }
            no = position.no;

            messages[len - 1].setKnot(key);
            messages[len - 1].setIndex(position.index);

            switch (type) {
              case 'A':
                // analog values are stored as strings, so removing the dot create a valid value
                messages[len - 1].setValue(type, position.no, ('' + data[type][key][pos].value).replace('.', ''));
                break;
              case 'D':
                messages[len - 1].setValue(type, position.no, !!data[type][key][pos].value);
                break;
            }
          });

          messages.forEach((message) => {
            udpClient.send(message, (err) => {
              if (err) {
                console.error(`(err) message ${message.toString()} not sent`);
              }

              if (config.cmi.udp.client._debug) {
                console.info(`(dbg) message ${message.toString()} sent to C.M.I.`);
              }
            });
          });

          messages.length = 0;
        }
      }, knots[type][key].interval);
      // }, 2000);
    });
  });
};

module.exports = cmiUdpClientCron;