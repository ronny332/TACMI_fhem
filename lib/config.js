'use strict';

module.exports = {
  _global: {
    // globally set all '_debug' properties to true or false. null keeps the values untouched
    _debug: null,
    path: '~/.config/tacmi'
  },
  cmi: {
    data: {
      _debug: false,
      emit: {
        // emit unnamed/unknown data
        unknown: false
      }
    },
    knots: {
      '21': {
        send: true,
        type: 'D',
        items: {
          '1': {
            name: 'Test',
            format: 'ON/OFF'
          }
        }
      },
      '22': {
        send: true,
        type: 'A',
        items: {}
      },
      '55': {
        send: false,
        type: 'D',
        items: {
          '1': {
            name: 'Anforderung WW',
            format: 'an/aus'
          },
          '2': {
            name: 'T.Heizkreis 1 Extern',
            format: 'YES/NO'
          },
          '4': {
            name: 'Freigabe (Test)',
            format: 'ON/OFF'
          },
          '21': {
            name: 'T.Heizkreis 2 Extern',
            format: 'TRUE/FALSE'
          }
        }
      },
      '56': {
        send: false,
        type: 'A',
        items: {
          '1': {
            name: 'T.Kollektor',
            decimals: 1,
            unit: 'auto'
          },
          '21': {
            name: 'P.Solar',
            decimals: 2,
            unit: 'auto'
          }
        }
      }
    },
    message: {
      _debug: true,
      length: 14
    },
    server: {
      _debug: true,
      port: 5441
    }
  },
  fhem: {
    readings: {
      modifiable: {
        prefix: '+'
      }
    },
    telnet: {
      client: {
        _debug: true,
        device: 'dum_tacmi_test',
        host: '10.0.0.23',
        port: 7072,
        room: 'ug_heizung'
      },
      server: {
        _debug: true,
        ip: '0.0.0.0',
        port: 6061
      }
    }
  },
  init: {
    _debug: true
  },
  state: {
    _debug: true,
    filename: 'states.json',
    store: {
      enabled: true,
      interval: 60000
    }
  }
};