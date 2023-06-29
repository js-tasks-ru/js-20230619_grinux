/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */

//нужно ли явно проверять size === undefined, если тесты проходят, т.к при 
//сравнении на 20й строке undefined преобразуется в NaN, и логика не нарушается?
export function trimSymbols(string, size) {
  //if (size === undefined) return string;
  let catch_char = '';
  let count = 0;
  console.log(size);
  return [...string].filter(char => {
    if (catch_char != char)
    {
      catch_char = char;
      count = 1;
    }
    return count++ > size ? false : true;
  })
  .join('');
}

