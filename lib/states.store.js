'use strict';

const statesStore = ((data) => {
  const config = require(__base + 'lib/config');

  if (config.state.store.enabled) {
    const fs = require('fs'),
      path = require('path');

    const file = config._global.path + path.sep + config.state.filename;

    const storeData = () => {
      const content = JSON.stringify({
        'A': data.A,
        'D': data.D
      });

      if (config.state._debug) {
        console.info(`(dbg) storing data to ${file}: ` + content);
      }

      fs.writeFile(file, content, (err) => {
        if (err) {
          console.error(`err: unable to store states file at ${file}, message: ${err.message}`);
        }
      });
    };

    setInterval(() => {
      storeData();
    }, config.state.store.interval);
  }
});

module.exports = statesStore;