/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sorted = [...arr];
  sorted.sort((a, b) => {
    return param === 'asc' ? 
       a.localeCompare(b, ['ru-RU'], {caseFirst: 'upper'}) :
      -a.localeCompare(b, ['ru-RU'], {caseFirst: 'upper'})
  });
  //console.log(`Input: `, arr, `\r Sorted: `, sorted);  
  return sorted;
}

