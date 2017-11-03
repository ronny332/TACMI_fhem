'use strict';

global.__base = __dirname + '/';

require(__base + 'lib/config');
require(__base + 'lib/init');
require(__base + 'lib/cmi.server');
require(__base + 'lib/cmi.message');
const cmiData = require(__base + 'lib/cmi.data');
require(__base + 'lib/fhem.telnet')(cmiData.data);
require(__base + 'lib/states.load')(cmiData.data);
require(__base + 'lib/states.store')(cmiData.data);

// setInterval(() => {
//   console.log(cmiData.get(55, 'D'));
//   console.log(cmiData.get(56, 'A'));
// }, 10000);
