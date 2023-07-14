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
    const { url = '', isSortLocally = false, sorted = defaultSorted } = params;

    super();
    this.headerConfig = headerConfig;
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.id = sorted.id;
    this.order = sorted.order;

    this.tableData = [];
    this.tableDataRequestIndex = 0;
    this.clientRowsPerScreen = INITIAL_LOADING_NUM;

    this.render();
  }

  async render() {
    this.element = this.createElement(this.createTable());
    this.subElements = {
      header: this.element.querySelector('[data-element="header"]'),
      body: this.element.querySelector('[data-element="body"]')
    };
    this.createEventListeners();  //-- если вынести в конструктор, то тесты успевают 
                                  //-- сделать клик после вызова render() до того, 
                                  //-- как установятся обработчик событий клика
    this.isBodyRowsRendered = false;
    if (this.isSortLocally)
    {
      this.appendTableRows(await this.loadTableData(INITIAL_LOADING_NUM));
 //     if (this.clientRowsPerScreen > INITIAL_LOADING_NUM)
 //       this.appendTableRows(await this.loadTableData(this.clientRowsPerScreen * 2 - INITIAL_LOADING_NUM));
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
    let docBottomBeforeAppend = document.documentElement.getBoundingClientRect().bottom;
    
    this.subElements.body.insertAdjacentHTML
      ('beforeEnd', 
        tableData.map(item => this.createBodyRows(item)).join(''));

    let docBottomAfterAppend = document.documentElement.getBoundingClientRect().bottom; 
    this.clientRowsPerScreen = Math.round(document.documentElement.clientHeight * tableData.length /
      (docBottomAfterAppend - docBottomBeforeAppend)); //number of rows fitted in client window 
    
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

  async sort(field, order) {
    if (this.isSortLocally)
      this.sortOnClient(field, order);
    else
      await this.sortOnServer(field, order);

    this.clearTable(); 
    this.appendTableRows(this.tableData);
  }

  async sortOnServer(field, order) {
    this.tableDataRequestIndex = 0;
    this.tableData = [];
    this.id = field;
    this.order = order;

    this.setSortColumnStyle();

    this.showSkeleton(true);
    this.tableData = await this.loadTableData(this.clientRowsPerScreen * 2);
    this.showSkeleton(false);
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
    try {
      let response = await fetch(this.createUrl(this.tableDataRequestIndex, itemNum));
      this.tableDataRequestIndex += itemNum;
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
    window.addEventListener('scroll', this.handleWindowScroll); 
  }

  destroy() {
    window.removeEventListener('scroll', this.handleWindowScroll)
    this.remove();
  }
} 
