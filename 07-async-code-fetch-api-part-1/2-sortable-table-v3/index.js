import fetchJson from './utils/fetch-json.js';
import LJSBase from '../../components/LJSBase.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const INITIAL_LOADING_NUM = 30;

export default class SortableTable extends LJSBase{
    constructor(headerConfig, {
    url = '',
    isSortLocally = false,
    sorted: {
      id = headerConfig.find(item => item.sortable).id,
      order = 'asc'
    } = {},
  } = {}) {

    super();
    this.headerConfig = headerConfig;
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.id = id;
    this.order = order;
    this.tableData = [];
    this.tableDataRequestIndex = 0;
    this.tableDataRequestNum = INITIAL_LOADING_NUM;
    this.isBodyRowsRendered = false;

    this.render();
  }

  async render() {
    this.element = this.createElement(this.createTable());
    this.subElements = {
      header: this.element.querySelector('[data-element="header"]'),
      body: this.element.querySelector('[data-element="body"]')
    };
    if (this.isSortLocally)
      this.tableData = await this.loadTableData();
    await this.sort(this.id, this.order);
    this.createEventListeners(); //-- если вынести в конструктор, то тесты успевают 
                                 //-- сделать клик после вызова render() до того, 
                                 //-- как установятся обработчик событий клика
  }

  createTable() {
    return (`
    <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.createHeaderRows()}
      </div>
      <div data-element="body" class="sortable-table__body">
        ${this.createBody(this.tableData)}
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

  createBody(tableData) {
    return tableData.map(item => this.createBodyRows(item)).join('');
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

  async loadTableData() {
    try {
      let response = await fetch(this.createUrl(this.tableDataRequestIndex, this.tableDataRequestNum));

      this.tableDataRequestIndex += this.tableDataRequestNum;
      return await response.json();

    } catch (err) {
      throw new Error(`Network error has occurred: ${err}`);
    }
  }

  createUrl(startIdx, requestNum) {
    return (` 
      ${BACKEND_URL}/${this.url}?
      _start=${startIdx}&
      _end=${startIdx + requestNum}
      ${!this.isSortLocally ? `&_sort=${this.id}&_order=${this.order}` : ''}`
    .replace(/(\r\n|\n|\r| )/gm, ""));
  }

  async sort(field, order) {
    if (this.isSortLocally)
      this.sortOnClient(field, order);
    else
      await this.sortOnServer(field, order);

    this.setSortColumnStyle();

    this.subElements.body.innerHTML = this.createBody(this.tableData);
    this.isBodyRowsRendered = true;
  }

  async sortOnServer(field, order) {
    this.tableDataRequestIndex = 0;
    this.tableData = [];
    this.id = field;
    this.order = order;

    this.setSortColumnStyle();

    this.tableData = await this.loadTableData();
    this.subElements.body.innerHTML = this.createBody(this.tableData);
    this.isBodyRowsRendered = true;
  }

  sortOnClient(field, order) {

    this.id = field;
    this.order = order;
    const sort_type = this.headerConfig.find(item => item.id === this.id).sortType;
    
    this.setSortColumnStyle();

    this.tableData.sort((a, b) => {
      if (sort_type == 'number')
        return this.order === 'desc' ? b[this.id] - a[this.id] : a[this.id] - b[this.id];
      else
        return this.order === 'desc' ?
          b[this.id].toString().localeCompare(a[this.id].toString(), ['ru-RU'], { caseFirst: 'upper' }) :
          a[this.id].toString().localeCompare(b[this.id].toString(), ['ru-RU'], { caseFirst: 'upper' });

    });

    this.subElements.body.innerHTML = this.createBody(this.tableData);
  }

  appendBodyRows(tableData) {
    let docBottomBeforeAppend = document.documentElement.getBoundingClientRect().bottom;

    this.subElements.body.insertAdjacentHTML('beforeEnd', this.createBody(tableData));

    let docBottomAfterAppend = document.documentElement.getBoundingClientRect().bottom; 
    this.tableDataRequestNum = Math.round(document.documentElement.clientHeight * this.tableDataRequestNum 
      (docBottomAfterAppend - docBottomBeforeAppend)); //number of rows fitted in client window 

    this.tableData = [...this.tableData, ...tableData];
    this.isBodyRowsRendered = true;
  }

  setSortColumnStyle() {
    if (this.subElements.sortElement) {
      this.subElements.sortElement.removeAttribute("data-order");
      this.subElements.sortElement.querySelector('.sortable-table__sort-arrow').remove();
    }
    this.subElements.sortElement = this.subElements.header.querySelector(`[data-id="${this.id}"]`);
    this.subElements.sortElement.setAttribute("data-order", this.order);
    this.subElements.sortElement.appendChild(this.createElement(`
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `));
  }

  async scroll() {
    if (document.documentElement.getBoundingClientRect().bottom < 
        document.documentElement.clientHeight + 100 && 
        this.isBodyRowsRendered) {
      this.isBodyRowsRendered = false;
      this.appendBodyRows(await this.loadTableData());
    }
  }

  createEventListeners() {
    this.scroll = this.scroll.bind(this);

    this.subElements.header.addEventListener('pointerdown', event => {
      const th = event.target.closest('div');
      if (th.getAttribute("data-sortable") === 'true') {
        const order = th.getAttribute('data-order');
        this.sort(th.getAttribute('data-id'), order === 'desc' ? 'asc' : 'desc');
      }
    });
    window.addEventListener('scroll', this.scroll); 
  }

  destroy() {
    window.removeEventListener('scroll', this.scroll)
    this.remove();
  }
} 
