/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) 
    return string;
  let catch_char = '';
  let count = 0;
  return [...string].filter(char => {
    if (catch_char != char)
    {
      catch_char = char;
      count = 1;
    }
    return count++ <= size;
  })
  .join('');
}

