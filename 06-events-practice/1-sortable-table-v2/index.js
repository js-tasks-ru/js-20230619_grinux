import LJSBase from '../../components/LJSBase.js';

export default class SortableTable extends LJSBase{
  constructor(headerConfig, {
    data = [],
    sorted: {
      id = headerConfig.find(item => item.sortable).id,
      order = 'asc'
    } = {},
    locally = true
  } = {}) {

    super();
    this.headerConfig = headerConfig;
    this.tableData = data;
    this.isSortLocally = locally;
    this.id = id;
    this.order = order;
    
    this.render();
    this.sort(this.id, this.order); //tests require table to be sorted by default
    this.createEventListeners();
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

  sort(field, order) {
    this.id = field;
    this.order = order;

    if (this.isSortLocally)
      this.sortOnClient(field, order);
    else
      this.sortOnServer(field, order);

    this.setSortColumnStyle();

    this.subElements.body.innerHTML = this.createBody();
  }

  sortOnServer (field, order = 'asc')
  {
    throw new Error('sort_on_server() not implemented yet');
  }

  sortOnClient (field, order = 'asc') {
    const sort_type = this.headerConfig.find(item => item.id === field).sortType;
    this.tableData.sort((a, b) => {
      if (sort_type == 'number')
        return order === 'desc' ? b[field] - a[field] : a[field] - b[field];
      else
        return order === 'desc' ?
          b[field].toString().localeCompare(a[field].toString(), ['ru-RU'], { caseFirst: 'upper' }) :
          a[field].toString().localeCompare(b[field].toString(), ['ru-RU'], { caseFirst: 'upper' });

    });
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

  createEventListeners() {
    this.subElements.header.addEventListener('pointerdown', event => {
      const th = event.target.closest('div');
      if (th.getAttribute("data-sortable") === 'true') {
        const order = th.getAttribute('data-order');
        this.sort(th.getAttribute('data-id'), order === 'desc' ? 'asc' : 'desc');
      }
    });
  }

  destroy() {
    this.remove();
  }
} 
