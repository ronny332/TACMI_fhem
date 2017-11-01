'use strict';

const Message = class {
  constructor(data) {
    this.data = data || new Buffer(14);
  }

  get index() {
    return this.data.readUInt8(1);
  }

  get knot() {
    return this.data.readUInt8(0);
  }

  get length() {
    return this.data.length;
  }

  get type() {
    return (this.index === 0 || this.index === 9) ? 'D' : 'A';
  }

  get units() {
    let pos = 1,
      units = {};

    switch (this.type) {
      case 'A':
        // units entries are at bytes 10, 11, 12 and 13
        [10, 11, 12, 13].forEach((i) => {
          units[pos++] = this.data.readUInt8(i);
        });
        break;
      case 'D':
        // do nothing yet
        break;
    }

    return units;
  }

  get values() {
    let pos = 1,
      values = {};

    switch (this.type) {
      case 'A':
        // data entries are at bytes 2, 4, 6 and 8
        [2, 4, 6, 8].forEach((i) => {
          values[pos++] = this.data.readInt16LE(i);
        });

        break;
      case 'D':
        // data entries are at bytes 2 and 3
        [2, 3].forEach((i) => {
          let byte = this.data.readUInt8(i);

          for (let i = 0; i < 8; i++) {
            values[pos++] = byte >> i & 0x1;
          }
        });

        break;
    }

    return values;
  }

  toString() {
    return this.type + ';' + this.index + ';' + Object.values(this.values).join(',') +
      ((this.type === 'A') ? ';' + Object.values(this.units).join(',') : '');
  }
};

module.exports = Message;
