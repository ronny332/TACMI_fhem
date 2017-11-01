'use strict';

module.exports = {
  cmi: {
    data: {
      _debug: false
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
  }
};