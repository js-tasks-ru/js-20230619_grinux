export default class ColumnChart {
  
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link,
    value,
    formatHeading
  } = {})

  {
    this.data = data;
    this.label = label;
    this.link = link;
    this.fmt = formatHeading;
    this.value = value;

    this.build(this.chart_data);
    this.update(this.data);
  }

  build()
  {
    this.element = this.create_element(this.get_template());
    this.chart = this.element.querySelector('.column-chart__chart');
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

  update(data = []) {
    this.data = data;
    this.chart.innerHTML = '';
    if (!this.data.length) {
      this.element.classList.add('column-chart_loading');
      return;
    }
    
    const max_data = Math.max(...this.data);
    for (let data_val of this.data) {
      const value = Math.floor(data_val * this.chartHeight / max_data);
      const percnt = Math.round(data_val  * 100 / max_data);
      this.chart.appendChild(this.create_element(`
        <div style="--value: ${value}" data-tooltip="${percnt}%"></div>
        `));
    }
    this.element.classList.remove('column-chart_loading');
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
