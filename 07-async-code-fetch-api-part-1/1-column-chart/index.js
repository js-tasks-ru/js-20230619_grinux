import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  
  chartHeight = 50;

  constructor({
    url = '',
    label = '',
    range: {
      from = 1, 
      to = 2
    } = {},
    link,
    value,
    formatHeading
  } = {})

  {
    this.url = url;
    this.label = label;
    this.link = link;
    this.fmt = formatHeading;
    this.value = value;
    this.from = from;
    this.to = to;
    this.subElements = {};

    this.build();
    this.update(this.from, this.to);
  }

  build()
  {
    this.element = this.create_element(this.get_template());
    this.subElements.body = this.element.querySelector('.column-chart__chart');
  }

  get_template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          ${this.link ? `<a href="/${this.link}" class="column-chart__link">View all</a>` : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value ? 
              this.fmt ? this.fmt([this.value.toLocaleString("en-US")]) : this.value : 
              ''}
          </div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>    
      </div>
  `
  }

  async update(from, to) {
    let response;

    try {
      response = await fetch(BACKEND_URL + '/' + this.url + '?from=' + from + '&to=' + to);
      this.data = await response.json()

      let data = Object.entries(this.data).map(entry => entry[1]);

      this.subElements.body.innerHTML = '';

      if (!data.length) {
        this.element.classList.add('column-chart_loading');
        return this.data; //обязательно ли в этом случае возвращать промис?
      }

      const max_data = Math.max(...data);

      for (let data_val of data) {
        const value = Math.floor(data_val * this.chartHeight / max_data);
        const percnt = Math.round(data_val * 100 / max_data);
        this.subElements.body.appendChild(this.create_element(`
        <div style="--value: ${value}" data-tooltip="${percnt}%"></div>
        `));
      }

      this.element.classList.remove('column-chart_loading');

      return this.data;

    }
    catch (err) {
      throw new Error(`Network error has occurred: ${err}`);
    }
  }

  create_element(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }

  remove()
  {
    this.element.remove();
  }
 
  destroy()
  {
    this.remove();
  }
}
