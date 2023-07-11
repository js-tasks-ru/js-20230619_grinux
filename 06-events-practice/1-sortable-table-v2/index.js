export default class SortableTable {
  constructor(headerConfig, {
    data = [],
    sorted = {},
    locally = true
  } = {}) {
    this.config = headerConfig;
    this.is_sort_locally = locally;
    this.data = data;
    this.build_header();
    this.sort(sorted.id, sorted.order);
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
    this.subElements.header.addEventListener('pointerdown', event => {
      const th = event.target.closest('div'); 
      if(th.getAttribute("data-sortable") === 'true')
      { 
        const order = th.getAttribute('data-order');
        this.sort(th.getAttribute('data-id'), order === 'desc' ? 'asc' : 'desc');
      }
    });
  }

  sort (field, order) {
    if (this.is_sort_locally)
      this.sort_on_client(field, order);
    else
      this.sort_on_server(field, order);   
  }

  sort_on_server (field, order = 'asc')
  {
    throw new Error('sort_on_server() not implemented yet');
  }

  sort_on_client(field, order = 'asc') {
    const sort_type = this.config.find(item => item.id === field).sortType;
    this.data.sort((a, b) => {
      if (sort_type == 'number')
        return order === 'desc' ? b[field] - a[field] : a[field] - b[field];
      else
        return order === 'desc' ?
          b[field].toString().localeCompare(a[field].toString(), ['ru-RU'], { caseFirst: 'upper' }) :
          a[field].toString().localeCompare(b[field].toString(), ['ru-RU'], { caseFirst: 'upper' });

    });

    this.render_header(field, order);
    this.render_table();
  }

  render_header(field, order) {
    if (this.subElements.sort_id) {
      this.subElements.sort_id.removeAttribute("data-order");
      this.subElements.sort_id.querySelector('.sortable-table__sort-arrow').remove();
    }
    this.subElements.sort_id = this.subElements.header.querySelector(`[data-id="${field}"]`);
    this.subElements.sort_id.setAttribute("data-order", order);
    this.subElements.sort_id.appendChild(this.create_element(`
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `));
    this.subElements.body.innerHTML = ''; //-- возможно нужно не удаление, а inplace сортировка, 
                                          //-- чтобы картинки не перезагружались каждый раз?
  }

  render_table() {
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
