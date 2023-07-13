export default class ColumnChart {

  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link,
    value,
    formatHeading
  } = {}) {
    this.chartData = data;
    this.label = label;
    this.link = link;
    this.fmt = formatHeading;
    this.value = value;

    this.build();
  }

  build() {
    this.element = this.createElement(this.getTemplate());
    this.chartElement = this.element.querySelector('.column-chart__chart');
    this.fill();
  }

  getTemplate() {
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

  setLoadingStatus(isLoading) {
    isLoading ? this.element.classList.add('column-chart_loading') : 
                     this.element.classList.remove('column-chart_loading')
  }

  fill() {
    if (!this.chartData.length) {
      this.setLoadingStatus(true);
      return;
    }

    const maxChartData = Math.max(...this.chartData);
    for (let chartDataValue of this.chartData) {
      const value = Math.floor(chartDataValue * this.chartHeight / maxChartData);
      const percent = Math.round(chartDataValue * 100 / maxChartData);
      this.chartElement.appendChild(this.createElement(`
        <div style="--value: ${value}" data-tooltip="${percent}%"></div>
        `));
    }
    this.setLoadingStatus(false);
  }

  update(data = []) {
    this.chartData = data;
    this.chartElement.innerHTML = '';
    
    this.fill();
  }

  createElement(html) {
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
