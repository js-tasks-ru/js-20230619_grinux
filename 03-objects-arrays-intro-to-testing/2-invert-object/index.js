/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj)
    return;
  const props = Object.entries(obj);
  props.forEach(prop => {
    [prop[0], prop[1]] = [prop[1], prop[0]];
  });
  return Object.fromEntries(props);
}

export function invertObj1(obj) {
  return obj ?
    Object
      .fromEntries(Object
        .entries(obj)
        .map(([key, value]) => [value, key])) : undefined;
}
