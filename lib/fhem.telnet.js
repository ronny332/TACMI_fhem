'use strict';

const fhemTelnet = ((data) => {
  const config = require(__base + 'lib/config');

  const net = require('net');

  const _cleanName = (name) => {
    return name.replace(/ /g, '_');
  };

  data.on('update', (type, update) => {
    setImmediate(() => {
      if (config.fhem.telnet._debug) {
        console.info(`(dbg) opening connection to ${config.fhem.telnet.host}:${config.fhem.telnet.port}`);
      }

      const client = net.connect({host: '10.0.0.23', port: 7072, timeout: 2500}, () => {
        let cmd = [],
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

            cmd.push(`setreading ${config.fhem.telnet.device} ${_cleanName(data[type][d.knot][d.no].name)} ${data[type][d.knot][d.no].value.toFixed(decimals)}`);
          }
          else {
            cmd.push(`setreading ${config.fhem.telnet.device} ${_cleanName(data[type][d.knot][d.no].name)} ${data[type][d.knot][d.no].value}`);
          }
        });

        cmd.push('quit');

        if (config.fhem.telnet._debug) {
          console.info(`(dbg) sending commands to ${config.fhem.telnet.host}:${config.fhem.telnet.port}: "${cmd.join(';')}"`);
        }

        client.end(cmd.join(';') + '\r\n');
      });

      client.on('close', () => {
        if (config.fhem.telnet._debug) {
          console.info(`(dbg) closed connection to ${config.fhem.telnet.host}:${config.fhem.telnet.port}`);
        }
      });

      // client.on('end', () => {
      //   if (config.fhem.telnet._debug) {
      //     console.log(`(dbg) closing connection to ${config.fhem.telnet.host}:${config.fhem.telnet.port}`);
      //   }
      // });

      client.on('error', (err) => {
        console.error(`(err) got error connecting to ${config.fhem.telnet.host}:${config.fhem.telnet.port}: `, err.message);
      });

      client.on('timeout', () => {
        console.error(`(err) got timeout connecting to ${config.fhem.telnet.host}:${config.fhem.telnet.port}: `);
      });
    });
  });
});

module.exports = fhemTelnet;