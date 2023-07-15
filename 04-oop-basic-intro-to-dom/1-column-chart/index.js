import LJSBase from '../../components/LJSBase.js';

export default class ColumnChart extends LJSBase{

  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link,
    value,
    formatHeading
  } = {}) {
    super();
    this.chartData = data;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.value = value;

    this.build();
    this.update(this.chartData);
  }

  build() {
    this.element = this.createElement(this.createTemplate());
    this.chartElement = this.element.querySelector('.column-chart__chart');
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

  showSkeleton(isShow) {
    isShow ? this.element.classList.add('column-chart_loading') : 
             this.element.classList.remove('column-chart_loading');
  }

  fill() {
    const maxChartData = Math.max(...this.chartData);

    return this.chartData
      .map(chartDataValue => {
        const value = Math.floor(chartDataValue * this.chartHeight / maxChartData);
        const percent = Math.round(chartDataValue * 100 / maxChartData);
        return (`<div style="--value: ${value}" data-tooltip="${percent}%"></div>`);
      })
      .join('');
  }

  update(data = []) {
    this.chartData = data;
    
    this.showSkeleton(true);

    if (!this.chartData.length)
      return;

    this.chartElement.innerHTML = this.fill();

    this.showSkeleton(false);
  }

  destroy() {
    this.remove();
  }
}
