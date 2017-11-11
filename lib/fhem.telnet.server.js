'use strict';

const fhemTelnetServer = (cmiData, fhemTelnetClient) => {
  const config = require(__base + 'lib/config'),
    data = cmiData.data,
    udpClient = require(__base + 'lib/cmi.udp.client');

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
          case 'init':
            if (cmd.length === 2) {
              if (cmd[1] === 'fhem') {
                fhemTelnetClient.init('fhem');
                client.write('commands sent to create new dummy device with needed readings');
              }
              else {
                client.write(`invalid initialization type "${cmd.join(' ')}"`)
              }
            }
            else {
              client.write('invalid initialization type (use "init fhem")');
            }

            break;
          case
          'quit':
            i = Math.MAX_SAFE_INTEGER;
            client.end('bye bye\n');

            break;
          case 'set':
            if (cmd.length === 3) {
              const curData = cmiData.find(cmd[1]);

              if (!curData) {
                client.write(`invalid data field, "${cmd[1]}" not found`);
              }
              else {
                switch (curData.type) {
                  case 'A':
                    cmiData.set(curData.type, curData.knot, curData.no, cmd[1], cmd[2], curData.config.decimals);
                    break;
                  case 'D':
                    cmiData.set(curData.type, curData.knot, curData.no, cmd[1], cmd[2]);
                    break;
                }

                const message = cmiData.createMessage(curData.type, curData.knot, curData.no);

                udpClient.send(message, (err) => {
                  if (err) {
                    console.error(`(err) message ${message.toString()} not sent`);
                  }

                  if (config.cmi.udp.client._debug) {
                    console.info(`(dbg) message ${message.toString()} sent to C.M.I.`);
                  }
                });
              }
            }
            else {
              client.write(`invalid usage of set. used to see 3 parameters, but got ${cmd.length}`);
            }

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
      console.error(`(err) client error for ${client.remoteAddress}:${client.remotePort}`, err.message)
    });
  });

  server.on('error', (err) => {
    console.error(`(err) unable to create server connection at ${config.fhem.telnet.server.bind}:${config.fhem.telnet.server.port}`, err.message)
  });

  server.listen(config.fhem.telnet.server.port, config.fhem.telnet.server.bind, () => {
    if (config.fhem.telnet.server._debug) {
      console.info(`(dbg) telnet server opened at ${config.fhem.telnet.server.bind}:${config.fhem.telnet.server.port}`);
    }
  });
};

module.exports = fhemTelnetServer;