import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const INITIAL_LOADING_NUM = 30;

export default class SortableTable {
  constructor(headerConfig, {
    url = '',
    isSortLocally = false,
    sorted: {
      id = headerConfig.find(item => item.sortable).id,
      order = 'asc'
    } = {},
  } = {}) {

    this.config = headerConfig;
    this.url = url;
    this.is_sort_locally = isSortLocally;
    this.id = id;
    this.order = order;
    this.data = [];
    this.start = 0;
    this.num = INITIAL_LOADING_NUM;

    this.scroll = this.scroll.bind(this);

    this.build_header();
    this.render();
  }

  build_header() {
    this.element = this.create_element(`
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row"></div>
        <div data-element="body" class="sortable-table__body"></div>
      </div>`
    );

    this.subElements = {};
    this.subElements.header = this.element.querySelector('[data-element="header"]');
    this.subElements.body = this.element.querySelector('[data-element="body"]');

    for (let th of this.config) {
      this.subElements.header.appendChild(this.create_element(`
        <div class="sortable-table__cell" data-id="${th.id}" data-sortable="${th.sortable}">
          <span>${th.title}</span>
        </div>
      `));
    }

    this.subElements.header.addEventListener('pointerdown', e => {
      const th = e.target.closest('div');
      if (th.getAttribute("data-sortable") === 'true') {
        const order = th.getAttribute('data-order');
        if (this.is_sort_locally)
          this.sortOnClient(th.getAttribute('data-id'), order === 'desc' ? 'asc' : 'desc');
        else
          this.sortOnServer(th.getAttribute('data-id'), order === 'desc' ? 'asc' : 'desc');
      }
    });
  }

  async render() {

    this.render_header();
    await this.get_data();
    this.render_table();

  }

  async get_data() {

    let response;
    try {
      response = await fetch(` 
        ${BACKEND_URL}/
        ${this.url}?
        _start=${this.start}&
        _end=${this.start + this.num}
        ${!this.is_sort_locally ? `&_sort=${this.id}&_order=${this.order}` : ''}
      `.replace(/(\r\n|\n|\r| )/gm, ""));

      this.new_data = await response.json();
      this.start += this.num;

    } catch (err) {
      throw new Error(`Network error has occurred: ${err}`);
    }
  }

  async sortOnServer(field, order) {
    this.start = 0;
    this.data = [];
    this.id = field;
    this.order = order;

    this.render();
  }

  sortOnClient(field, order) {
    this.id = field;
    this.order = order;
    const sort_type = this.config.find(item => item.id === this.id).sortType;
    this.data.sort((a, b) => {
      if (sort_type == 'number')
        return this.order === 'desc' ? b[this.id] - a[this.id] : a[this.id] - b[this.id];
      else
        return this.order === 'desc' ?
          b[this.id].toString().localeCompare(a[this.id].toString(), ['ru-RU'], { caseFirst: 'upper' }) :
          a[this.id].toString().localeCompare(b[this.id].toString(), ['ru-RU'], { caseFirst: 'upper' });

    });
    this.new_data = this.data;
    this.data = [];

    this.render_header();
    this.render_table();
  }

  render_header() {
    if (this.subElements.sort_id) {
      this.subElements.sort_id.removeAttribute("data-order");
      this.subElements.sort_id.querySelector('.sortable-table__sort-arrow').remove();
    }
    this.subElements.sort_id = this.subElements.header.querySelector(`[data-id="${this.id}"]`);
    this.subElements.sort_id.setAttribute("data-order", this.order);
    this.subElements.sort_id.appendChild(this.create_element(`
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `));
  }

  append_table() {
    let document_bottom = document.documentElement.getBoundingClientRect().bottom;

    for (let item of this.new_data) {
      const entry = this.subElements.body.appendChild(this.create_element(`
        <a href="/products/${item['id']}" class="sortable-table__row">  
      `));
      for (let th of this.config) {
        if (th.template)
          entry.appendChild(this.create_element(th.template(item[th.id])));
        else
          entry.appendChild(this.create_element(`
              <div class="sortable-table__cell">${item[th.id]}</div>
            `));
      }
    }

    this.num = Math.round(document.documentElement.clientHeight * this.num / //number of rows fitted in client window 
      (document.documentElement.getBoundingClientRect().bottom - document_bottom));

    this.data = [...this.data, ...this.new_data];

    window.addEventListener('scroll', this.scroll); //Data where rendered. Enable scroll checking.
  }

  async scroll() {
    //-- Не нравится, как организована работа scroll обработчика
    //-- Можно ли сделать лучше?
    if (document.documentElement.getBoundingClientRect().bottom < document.documentElement.clientHeight + 100) {
      window.removeEventListener('scroll', this.scroll); //Disable scroll event until data loaded and rendered
      await this.get_data();
      this.append_table();
    }
  }

  render_table() {
    this.subElements.body.innerHTML = '';
    this.append_table();
  }

  create_element(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    window.removeEventListener('scroll', this.scroll)
    this.remove();
  }
} 
