'use strict';

const fhemTelnetClient = ((data) => {
  const config = require(__base + 'lib/config');

  const net = require('net');

  const _cleanName = (name) => {
    return name.replace(/ /g, '_');
  };

  const getConnection = (func) => {
    const client = net.createConnection({
      host: config.fhem.telnet.client.host,
      port: config.fhem.telnet.client.port,
      timeout: 2500
    });

    client.on('close', () => {
      if (config.fhem.telnet.client._debug) {
        console.info(`(dbg) closed connection to ${config.fhem.telnet.client.host}:${config.fhem.telnet.client.port}`);
      }
    });

    client.on('connect', () => {
      if (config.fhem.telnet.client._debug) {
        console.info(`(dbg) opening connection to ${config.fhem.telnet.client.host}:${config.fhem.telnet.client.port}`);
      }
    });

    client.on('data', (buf) => {
      if (config.fhem.telnet.client._debug) {
        console.info(`(dbg) telnet response: ${buf.toString().trim()}`);
      }
    });

    client.on('error', (err) => {
      console.error(`(err) got error connecting to ${config.fhem.telnet.client.host}:${config.fhem.telnet.client.port}: `, err.message);
    });

    client.on('timeout', () => {
      console.error(`(err) got timeout connecting to ${config.fhem.telnet.client.host}:${config.fhem.telnet.client.port}`);
    });

    setImmediate(() => {
      func(client);
    });
  };

  const init = (type, cb) => {
    if (type === 'fhem') {
      getConnection((client) => {
        const commands = [],
          prefix = config.fhem.readings.modifiable.prefix,
          readings = [],
          setList = [];

        commands.push(`define ${config.fhem.telnet.client.device} dummy`);

        Object.keys(config.cmi.knots).forEach((knot) => {
          if (config.cmi.knots[knot].hasOwnProperty('send') && config.cmi.knots[knot].send &&
            config.cmi.knots[knot].hasOwnProperty('type') && (config.cmi.knots[knot].type === 'A' || config.cmi.knots[knot].type === 'D')) {
            if (config.cmi.knots[knot].hasOwnProperty('items')) {
              Object.keys(config.cmi.knots[knot].items).forEach((key) => {
                if (config.cmi.knots[knot].items[key].hasOwnProperty('name') && config.cmi.knots[knot].items[key].name.trim().length > 3)
                  switch (config.cmi.knots[knot].type) {
                    case 'A':
                      if (config.cmi.knots[knot].items[key].hasOwnProperty('decimals') &&
                        config.cmi.knots[knot].items[key].hasOwnProperty('unit')) {
                        let value = ((0 + config.cmi.knots[knot].items[key].decimals > 0)) ? '0.'.padEnd(0 + config.cmi.knots[knot].items[key].decimals + 2, '0') : '0';

                        readings.push(`setreading ${config.fhem.telnet.client.device} ${prefix}${_cleanName(config.cmi.knots[knot].items[key].name)} ${value}`);

                        let minmax,
                          range;

                        try {
                          if (config.cmi.knots[knot].items[key].hasOwnProperty('range')) {
                            range = config.cmi.knots[knot].items[key].range.split('/');

                            if (range.length === 2) {
                              minmax = range[0].split('-');
                            }
                          }
                        }
                        catch (ex) {
                          console.error(`(err) wrong format for "range": ${config.cmi.knots[knot].items[key].range}`);
                        }

                        if (minmax && Array.isArray(minmax) && minmax.length === 2) {
                          let values = [];

                          for (let i = parseFloat(minmax[0]); i <= parseFloat(minmax[1]); i += parseFloat(range[1])) {
                            values.push(i.toFixed(parseInt(config.cmi.knots[knot].items[key].decimals)));
                          }

                          setList.push(`${prefix}${_cleanName(config.cmi.knots[knot].items[key].name)}:${values.join(',')}`);
                        }
                      }

                      break;
                    case 'D':
                      if (config.cmi.knots[knot].items[key].hasOwnProperty('format')) {
                        let format = config.cmi.knots[knot].items[key].format.split('/');

                        if (format.length === 2) {
                          readings.push(`setreading ${config.fhem.telnet.client.device} ${prefix}${_cleanName(config.cmi.knots[knot].items[key].name)} ${format[1]}`);
                          setList.push(`${prefix}${_cleanName(config.cmi.knots[knot].items[key].name)}:${format.join(',')}`);
                        }
                      }

                      break;
                  }
              });
            }
          }
        });

        if (setList.length > 0) {
          commands.push(`attr ${config.fhem.telnet.client.device} setList ${setList.join(' ')}`);
        }

        if (readings.length > 0) {
          for (let i = 0; i < readings.length; i++) {
            commands.push(readings[i]);
          }
        }

        if (config.fhem.telnet.client._debug) {
          console.info(`(dbg) sending commands to ${config.fhem.telnet.client.host}:${config.fhem.telnet.client.port}: "${commands.join(';')}"`);
        }

        client.end(commands.join(';') + '\r\n');

        if (typeof cb === 'function') {
          setImmediate(() => {
            cb();
          });
        }
      });
    }
    else {
      // nothing yet
      if (typeof cb === 'function') {
        setImmediate(() => {
          cb();
        });
      }
    }
  };

  data.on('update', (type, update) => {
    setImmediate(() => {
      getConnection((client) => {
        let commands = [],
          decimals = 2;

        update.forEach((d) => {
          if (type === 'A') {
            if (config.cmi.knots.hasOwnProperty(d.knot) &&
              config.cmi.knots[d.knot].hasOwnProperty('type') && config.cmi.knots[d.knot].type === 'A' &&
              config.cmi.knots[d.knot].hasOwnProperty('items') &&
              config.cmi.knots[d.knot].items.hasOwnProperty(d.no) &&
              config.cmi.knots[d.knot].items[d.no].hasOwnProperty('decimals')) {

              decimals = 0 + config.cmi.knots[d.knot].items[d.no].decimals;
            }

            commands.push(`setreading ${config.fhem.telnet.client.device} ${_cleanName(data[type][d.knot][d.no].name)} ${data[type][d.knot][d.no].value.toFixed(decimals)}`);
          }
          else {
            commands.push(`setreading ${config.fhem.telnet.client.device} ${_cleanName(data[type][d.knot][d.no].name)} ${data[type][d.knot][d.no].value}`);
          }
        });

        commands.push('quit');

        if (config.fhem.telnet.client._debug) {
          console.info(`(dbg) sending commands to ${config.fhem.telnet.client.host}:${config.fhem.telnet.client.port}: "${commands.join(';')}"`);
        }

        client.end(commands.join(';') + '\r\n');
      });
    });
  });

  return {
    init: init
  };
});

module.exports = fhemTelnetClient;