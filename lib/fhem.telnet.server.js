'use strict';

const fhemTelnetServer = (data) => {
  const config = require(__base + 'lib/config');

  const net = require('net');

  const server = net.createServer((client) => {
    client.write('Welcome, enter "help" for details\n> ');

    if (config.fhem.telnet.server._debug) {
      console.info(`(dbg) new connection from ${client.remoteAddress}:${client.remotePort}`);
    }

    client.on('data', (buf) => {
      const bytesWritten = client.bytesWritten,
        commands = buf.toString().trim().split(';');

      for (let i = 0; i < commands.length; i++) {
        let cmd = commands[i].split(' ');

        switch (cmd[0]) {
          case 'get':
            if (cmd.length > 1) {
              switch (cmd[1]) {
                case 'knot':
                  switch (cmd.length) {
                    case 2:
                      client.write(JSON.stringify(data));

                      break;
                    case 3:
                      switch (cmd[2]) {
                        case 'A':
                        case 'D':
                          client.write(JSON.stringify(data[cmd[2]]));

                          break;
                        default:
                          client.write(`invalid data type ${cmd[2]}`);
                      }

                      break;
                    case 4:
                      switch (cmd[2]) {
                        case 'A':
                        case 'D':
                          if (data[cmd[2]].hasOwnProperty(cmd[3])) {
                            client.write(JSON.stringify(data[cmd[2]][cmd[3]]));
                          }
                          else {
                            client.write(`there is no knot ${cmd[3]} for type ${cmd[2]}`);
                          }

                          break;
                        default:
                          client.write(`invalid data type ${cmd[2]}`);
                      }

                      break;
                  }

                  break;
                case 'knots':
                  switch (cmd.length) {
                    case 2:
                      const knotsAll = {
                        'A': Object.keys(data.A),
                        'D': Object.keys(data.D)
                      };

                      client.write(JSON.stringify(knotsAll));

                      break;
                    case 3:
                      if (data.hasOwnProperty(cmd[2])) {
                        const knotsSingle = Object.keys(data[cmd[2]]);

                        client.write(JSON.stringify(knotsSingle));
                      }
                      else {
                        client.write(`type "${cmd[2]}" is invalid`);
                      }

                      break;
                  }

                  break;
              }
            }
            else {
              client.write('get needs at least 1 argument');
            }

            break;
          case 'help':
            client.write('commands:\n' +
              'get knot ([type] [number])\n' +
              'set knot [type] [number] [value]\n' +
              'quit');

            break;
          case
          'quit':
            i = Math.MAX_SAFE_INTEGER;
            client.end('bye bye\n');

            break;
        }
      }

      if (bytesWritten === client.bytesWritten) {
        client.write(`command "${commands.join(' ')}" not found, type "help" for details`);
      }

      if (client.writable) {
        client.write('\n> ');
      }
    });

    client.on('end', () => {
      if (config.fhem.telnet.server._debug) {
        console.info(`(dbg) closed connection for ${client.remoteAddress}:${client.remotePort}`);
      }
    });

    client.on('error', (err) => {
      console.error(`(err) client or for connection on ${config.fhem.telnet.server.ip}:${config.fhem.telnet.server.port}`, err.message)
    });
  });

  server.on('error', (err) => {
    console.error(`(err) unable to create server connection at ${config.fhem.telnet.server.ip}:${config.fhem.telnet.server.port}`, err.message)
  });

  server.listen(config.fhem.telnet.server.port, config.fhem.telnet.server.ip, () => {
    if (config.fhem.telnet.server._debug) {
      console.info(`(dbg) telnet server opened at ${config.fhem.telnet.client.host}:${config.fhem.telnet.client.port}`);
    }
  });
};

module.exports = fhemTelnetServer;