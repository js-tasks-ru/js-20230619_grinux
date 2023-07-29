import fetchJson from '../../components/fetch-json.js';
import LJSBase from '../../components/LJSBase.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends LJSBase {
  
  chartHeight = 50;

  constructor({
    url = '',
    label = '',
    range: {
      from = new Date(), 
      to = new Date()
    } = {},
    link,
    value,
    formatHeading
  } = {})

  {
    super();
    this.url = url;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.value = value;
    this.from = from;
    this.to = to;

    this.build();
    this.update(this.from, this.to);
  }

  build()
  {
    this.element = this.createElement(this.createTemplate());
    this.subElements = {
      body: this.element.querySelector('.column-chart__chart'),
      header: this.element.querySelector('.column-chart__header')
    }
  }

  createTemplate() {
      return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          ${this.link ? `<a href="/${this.link}" class="column-chart__link">View all</a>` : ''}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.value ? 
              this.formatHeading ? this.formatHeading([this.value.toLocaleString("en-US")]) : this.value : 
              ''}
          </div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>    
      </div>
  `
  }

  async update(from, to) {
    this.showSkeleton();

    this.url = new URL(this.url, BACKEND_URL);
    this.url.searchParams.set('from', from);
    this.url.searchParams.set('to', to);
    
    let response = await fetchJson(this.url);

    this.chartData = Object.entries(response).map(entry => entry[1]);

    if (!this.chartData.length)
      return;

    this.subElements.body.innerHTML = this.fill();

    this.hideSkeleton();

    return response;
  }

  hideSkeleton() {
    this.element.classList.remove('column-chart_loading');
  }

  showSkeleton() {
    this.element.classList.add('column-chart_loading');
  }

  fill() {
    const maxChartData = Math.max(...this.chartData);
    this.value = 0;
    let chartDataHTML =  this.chartData
      .map(chartDataValue => {
        this.value += chartDataValue;
        const value = Math.floor(chartDataValue * this.chartHeight / maxChartData);
        const percent = Math.round(chartDataValue * 100 / maxChartData);
        return (`<div style="--value: ${value}" data-tooltip="${percent}%"></div>`);
      })
      .join('');
      this.subElements.header.textContent = this.formatHeading ? 
                this.formatHeading([this.value.toLocaleString("en-US")]) : 
                this.value;
    return chartDataHTML;            
  }
 
  destroy()
  {
    this.remove();
  }
}
