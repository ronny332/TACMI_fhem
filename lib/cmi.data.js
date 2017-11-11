'use strict';

var cmiData = (() => {
  const cmiDataTypes = require(__base + 'lib/cmi.data.types'),
    cmiDataUnits = require(__base + 'lib/cmi.data.units'),
    config = require(__base + 'lib/config'),
    Message = require(__base + 'lib/cmi.message.class');

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

  /**
   * converts a given digital string value (e.g. "on" or "off") to boolean
   * @param type
   * @private
   */
  const _convertDigitalValueStringToBoolean = (type) => {
    if (type === true) {
      return true;
    }

    if (!type || type.trim().length === 0) {
      return false;
    }

    const types = Object.keys(cmiDataTypes.types);

    for (let i = 0; i < types.length; i++) {
      if (types[i].indexOf(type) !== -1) {
        return (types[i].split('/')[0] === type) ? true : false;
      }
    }

    return false;
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

  const cleanName = (name, removePrefix = false) => {
    name = name.replace(/ /g, '_');

    if (removePrefix) {
      name = name.replace(config.fhem.readings.modifiable.prefix, '');
    }

    return name;
  };

  const createMessage = (type, knot, no) => {
    const message = new Message(),
      position = message.getIndexAndPosition(type, no);

    let start;

    message.setKnot(knot);
    message.setIndex(position.index);

    switch (type) {
      case 'A':
        start = no - (no % 4) + 1;

        for (let i = start; i < start + 4; i++) {
          if (data[type][knot][i].date > 0) {
            message.setValue(type, i, data[type][knot][i].value, config.cmi.knots[knot].items[i].decimals);
          }
        }

        return message;

        break;
      case 'D':
        start = no - (no % 16) + 1;

        for (let i = start; i < start + 16; i++) {
          if (data[type][knot][i].date > 0) {
            message.setValue(type, i, !!data[type][knot][i].value);
          }
        }

        return message;

        break;
    }
  };

  const find = (name) => {
    if (!name) {
      return false;
    }

    name = cleanName(name, true);

    const type = (name.split('.')[0].replace(config.fhem.readings.modifiable.prefix, '') === 'B') ? 'D' : 'A';

    let found = false;

    Object.keys(config.cmi.knots).forEach((knot) => {
      if (config.cmi.knots[knot].hasOwnProperty('type') && config.cmi.knots[knot].type === type &&
        config.cmi.knots[knot].hasOwnProperty('send') && config.cmi.knots[knot].send) {

        if (config.cmi.knots[knot].hasOwnProperty('items')) {
          const items = Object.keys(config.cmi.knots[knot].items);

          for (let i = 0; i < items.length; i++) {
            if (config.cmi.knots[knot].items[items[i]].hasOwnProperty('name') && config.cmi.knots[knot].items[items[i]].name === name) {
              found = {
                config: config.cmi.knots[knot].items[items[i]],
                data: data[type][knot][items[i]],
                no: items[i],
                knot: knot,
                type: type
              };
            }
          }
        }
      }
    });

    return found;
  };

  const get = (type, knot) => {
    knot || (knot = '0');

    if (!data.hasOwnProperty(type) || !data[type].hasOwnProperty(knot)) {
      return {};
    }

    return data[type][knot];
  };

  const set = (type, knot, no, name, value, decimals = 0) => {
    if (data.hasOwnProperty(type) && data[type].hasOwnProperty(knot) &&
      data[type][knot].hasOwnProperty(no) && data[type][knot][no].hasOwnProperty('name') && data[type][knot][no].hasOwnProperty('value')) {

      switch (type) {
        case 'A':
          data[type][knot][no].value = Number(value).toFixed(decimals);
          break;
        case 'D':
          data[type][knot][no].value = _convertDigitalValueStringToBoolean(value);
          break;
      }

      data[type][knot][no].name = cleanName(name, true);
      data[type][knot][no].date = +new Date();
    }
  };

  const setMessage = (message, init = false) => {
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

        if (init) {
          break;
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

        if (init) {
          break;
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

  // init data
  Object.keys(config.cmi.knots).forEach((knot) => {
    if (config.cmi.knots[knot].hasOwnProperty('type') &&
      (config.cmi.knots[knot].type === 'A' || config.cmi.knots[knot].type === 'D')) {

      const message = new Message();
      message.setIndex(config.cmi.knots[knot].type === 'D' ? 0 : 1);
      message.setKnot((knot));

      setMessage(message, true);
    }
  });

  return {
    cleanName: cleanName,
    createMessage: createMessage,
    data: data,
    find: find,
    get: get,
    set: set,
    setMessage: setMessage
  };
})();

module.exports = cmiData;