'use strict';

const utilNestedProperties = (() => {
  const get = (obj, path) => {
    let references = obj,
      propertyList = path.split('.'),
      len = propertyList.length;

    for (let i = 0; i < len - 1; i++) {
      let elem = propertyList[i];

      if (!references[elem]) {
        references[elem] = {};
      }

      references = references[elem];
    }

    return references[propertyList[len - 1]];
  };

  const has = function(obj, propertyPath) {
    if (!propertyPath)
      return false;

    const properties = propertyPath.split('.');

    for (let i = 0; i < properties.length; i++) {
      let prop = properties[i];

      if (!obj || !obj.hasOwnProperty(prop)) {
        return false;
      }
      else {
        obj = obj[prop];
      }
    }

    return true;
  };

  const set = (obj, path, value) => {
    let references = obj,
      propertyList = path.split('.'),
      len = propertyList.length;

    for (let i = 0; i < len - 1; i++) {
      let elem = propertyList[i];

      if (!references[elem]) {
        references[elem] = {};
      }

      references = references[elem];
    }

    references[propertyList[len - 1]] = value;
  };

  return {
    get: get,
    has: has,
    set: set
  };
})();

module.exports = utilNestedProperties;