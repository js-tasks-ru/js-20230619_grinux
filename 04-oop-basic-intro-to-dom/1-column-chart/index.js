export default class ColumnChart {
  
  chartHeight = 50;

  constructor(chart_data = {})
  {
    this.build(chart_data);
    this.update(chart_data.data);
  }

  build(chart_data)
  {
    this.element = this.create_element(`
      <div class="column-chart column-chart_loading" style="--chart-height: 50">
        <div class="column-chart__title"></div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>    
      </div>
    `);
    this.chart = this.element.querySelector('.column-chart__chart');
    this.chart_data = chart_data;
    if (this.chart_data.label) {
      this.element.querySelector('.column-chart__title').innerText = this.chart_data.label;
    }
    if (this.chart_data.value) {
      if (this.chart_data.formatHeading)
        this.chart_data.value = this.chart_data
          .formatHeading([this.chart_data.value.toLocaleString("en-US")])
      this.element.querySelector('.column-chart__header').innerText = this.chart_data.value;
    }
    if (this.chart_data.link)
      this.element
        .querySelector('.column-chart__title')
        .insertAdjacentHTML('beforeend', `
        <a href="/${this.chart_data.link}" class="column-chart__link">View all</a>
        `);
  }

  update(data = []) {
    this.chart_data.data = data;
    this.chart.innerHTML = '';
    if (data.length)
    {
      const max_data = Math.max(...this.chart_data.data);
      for (let data_val of this.chart_data.data) {
        const value = Math.floor(data_val * this.chartHeight / max_data);
        const percnt = Math.round(data_val * 100 / max_data);
        this.chart.appendChild(this.create_element(`
        <div style="--value: ${value}" data-tooltip="${percnt}%"></div>
        `));
      }
      this.element.classList.remove('column-chart_loading');
    }
    else {
      this.element.classList.add('column-chart_loading');
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
