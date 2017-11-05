'use strict';

const statesLoad = ((data) => {
  const config = require(__base + 'lib/config');

  if (config.state.store.enabled) {
    const fs = require('fs'),
      path = require('path');

    const file = config._global.path + path.sep + config.state.filename;

    fs.access(file, fs.constants.R_OK, (err) => {
      if (err) {
        console.info(`(inf) unable to find states file at ${file}`);
      }
      else {
        fs.readFile(file, (err, content) => {
          if (err) {
            console.error(`(err) unable to read states from file at ${file}, message: ${err.message}`);
          }
          else {
            try {
              const json = JSON.parse(content);

              if (json.hasOwnProperty('A') && json.hasOwnProperty('D')) {
                data.A = json.A;
                data.D = json.D;

                if (config.state._debug) {
                  console.info(`(dbg) restored states data from ${file}: ${content}`);
                }
              }
              else {
                console.error(`(err) unable to parse states from file at ${file}, file damaged`);
              }
            }
            catch (ex) {
              console.error(`(err) unable to parse states file at ${file}, message: ${err.message}`);
            }
          }
        });
      }
    });
  }
});

module.exports = statesLoad;