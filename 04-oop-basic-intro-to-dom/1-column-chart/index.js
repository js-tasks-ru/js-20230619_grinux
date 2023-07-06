export default class ColumnChart {
  constructor(chart_data)
  {
    this.element = createElement(`
      <div class="column-chart" style="--chart-height: 50">
        <div class="column-chart__title"></div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart">

          </div>
      </div>
    `);
    this.chartHeight = 50;//this.element.style.getPropertyValue('--chart-height');
    this.element.classList.add('column-chart_loading');
    if (!chart_data)
      return;
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
    this.update(this.chart_data.data);
  }

  update(data) {
    if (data && data.length)
    {
      const max_data = Math.max(...data);
      for (let data_val of data) {
        //-- Тесты требуют разного округления для значений и процентов. 
        //-- Потеря времени на разборки
        const value = Math.floor(data_val * this.chartHeight / max_data);
        const percnt = Math.round(data_val * 100 / max_data);
        this.element.querySelector('.column-chart__chart')
                    .appendChild(createElement(`
        <div style="--value: ${value}" data-tooltip="${percnt}%"></div>
        `));
      }
      this.element.classList.remove('column-chart_loading');
    }
    else {
      this.element.classList.add('column-chart_loading');
    }
  }

  //-- Непонятно требование теста о наличии двух одинаковых методов
  remove()
  {
    this.element.remove();
  }
 
  destroy()
  {
    this.element.remove();
  }

}

function createElement(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
};