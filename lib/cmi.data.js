'use strict';

var cmiData = (() => {
  const cmiDataTypes = require(__base + 'lib/cmi.data.types'),
    cmiDataUnits = require(__base + 'lib/cmi.data.units'),
    config = require(__base + 'lib/config');

  const data = {
    A: {},
    D: {}
  };

  const _emptyObject = (type) => {
    switch (type) {
      case 'A':
        return {
          name: '',
          value: 0,
          unit: 0
        };
        break;
      case 'D':
        return {
          name: '',
          value: 0
        };
        break;
      default:
        return {};
    }
  };

  const get = (knot, type) => {
    knot || (knot = '0');

    if (!data.hasOwnProperty(type) || !data[type].hasOwnProperty(knot)) {
      return {};
    }

    return data[type][knot];
  };

  const set = (message) => {
    let index = message.index,
      knot = message.knot,
      no = 0,
      offset = 0,
      units = null,
      values = null;

    switch (message.type) {
      case 'A':
        if (!data.A.hasOwnProperty(knot)) {
          data.A[knot] = {};
          for (let i = 1; i < 33; i++) data.A[knot][i] = _emptyObject('A');
        }

        offset = (index - 1) * 4;
        units = message.units;
        values = message.values;

        for (let i = 1; i < 5; i++) {
          no = i + offset;

          if (config.cmi.knots.hasOwnProperty(knot) &&
            config.cmi.knots[knot].hasOwnProperty('type') && config.cmi.knots[knot].type === 'A' &&
            config.cmi.knots[knot].hasOwnProperty('items') &&
            config.cmi.knots[knot].items.hasOwnProperty(no) &&
            config.cmi.knots[knot].items[no].hasOwnProperty('name') &&
            config.cmi.knots[knot].items[no].hasOwnProperty('decimals') &&
            config.cmi.knots[knot].items[no].hasOwnProperty('unit')) {

            data.A[knot][no].name = config.cmi.knots[knot].items[no].name;
            data.A[knot][no].value = values[i] / (Math.pow(10, config.cmi.knots[knot].items[no].decimals));

            // auto unit (from CoE value)
            if (config.cmi.knots[knot].items[no].unit === 'auto') {
              data.A[knot][no].unit = cmiDataUnits.ids[units[i]];
            }
            else {
              // custom unit by id
              if (cmiDataUnits.ids.hasOwnProperty(config.cmi.knots[knot].items[no].unit)) {
                data.A[knot][no].unit = cmiDataUnits.ids[config.cmi.knots[knot].items[no].unit];
              }
              // custom unit by unit
              else if (cmiDataUnits.units.hasOwnProperty(config.cmi.knots[knot].items[no].unit)) {
                data.A[knot][no].unit = config.cmi.knots[knot].items[no].unit;
              }
              // invalid configuration for unit
              else {
                data.A[knot][no].unit = cmiDataUnits.ids[0];
              }
            }
          }
          else {
            data.A[knot][no].value = values[i];
            data.A[knot][no].unit = units[i];
          }
        }

        break;
      case 'D':
        if (!data.D.hasOwnProperty(knot)) {
          data.D[knot] = {};
          for (let i = 1; i < 33; i++) data.D[knot][i] = _emptyObject('D');
        }

        // second digital values index starts at 9, map it to 1 here
        offset = (index >= 9 ? index - 8 : 0) * 16;
        values = message.values;

        for (let i = 1; i < 17; i++) {
          no = i + offset;

          if (config.cmi.knots.hasOwnProperty(knot) &&
            config.cmi.knots[knot].hasOwnProperty('type') && config.cmi.knots[knot].type === 'D' &&
            config.cmi.knots[knot].hasOwnProperty('items') &&
            config.cmi.knots[knot].items.hasOwnProperty(no) &&
            config.cmi.knots[knot].items[no].hasOwnProperty('name') &&
            config.cmi.knots[knot].items[no].hasOwnProperty('format')) {

            data.D[knot][no].name = config.cmi.knots[knot].items[no].name;

            // custom type by id
            if (cmiDataTypes.ids.hasOwnProperty(config.cmi.knots[knot].items[no].format)) {
              data.D[knot][no].value = cmiDataTypes.getValue(!!values[i], cmiDataTypes.ids[config.cmi.knots[knot].items[no].format]);
            }
            // custom type by type
            else if (cmiDataTypes.types.hasOwnProperty(config.cmi.knots[knot].items[no].format) || config.cmi.knots[knot].items[no].format.indexOf('/') !== -1) {
              data.D[knot][no].value = cmiDataTypes.getValue(!!values[i], config.cmi.knots[knot].items[no].format);
            }
            // invalid configuration for type
            else {
              data.D[knot][no].value = !!values[i];
            }
          }
          else {
            data.D[knot][no].value = !!values[i];
          }

        }

        break;
      default:
        return false;
    }

    if (config.cmi.data._debug) {
      const util = require('util');
      console.info(util.inspect(data, {depth: 4}));
    }

    return true;
  };

  return {
    get: get,
    set: set
  };
})();

module.exports = cmiData;