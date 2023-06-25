/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */

export const omit = (obj, ...fields) => {
  return Object.fromEntries(Object.entries(obj)
    .filter(entry => !fields.includes(entry[0])));
};

//сперва сделал  так:
export const omit1 = (obj, ...fields) => {
  let result = { ...obj }
  for (let field of fields) {
    if (obj[field])
      delete result[field];
  }
  return result;
};