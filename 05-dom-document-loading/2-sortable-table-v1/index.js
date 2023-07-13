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
    this.id = field;
    this.order = order;

    this.tableData.sort((a, b) => {
      if (!isNaN(a[this.id]) && !isNaN(b[this.id]))
        return this.order === 'desc' ? b[this.id] - a[this.id] : a[this.id] - b[this.id];
      else
        return this.order === 'desc' ?
          b[this.id].toString().localeCompare(a[this.id].toString(), ['ru-RU'], { caseFirst: 'upper' }) :
          a[this.id].toString().localeCompare(b[this.id].toString(), ['ru-RU'], { caseFirst: 'upper' });

    });

    this.setSortColumnStyle();

    this.subElements.body.innerHTML = this.createBody();
  }

  setSortColumnStyle() {
    if (this.subElements.sort_id) {
      this.subElements.sort_id.removeAttribute("data-order");
      this.subElements.sort_id.querySelector('.sortable-table__sort-arrow').remove();
    }
    this.subElements.sort_id = this.subElements.header.querySelector(`[data-id="${this.id}"]`);
    this.subElements.sort_id.setAttribute("data-order", this.order);
    this.subElements.sort_id.appendChild(this.createElement(`
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `));
  }

  destroy() {
    this.remove();
  }
} 
