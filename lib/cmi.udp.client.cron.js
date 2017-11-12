'use strict';

const cmiUdpClientCron = (cmiData) => {
  const udpClient = require(__base + 'lib/cmi.udp.client'),
    config = require(__base + 'lib/config'),
    data = cmiData.data,
    dataUnits = require(__base + 'lib/cmi.data.units'),
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
    knots[type].forEach((knotData, knot) => {
      // setInterval(() => {
      setTimeout(() => {
        if (Object.keys(data[type][knot]).length > 0) {
          const message = new Message(),
            messages = [];

          let len = 0,
            no = Number.MAX_SAFE_INTEGER,
            position,
            unit;

          Object.keys(data[type][knot]).forEach((pos) => {
            position = message.getIndexAndPosition(type, pos);

            if (no > position.no) {
              len = messages.push(new Message());
            }
            no = position.no;

            messages[len - 1].setKnot(knot);
            messages[len - 1].setIndex(position.index);

            unit = 0;

            switch (type) {
              case 'A':
                if (config.cmi.knots[knot].items.hasOwnProperty(pos) && config.cmi.knots[knot].items[pos].hasOwnProperty('unit')) {
                  unit = dataUnits.units[config.cmi.knots[knot].items[pos].unit] | 1;
                }

                // analog values are stored as strings, so removing the dot create a valid value
                messages[len - 1].setValue(type, position.no, ('' + data[type][knot][pos].value).replace('.', ''), unit);
                break;
              case 'D':
                messages[len - 1].setValue(type, position.no, !!data[type][knot][pos].value, 1);
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
        // }, knots[type][knot].interval);
      }, 2000);
    });
  });
};

module.exports = cmiUdpClientCron;