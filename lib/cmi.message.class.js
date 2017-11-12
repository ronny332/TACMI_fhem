'use strict';

const Message = class {
  constructor(data) {
    this.data = data || new Buffer(14);
  }

  get buffer() {
    return this.data;
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

  /**
   * calculates the matching index (0,9+ for digital, 1-8 for analog values) and the position (no) in the data set (1-16 for digital, 1-4 for analog)
   * @param type
   * @param index
   * @returns {*}
   */
  getIndexAndPosition(type, index) {
    index = index | 0;

    if ((type !== 'A' && type !== 'D') || index < 1 || index > 32) {
      return false;
    }

    const res = {
      index: 0,
      no: 0
    };

    switch (type) {
      case 'A':
        res.index = (((index - 1) / 4) | 0) + 1;
        res.no = ((index - 1) % 4) + 1;

        break;
      case 'D':
        res.index = index < 17 ? 0 : 9;
        res.no = index < 17 ? index : index - 16;

        break;
    }

    return res;
  }

  // index 0,9+ = Digital, index = 1-8 = Analog
  setIndex(index) {
    index = index | 0;

    if (index < 0 || index > 63) {
      return false;
    }

    this.data.writeUInt8(index, 1);
  }

  setKnot(knot) {
    if (knot < 0 || knot > 63) {
      return false;
    }

    this.data.writeUInt8(knot, 0);

    return true;
  }

  setValue(type, no, value, unit = 0, decimals = 0) {
    if (!this.validType(type)) {
      return false;
    }

    no = no | 0;
    unit = unit | 0;

    switch (type) {
      case 'A':
        if (no < 1 || no > 4) {
          return false;
        }

        decimals = decimals | 0;

        if (decimals < 0 || decimals > 10) {
          decimals = 0;
        }

        if (decimals > 0) {
          value = (value * Math.pow(10, decimals)) | 0;
        }

        // value
        this.data.writeInt16LE(value, no * 2);
        // unit
        if (unit > 0) {
          this.data.writeUInt8(unit, 9 + no);
        }

        break;
      case 'D':
        if (no < 1 || no > 16) {
          return false;
        }

        const curData = this.data.readUInt8((no < 9) ? 2 : 3),
          shift = no - ((no < 9) ? 1 : 9);

        // value already set
        if ((curData >> shift & 0x1) == (value ? 1 : 0)) {
          return true;
        }

        // true needs "or", false needs "xor"
        this.data[(no < 9) ? 2 : 3] = (value) ? (curData | (1 << shift)) :
          (curData ^ (1 << shift));

        break;
    }

    return true;
  }

  validType(type) {
    return type === 'A' || type === 'D';
  }

  toString() {
    return this.type + ';' + this.index + ';' + Object.values(this.values).join(',') +
      ((this.type === 'A') ? ';' + Object.values(this.units).join(',') : '');
  }
};

module.exports = Message;
