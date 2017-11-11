'use strict';

const cmiDataTypes = (() => {
  const getValue = (value, type) => {
    if (type === 'bool') {
      return !!value;
    }

    let types = type.split('/');

    if (types.length !== 2) {
      return false;
    }

    return (!!value) ? types[0] : types[1];
  };

  const ids = {
    '0': 'bool',
    '1': 'TRUE/FALSE',
    '2': 'ON/OFF',
    '3': 'YES/NO',
    '5': 'true/false',
    '6': 'on/off',
    '7': 'yes/no'
  };

  const types = {};

  for (let id of Object.keys(ids)) {
    types[ids[id]] = id | 0;
  }

  return {
    getValue: getValue,
    ids: ids,
    types: types
  };
})();

module.exports = cmiDataTypes;