export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    //console.log('2'.toString());
    this.element = this.create_element(`
      <div class="sortable-table"></div>
      `);
    this.subElements = {};
    this.subElements.header = this.element.appendChild(this.create_element(`
      <div data-element="header" class="sortable-table__header sortable-table__row"></div>
      `));
    this.subElements.body = this.element.appendChild(this.create_element(`
      <div data-element="body" class="sortable-table__body"></div>
      `));
    this.config = headerConfig;
    for (let th of this.config) {
      this.subElements.header.appendChild(this.create_element(`
        <div class="sortable-table__cell" data-id="${th.id}" data-sortable="${th.sortable}">
          <span>${th.title}</span>
        </div>
      `));
    }
    this.data = data;
    this.render();
  }
  render() {
    for (let item of this.data) {
      const entry = this.subElements.body.appendChild(this.create_element(`
        <a href="/products/${item['id']}" class="sortable-table__row">  
      `));
      for (let th of this.config)
      {
        if(th.template)
            entry.appendChild(this.create_element(th.template(item[th.id])));
        else
            entry.appendChild(this.create_element(`
              <div class="sortable-table__cell">${item[th.id]}</div>
            `));
      }
    }
  }

  sort(field, order) {
    if (order === 'desc') {
      this.data.sort((a, b) => {
        if (!isNaN(a[field]) && !isNaN(b[field]))
          return b[field] - a[field];
        else
          return b[field].toString().localeCompare(a[field].toString(), ['ru-RU'], { caseFirst: 'upper' });

      });
      this.subElements.header.querySelector(`[data-id="${field}"]`).setAttribute("data-order", "desc");
    }
    else {
      this.data.sort((a, b) => {
        if (!isNaN(a[field]) && !isNaN(b[field]))
          return a[field] - b[field];
        else
          return a[field].toString().localeCompare(b[field].toString(), ['ru-RU'], { caseFirst: 'upper' });
      });
      this.subElements.header.querySelector(`[data-id="${field}"]`).setAttribute("data-order", "asc");
    }
    this.subElements.body.innerHTML = '';
    this.render();
  }
  //#create_element - тесты говорят, что приватные методы не поддерживаются самими тестами
  create_element(html)
  {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
} 


//     this.element = this.create_element(`
//       <div class="sortable-table">
//         <div data-element="header" class="sortable-table__header sortable-table__row">
//           <div class="sortable-table__cell" data-id="${this.config.id}" data-sortable="${this.config.sortable}" data-order="asc">
//             <span>${this.config.title}</span>
//           </div>
//           <div class="sortable-table__cell" data-id="title" data-sortable="true" data-order="asc">
//             <span>Name</span>
//             <span data-element="arrow" class="sortable-table__sort-arrow">
//               <span class="sort-arrow"></span>
//             </span>
//           </div>
//           <div class="sortable-table__cell" data-id="quantity" data-sortable="true" data-order="asc">
//             <span>Quantity</span>
//           </div>
//           <div class="sortable-table__cell" data-id="price" data-sortable="true" data-order="asc">
//             <span>Price</span>
//           </div>
//           <div class="sortable-table__cell" data-id="sales" data-sortable="true" data-order="asc">
//             <span>Sales</span>
//           </div>
//         </div>

//         <div data-element="body" class="sortable-table__body">
//           <!--
//           <a href="/products/3d-ochki-epson-elpgs03" class="sortable-table__row">
//             <div class="sortable-table__cell">
//               <img class="sortable-table-image" alt="Image" src="http://magazilla.ru/jpg_zoom1/246743.jpg">
//             </div>
//             <div class="sortable-table__cell">3D очки Epson ELPGS03</div>
//             <div class="sortable-table__cell">16</div>
//             <div class="sortable-table__cell">91</div>
//             <div class="sortable-table__cell">6</div>
//           </a> -->
//         </div>
//       </div>
//     `);
//   }
// }

//
//<div data-element="loading" class="loading-line sortable-table__loading-line"></div>
//
//<div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
//  <div>
//    <p>No products satisfies your filter criteria</p>
//    <button type="button" class="button-primary-outline">Reset all filters</button>
//  </div>
//</div>
//
//</div> */