export default class SortableTable {
  constructor(headerConfig = [], data = []) {
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
