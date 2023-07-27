import RangePicker from '../../08-forms-fetch-api-part-2/2-range-picker/index.js';
import SortableTable from '../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js';
import ColumnChart from '../../07-async-code-fetch-api-part-1/1-column-chart/index.js';
import DoubleSlider from '../../06-events-practice/3-double-slider/index.js';

import header from './bestsellers-header.js';
import LJSBase from '../../components/LJSBase.js';
import { defaultToDate, defaultFromDate } from '../../components/defaultDate.js'


import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';
const API_URL = 'api/rest'
const DASH_URL = 'api/dashboard'
const DASH_ORDERS_URL = `${DASH_URL}/orders`;
const DASH_SALES_URL = `${DASH_URL}/sales`;
const DASH_CUSTOMERS_URL = `${DASH_URL}/customers`;
const DASH_BESTSELLERS_URL = `${DASH_URL}/bestsellers`;

export default class Page extends LJSBase {
  constructor() {
    super();

    this.to = defaultToDate();
    this.from = defaultFromDate(this.to);
  }

  async render() {
    if (!this.dashBoardElement) {
      this.dashBoardElement = this.createDashBoard();
    }
    return this.dashBoardElement;
  }

  createDashBoard() {
    let dashBoardElement = this.createElement(this.createDashBoardTemplate());
    this.element = dashBoardElement;
    this.subElements = this.getSubElements(dashBoardElement);
    this.rangePicker = new RangePicker({
      to: this.to,
      from: this.from
    });
    this.subElements.rangePicker.append(this.rangePicker.element);

    this.ordersChart = new ColumnChart({
      label: 'Orders',
      link: '/sales',
      url: new URL(DASH_ORDERS_URL, BACKEND_URL),
      range: {
        to: this.to,
        from: this.from
      }
    });
    this.subElements.ordersChart.append(this.ordersChart.element);

    this.salesChart = new ColumnChart({
      label: 'Sales',
      url: new URL(DASH_SALES_URL, BACKEND_URL),
      formatHeading: data => `$${data.toLocaleString("en-US")}`,
      range: {
        to: this.to,
        from: this.from
      }
    });
    this.subElements.salesChart.append(this.salesChart.element);

    this.customersChart = new ColumnChart({
      label: 'Customers',
      url: new URL(DASH_CUSTOMERS_URL, BACKEND_URL),
      range: {
        to: this.to,
        from: this.from
      }
    });
    this.subElements.customersChart.append(this.customersChart.element);

    const createBestsellersUrl = () => {
      let url = new URL(DASH_BESTSELLERS_URL, BACKEND_URL);
      url.searchParams.set('from', this.from);
      url.searchParams.set('to', this.to);
      return url;
    }

    this.bestsellersTable = new SortableTable(
      header,
      {
        isSortLocally: true,
        infinityScroll: false,
        url: createBestsellersUrl()
      });
    this.subElements.sortableTable.append(this.bestsellersTable.element);

    this.createEventListeners();

    return dashBoardElement;
  }

  createDashBoardTemplate() {
    return (`
    <div class="dashboard">
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
    </div>
    `);
  }

  renderProducts() {
    if (!this.productsElement)
    {
      this.productsElement = this.createProducts();
    }
    return this.productsElement;
  }

  createProducts() {
    let productsElement = this.createElement(this.createProductsTemplate());
    this.productsSubElements = this.getSubElements(productsElement);

    this.doubleSlider = new DoubleSlider({
      min: 0,
      max: 4000,
      formatValue: data => `$${data}`
    });
    productsElement.querySelector('[data-elem="sliderContainer"]').append(this.doubleSlider.element);
    
    return productsElement;
  }

  createProductsTemplate() {
    return (`
    <section class="content" id="content">
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div class="content-box content-box_small">
          <form class="form-inline">
            <div class="form-group">
              <label class="form-label">Сортировать по:</label>
              <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
            </div>
            <div class="form-group" data-elem="sliderContainer">
              <label class="form-label">Цена:</label>
            </div>
            <div class="form-group">
              <label class="form-label">Статус:</label>
              <select class="form-control" data-elem="filterStatus">
                <option value="" selected="">Любой</option>
                <option value="1">Активный</option>
                <option value="0">Неактивный</option>
              </select>
            </div>
          </form>
        </div>
        <div data-elem="productsContainer" class="products-list__container">
          <div class="sortable-table">
            <div data-elem="header" class="sortable-table__header sortable-table__row">
              <div class="sortable-table__cell" data-name="images">
                <span>Фото</span>
              </div>
              <div class="sortable-table__cell" data-name="title" data-sortable="">
                <span>Название</span>
                <span class="sortable-table__sort-arrow">
                  <span class="sortable-table__sort-arrow_asc"></span>
                </span>
              </div>
              <div class="sortable-table__cell" data-name="category">
                <span>Категория</span>
              </div>
              <div class="sortable-table__cell" data-name="quantity" data-sortable="">
                <span>Количество</span>
              </div>
              <div class="sortable-table__cell" data-name="price" data-sortable="">
                <span>Цена</span>
              </div>
              <div class="sortable-table__cell" data-name="enabled" data-sortable="">
                <span>Статус</span>
              </div>
            </div>
            <div data-elem="body" class="sortable-table__body">
              <a href="/products/101-planset-lenovo-tab-p10-tb-x705l-32-gb-3g-lte-belyj" class="sortable-table__row">
                <div class="sortable-table__cell">
                  <img class="sortable-table-image" alt="Image" src="https://c.dns-shop.ru/thumb/st4/fit/0/0/29a12db849d89c29dd5d47a1cd6d4e2d/7d51a46e3b127ac66e2225cd0090403054f0d9ee0596d27b78bf1ec2d403972d.jpg">
                </div>
                <div class="sortable-table__cell">10.1" Планшет Lenovo TAB P10 TB-X705L 32 ГБ 3G, LTE белый</div>
                <div class="sortable-table__cell">
                  <span data-tooltip="
                    <div class=&quot;sortable-table-tooltip&quot;>
                      <span class=&quot;sortable-table-tooltip__category&quot;>Смартфоны</span> / <b class=&quot;sortable-table-tooltip__subcategory&quot;>Планшеты, электронные книги</b></div>">Планшеты, электронные книги
                  </span>
                </div>
                <div class="sortable-table__cell">96</div>
                <div class="sortable-table__cell">$300</div>
                <div class="sortable-table__cell">Активен</div>
              </a>
            </div>
            <div data-elem="loading" class="loading-line sortable-table__loading-line"></div>
            <div data-elem="emptyPlaceholder" class="sortable-table__empty-placeholder">
              <div>
                <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
                <button type="button" class="button-primary-outline">Очистить фильтры</button>
              </div>
            </div
          </div>
        </div>
      </div>
    </section>
    `);
  }

  onDocumentClick = async event => {
    if (event.target.closest('a'))
    {
      this.holderElement = this.element.parentElement;
      let clickedElement = null;
      event.preventDefault();
      switch (event.target.closest('a').pathname) {
        case '/':
          clickedElement = await this.render();
          break;
        case '/products':
          clickedElement = this.renderProducts();
          break;
        case '/categories':
          clickedElement = this.renderCategories();
          break;
        case '/sales':
          clickedElement = this.renderSales();
          break;
        default:
          break;
      }
      if (clickedElement)
      {
        this.element.remove();
        this.holderElement.append(clickedElement);
        this.element = clickedElement;
      }
    }
  }

   handleDateSelectEvent = async (event) => {
    const { from, to } = event.detail;
    this.from = from;
    this.to = to;
    await this.update(this.from, this.to);
  } 

  async update(from, to) {
    //-- ToDo групповое ожидание промисов
    this.ordersChart.update(from, to);
    this.salesChart.update(from, to);
    this.customersChart.update(from, to);
    this.bestsellersTable.url.searchParams.set('from', from.toISOString());
    this.bestsellersTable.url.searchParams.set('to', to.toISOString());
    await this.bestsellersTable.sortOnServer();
  }

  removeEventListeners() {
    document.removeEventListener('click', this.onDocumentClick);
  }

  createEventListeners() {
    document.addEventListener('click', this.onDocumentClick);
    this.element.addEventListener('date-select', this.handleDateSelectEvent);
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }

}
