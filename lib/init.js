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
        initDir = path.isAbsolute(targetDir) ? path.sep : '';

      targetDir.split(path.sep).reduce((parentDir, childDir) => {
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

  // config injection for knots
  const file = config._global.path + path.sep + 'knots.json';

  try {
    fs.accessSync(file, fs.constants.F_OK | fs.constants.R_OK);

    if (config.init._debug) {
      console.info(`(dbg) knots.json found at ${config._global.path}`);
    }

    try {
      const content = JSON.parse(fs.readFileSync(file));

      config.cmi.knots = {};
      // just insert knots with numeric key
      Object.keys(content).forEach((knot) => {
        config.cmi.knots[knot] = content[knot];
      });
    }
    catch (ex) {
      console.error(`(err) unable to parse knots data at file ${file}`);
    }
  }
  catch (err) {
    if (err && config.init._debug) {
      console.info(`(dbg) knots.json not found at ${config._global.path}`);
    }
  }
})();

module.exports = init;