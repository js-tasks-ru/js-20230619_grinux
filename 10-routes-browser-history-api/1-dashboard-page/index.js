import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';
import LJSBase from '../../components/LJSBase.js';


import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page extends LJSBase {
  constructor() {

  }

  async render() {
    return this.element;
  }

}
/* <div class="dashboard">
<div class="content__top-panel">
  <h2 class="page-title">Dashboard</h2>
  <!-- RangePicker component -->
  <div data-element="rangePicker"></div>
</div>
<div data-element="chartsRoot" class="dashboard__charts">
  <!-- column-chart components -->
  <div data-element="ordersChart" class="dashboard__chart_orders"></div>
  <div data-element="salesChart" class="dashboard__chart_sales"></div>
  <div data-element="customersChart" class="dashboard__chart_customers"></div>
</div>

<h3 class="block-title">Best sellers</h3>

<div data-element="sortableTable">
  <!-- sortable-table component -->
</div>
</div> */
