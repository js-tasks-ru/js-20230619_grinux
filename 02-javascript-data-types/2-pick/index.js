/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */

export const pick = (obj, ...fields) => {
  return Object.fromEntries(Object.entries(obj)
    .filter(entry => fields.includes(entry[0])));
};

//сперва сделал  так:
export const pick1 = (obj, ...fields) => {
  let result = {};
  for (let field of fields) {
    if (obj[field])
      result[field] = obj[field];
  }
  return result;
};
