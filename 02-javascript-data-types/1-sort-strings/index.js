/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sorted = [...arr];
  sorted.sort((a, b) => {
    if (a === b)
      return 0;
    return a.localeCompare(b, ['ru-RU'], {caseFirst: 'upper'});
  });
  if (param === 'desc')
    sorted.reverse();
  else if (param !== 'asc')
    console.log(`Unknown sorting method. Default 'asc' apllied`);
  //console.log(`Input: `, arr, `\r Sorted: `, sorted);  
  return sorted;
}
