import LJSBase from '../../components/LJSBase.js';

export default class SortableTable extends LJSBase {
  constructor(headerConfig = [], data = []) {
    super();
    this.headerConfig = headerConfig;
    this.tableData = data;

    this.render();
  }

  render() {
    this.element = this.createElement(this.createTable());
    this.subElements = {
      header: this.element.querySelector('[data-element="header"]'),
      body: this.element.querySelector('[data-element="body"]')
    };
  }

  createTable() {
    return (`
    <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.createHeaderRows()}
      </div>
      <div data-element="body" class="sortable-table__body">
        ${this.createBody()}
      </div>
    </div>
    `);
  }

  createHeaderRows() {
    return this.headerConfig
      .map(th =>
        `<div class="sortable-table__cell" data-id="${th.id}" data-sortable="${th.sortable}">
          <span>${th.title}</span>
        </div>`
      )
      .join('');
  }

  createBody() {
    return this.tableData.map(item => this.createBodyRows(item)).join('');
  }

  createBodyRows(item) {
    return (`
      <a href="/products/${item['id']}" class="sortable-table__row">
        ${this.headerConfig
          .map(th => th.template ? th.template(item[th.id]) : 
              `<div class="sortable-table__cell">${item[th.id]}</div>`)
          .join('')
        }
      </a>
    `);
  }

  sort(field, order = 'asc') {
    this.tableData.sort((a, b) => {
      if (!isNaN(a[field]) && !isNaN(b[field]))
        return order === 'desc' ? b[field] - a[field] : a[field] - b[field];
      else
        return order === 'desc' ?
          b[field].toString().localeCompare(a[field].toString(), ['ru-RU'], { caseFirst: 'upper' }) :
          a[field].toString().localeCompare(b[field].toString(), ['ru-RU'], { caseFirst: 'upper' });

    });
    this.subElements.header.querySelector(`[data-id="${field}"]`).setAttribute("data-order", order);
    this.subElements.body.innerHTML = '';
    this.subElements.body.innerHTML = this.createBody();
  }

  destroy() {
    this.remove();
  }
} 
