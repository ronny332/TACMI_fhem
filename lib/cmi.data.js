'use strict';

var cmiData = (() => {
  const cmiDataTypes = require(__base + 'lib/cmi.data.types'),
    cmiDataUnits = require(__base + 'lib/cmi.data.units'),
    config = require(__base + 'lib/config');

  const EventEmitter = require('events');

  const CmiData = class extends EventEmitter {
    constructor() {
      super();
      this.A = {};
      this.D = {};
    }
  };

  const data = new CmiData();

  const _changed = (type, knot, no, value) => {
    return (data[type][knot][no].value !== value);
  };

  const _emptyObject = (type) => {
    switch (type) {
      case 'A':
        return {
          name: '',
          value: 0,
          unit: 0,
          date: 0
        };
        break;
      case 'D':
        return {
          name: '',
          value: 0,
          date: 0
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
    let changed = [],
      index = message.index,
      knot = message.knot,
      name = '',
      no = 0,
      offset = 0,
      unit = '',
      units = null,
      unknown = true,
      value = 0,
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
          unknown = true;

          if (config.cmi.knots.hasOwnProperty(knot) &&
            config.cmi.knots[knot].hasOwnProperty('type') && config.cmi.knots[knot].type === 'A' &&
            config.cmi.knots[knot].hasOwnProperty('items') &&
            config.cmi.knots[knot].items.hasOwnProperty(no) &&
            config.cmi.knots[knot].items[no].hasOwnProperty('name') &&
            config.cmi.knots[knot].items[no].hasOwnProperty('decimals') &&
            config.cmi.knots[knot].items[no].hasOwnProperty('unit')) {

            name = config.cmi.knots[knot].items[no].name;
            unknown = false;
            value = values[i] / (Math.pow(10, config.cmi.knots[knot].items[no].decimals));

            // auto unit (from CoE value)
            if (config.cmi.knots[knot].items[no].unit === 'auto') {
              unit = cmiDataUnits.ids[units[i]];
            }
            else {
              // custom unit by id
              if (cmiDataUnits.ids.hasOwnProperty(config.cmi.knots[knot].items[no].unit)) {
                unit = cmiDataUnits.ids[config.cmi.knots[knot].items[no].unit];
              }
              // custom unit by unit
              else if (cmiDataUnits.units.hasOwnProperty(config.cmi.knots[knot].items[no].unit)) {
                unit = config.cmi.knots[knot].items[no].unit;
              }
              // invalid configuration for unit
              else {
                unit = cmiDataUnits.ids[0];
              }
            }
          }
          else {
            name = '';
            value = values[i];
            unit = units[i];
          }

          if ((config.cmi.data.emit.unknown || !unknown) && _changed('A', knot, no, value)) {
            changed.push({knot: knot, no: no});
          }

          data.A[knot][no].name = name;
          data.A[knot][no].value = value;
          data.A[knot][no].unit = unit;
        }

        if (changed.length > 0) {
          data.emit('update', 'A', changed);
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
          unknown = true;

          if (config.cmi.knots.hasOwnProperty(knot) &&
            config.cmi.knots[knot].hasOwnProperty('type') && config.cmi.knots[knot].type === 'D' &&
            config.cmi.knots[knot].hasOwnProperty('items') &&
            config.cmi.knots[knot].items.hasOwnProperty(no) &&
            config.cmi.knots[knot].items[no].hasOwnProperty('name') &&
            config.cmi.knots[knot].items[no].hasOwnProperty('format')) {

            name = config.cmi.knots[knot].items[no].name;
            unknown = false;

            // custom type by id
            if (cmiDataTypes.ids.hasOwnProperty(config.cmi.knots[knot].items[no].format)) {
              value = cmiDataTypes.getValue(!!values[i], cmiDataTypes.ids[config.cmi.knots[knot].items[no].format]);
            }
            // custom type by type
            else if (cmiDataTypes.types.hasOwnProperty(config.cmi.knots[knot].items[no].format) || config.cmi.knots[knot].items[no].format.indexOf('/') !== -1) {
              value = cmiDataTypes.getValue(!!values[i], config.cmi.knots[knot].items[no].format);
            }
            // invalid configuration for type
            else {
              value = !!values[i];
            }
          }
          else {
            value = !!values[i];
          }

          if ((config.cmi.data.emit.unknown || !unknown) && _changed('D', knot, no, value)) {
            changed.push({knot: knot, no: no});
          }

          data.D[knot][no].name = name;
          data.D[knot][no].value = value;
        }

        if (changed.length > 0) {
          data.emit('update', 'D', changed);
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
    data: data,
    get: get,
    set: set
  };
})();

module.exports = cmiData;