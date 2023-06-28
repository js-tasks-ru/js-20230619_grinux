/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  path = path.split('.');
  return function get_prop(obj) {
    if (Object.keys(obj).length === 0)
      return undefined;
    let child = path.shift();
    if (path.length)
      return get_prop(obj[child]);
    return obj[child];
  };
}
  // let major_path;
  // let dot = path.indexOf('.'); 
  // if (dot)

  // const product = {
  //   category: {
  //     title: "Goods"
  //   }
  // }

  // const obj = { 
  // };
  
  // const getter = createGetter('src');
  
  // console.log(getter(obj)); // Goods