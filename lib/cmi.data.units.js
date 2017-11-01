'use strict';

const cmiDataUnits = (() => {
  const ids = {
    '0': 'unknown0',
    '1': '˚C',
    '2': 'unknown2',
    '3': 'unknown3',
    '4': 's',
    '5': 'unknown5',
    '6': 'unknown6',
    '7': 'unknown7',
    '8': 'unknown8',
    '9': 'unknown9',
    '10': 'kW',
    '11': 'MWh',
    '12': 'kWh',
    '13': 'unknown13',
    '14': 'unknown14',
    '15': 'unknown15',
    '16': 'unknown16',
    '17': 'unknown17',
    '18': 'unknown18',
    '19': 'unknown19',
    '20': 'unknown20',
    '21': 'unknown21',
    '22': 'unknown22',
    '23': 'bar',
    '24': 'unknown24',
    '25': 'unknown25',
    '26': 'unknown26',
    '27': 'unknown27',
    '28': 'unknown28',
    '29': 'unknown29',
    '30': 'unknown30',
    '31': 'unknown31',
    '32': 'unknown32'
  };

  const units = {};

  for (let id of Object.keys(ids)) {
    units[ids[id]] = parseInt(id);
  }

  return {
    ids: ids,
    units: units
  };
})();

module.exports = cmiDataUnits;