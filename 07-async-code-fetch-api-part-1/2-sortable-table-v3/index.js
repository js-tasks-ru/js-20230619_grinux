import fetchJson from './utils/fetch-json.js';
import LJSBase from '../../components/LJSBase.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const INITIAL_LOADING_NUM = 30;

export default class SortableTable extends LJSBase{
    
  constructor(headerConfig, params) {
    const defaultSorted = { 
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc' 
    }
    const {
      url = '',
      isSortLocally = false,
      sorted = defaultSorted,
      infinityScroll = true
    } = params;

    super();
    this.headerConfig = headerConfig;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.infinityScroll = infinityScroll;
    this.id = sorted.id;
    this.order = sorted.order;

    this.tableData = [];
    this.tableDataRequestIndex = 0;
    this.clientRowsPerScreen = INITIAL_LOADING_NUM;

    this.build();
    this.render();
  }

  build() {
    this.element = this.createElement(this.createTable());
    this.subElements = {
      header: this.element.querySelector('[data-element="header"]'),
      body: this.element.querySelector('[data-element="body"]')
    };
    this.createEventListeners();
  }

  async render() {
    this.isBodyRowsRendered = false;
    this.clearTable();
    if (this.isSortLocally)
    {
      this.appendTableRows(await this.loadTableData(INITIAL_LOADING_NUM));
      if (this.clientRowsPerScreen > INITIAL_LOADING_NUM)
        this.appendTableRows(await this.loadTableData(this.clientRowsPerScreen * 2 - INITIAL_LOADING_NUM));
    }
    await this.sort(this.id, this.order);
  }

  createTable() {
  return (`
  <div class="sortable-table">
    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.createHeaderRows()}
    </div>
    <div data-element="body" class="sortable-table__body">
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

  appendTableRows(tableData) {

    let docBottomBeforeAppend;
    if (typeof jest === 'undefined') {
      docBottomBeforeAppend = document.documentElement.getBoundingClientRect().bottom;
    }
    this.subElements.body.insertAdjacentHTML
      ('beforeEnd',
        tableData.map(item => this.createBodyRows(item)).join(''));

    if (typeof jest === 'undefined') {
      let docBottomAfterAppend = document.documentElement.getBoundingClientRect().bottom;
      this.clientRowsPerScreen = Math.round(document.documentElement.clientHeight * tableData.length /
        (docBottomAfterAppend - docBottomBeforeAppend)); //number of rows fitted in client window
      this.clientRowsPerScreen = this.clientRowsPerScreen ? this.clientRowsPerScreen : INITIAL_LOADING_NUM;
    }
    this.tableData = [...this.tableData, ...tableData];

    this.isBodyRowsRendered = true;
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

  clearTable() {
    this.subElements.body.innerHTML = '';
  }

  rebuildTable(tableData) {
    this.clearTable(); 
    this.appendTableRows(tableData);
  }

  async sort(field, order) {
    if (this.isSortLocally)
      this.sortOnClient(field, order);
    else
      await this.sortOnServer(field, order);
  }

  async sortOnServer(field = this.id, order = this.order) {
    this.tableDataRequestIndex = 0;
    this.tableData = [];
    this.id = field;
    this.order = order;

    this.setSortColumnStyle();

    this.showSkeleton(true);
    let loadedTableData = await this.loadTableData
      (this.infinityScroll ? this.clientRowsPerScreen * 2 : INITIAL_LOADING_NUM);
    this.showSkeleton(false);

    this.rebuildTable(loadedTableData);
  }

  sortOnClient(field, order) {
    this.id = field;
    this.order = order;
    const sort_type = this.headerConfig.find(item => item.id === this.id).sortType;
    
    this.setSortColumnStyle();

    const sortedTableData = [...this.tableData.sort((a, b) => {
      if (sort_type == 'number')
        return this.order === 'desc' ? b[this.id] - a[this.id] : a[this.id] - b[this.id];
      else
        return this.order === 'desc' ?
          b[this.id].toString().localeCompare(a[this.id].toString(), ['ru-RU'], { caseFirst: 'upper' }) :
          a[this.id].toString().localeCompare(b[this.id].toString(), ['ru-RU'], { caseFirst: 'upper' });

    })];
    this.tableData = [];

    this.rebuildTable(sortedTableData);
  }

  showSkeleton(isShow) {
    if (isShow)
      this.element.classList.add('sortable-table_loading');
    else
      this.element.classList.remove('sortable-table_loading');
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

  async loadTableData(itemNum) {
    this.url.searchParams.set('_sort', this.id);
    this.url.searchParams.set('_order', this.order);
    this.url.searchParams.set('_start', this.tableDataRequestIndex);
    this.url.searchParams.set('_end', this.tableDataRequestIndex + itemNum);

    let response = await fetchJson(this.url);

    this.tableDataRequestIndex += itemNum;

    return response;
  }

  async handleWindowScroll() {
    if (document.documentElement.getBoundingClientRect().bottom < 
        document.documentElement.clientHeight + 100 && 
        this.isBodyRowsRendered) {
      this.isBodyRowsRendered = false;
      this.appendTableRows(await this.loadTableData(this.clientRowsPerScreen));
    }
  }

  createEventListeners() {
    this.handleWindowScroll = this.handleWindowScroll.bind(this);

    this.subElements.header.addEventListener('pointerdown', event => {
      const th = event.target.closest('div');
      if (th.getAttribute("data-sortable") === 'true') {
        const order = th.getAttribute('data-order');
        this.sort(th.getAttribute('data-id'), order === 'desc' ? 'asc' : 'desc');
      }
    });
    if (this.infinityScroll)
      window.addEventListener('scroll', this.handleWindowScroll); 
  }

  destroy() {
    window.removeEventListener('scroll', this.handleWindowScroll)
    this.remove();
  }
} 
