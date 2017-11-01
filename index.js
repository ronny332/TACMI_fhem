'use strict';

global.__base = __dirname + '/';

require(__base + 'lib/config');
require(__base + "lib/cmi.server");
require(__base + "lib/cmi.message");
const cmiData = require(__base + "lib/cmi.data");

setInterval(() => {
  console.log(cmiData.get(55, 'D'));
  console.log(cmiData.get(56, 'A'));
}, 10000);
