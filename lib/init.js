'use strict';

const init = (() => {
  const config = require(__base + 'lib/config');

  const fs = require('fs'),
    path = require('path');

  // rewrite config directory to absolute path
  config._global.path = (config._global.path[0] === '~') ?
    path.join(process.env.HOME, config._global.path.slice(1)) :
    path.resolve(config._global.path);

  // create config dir, if not existent
  try {
    fs.accessSync(config._global.path, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);

    if (config.init._debug) {
      console.info(`(dbg) folder ${config._global.path} found and writable`);
    }
  }
  catch (err) {
    if (config.init._debug) {
      console.info(`(dbg) folder ${config._global.path} not found, trying to create it`);
    }

    try {
      const targetDir = config._global.path,
        sep = path.sep,
        initDir = path.isAbsolute(targetDir) ? sep : '';

      targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(parentDir, childDir);
        if (!fs.existsSync(curDir)) {
          fs.mkdirSync(curDir);
        }

        return curDir;
      }, initDir);
    }
    catch (err) {
      console.error(`(err) unable to create folder ${config._global.path}`);
      process.exit(1);
    }
  }
})();

module.exports = init;