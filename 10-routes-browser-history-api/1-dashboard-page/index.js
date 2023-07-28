import LJSBase from '../../components/LJSBase.js';

import RangePicker from '../../08-forms-fetch-api-part-2/2-range-picker/index.js';
import SortableTable from '../../07-async-code-fetch-api-part-1/2-sortable-table-v3/index.js';
import ColumnChart from '../../07-async-code-fetch-api-part-1/1-column-chart/index.js';
import DoubleSlider from '../../06-events-practice/3-double-slider/index.js';
import ProductForm from '../../09-tests-for-frontend-apps/1-product-form-v2/index.js';
import Tooltip from '../../06-events-practice/2-tooltip/index.js'

import Router from '../../components/router.js';

import bestsellersHeader from './bestsellers-header.js';
import productsHeader from './products-header.js';

import { defaultToDate, defaultFromDate } from '../../components/defaultDate.js'

const BACKEND_URL = 'https://course-js.javascript.ru/';
const API_URL = 'api/rest'
const DASH_URL = 'api/dashboard'
const DASH_ORDERS_URL = `${DASH_URL}/orders`;
const DASH_SALES_URL = `${DASH_URL}/sales`;
const DASH_CUSTOMERS_URL = `${DASH_URL}/customers`;
const DASH_BESTSELLERS_URL = `${DASH_URL}/bestsellers`;
const PRODUCTS_URL = `${API_URL}/products`;

const PRODUCTS_ROUTE_PATH = '/products';
const DASH_ROUTE_PATH = '/'

const PRICE_SLIDER_MIN = 0;
const PRICE_SLIDER_MAX = 4000;

export default class Page extends LJSBase {
  routes = [
    {
      path: DASH_ROUTE_PATH,
      title: 'Dashboard',
      createComponent: DashboardPage
    },
    {
      path: PRODUCTS_ROUTE_PATH,
      title: 'Products',
      serveSubPath: true,
      createComponent: ProductsPage
    }
  ];

  constructor() {
    super();

    if (typeof jest !== 'undefined')
      return new DashboardPage(); //map to DashBoard page class for tests

    this.loadingStatusElement = document.body.querySelector('.main');
    this.loadingStatusElement.classList.add('is-loading');  
    
    this.toggleSidebarButtonElement = document.querySelector('.sidebar__toggler');
    
    new Tooltip().initialize(); 
  }

  async render(path, contentElement) {

    this.createEventListeners();

    this.route = new Router(this.routes, this.routes[0], contentElement);
    this.route(path);
  }

  showNotificationSuccess(text) {
    document.body.appendChild(this.createElement(this.getNotificationTemplate('success', text)));
    setTimeout(this.removeNotification, 3000);
  }

  showNotificationError(text) {
    document.body.appendChild(this.createElement(this.getNotificationTemplate('error', text)));
    setTimeout(this.removeNotification, 3000);
  }

  getNotificationTemplate(type, text) {
    return (`
      <div class="notification notification_${type} show">
        <div class="notification__content">
        ${text}
        </div>
      </div>
      `);
  }

  removeNotification() {
    document.body.querySelector('.notification').remove();
  }

  handleProductEditCompleted = event => {
    if (event.type === 'product-updated')
      this.showNotificationSuccess('Product updated');
    if (event.type === 'product-saved') {
      this.showNotificationSuccess('Product saved');
      this.route(`${PRODUCTS_ROUTE_PATH}/${event.detail}`);
    }
  }

  handleFetchProgress = event => {
    if (event.type === 'fetch-active')
      this.setLoadingStatus();
    if (event.type === 'fetch-completed')
      this.clearLoadingStatus();
    if (event.type === 'fetch-error')
      this.showNotificationError(event.detail);
  }

  setLoadingStatus() {
    this.loadingStatusElement.classList.add('is-loading'); 
  }

  clearLoadingStatus() {
    this.loadingStatusElement.classList.remove('is-loading');
  }

  createEventListeners() {
    document.addEventListener('product-updated', this.handleProductEditCompleted);
    document.addEventListener('product-saved', this.handleProductEditCompleted);
    document.addEventListener('fetch-active', this.handleFetchProgress);
    document.addEventListener('fetch-completed', this.handleFetchProgress);
    document.addEventListener('fetch-error', this.handleFetchProgress);
    this.toggleSidebarButtonElement.addEventListener('click',
      () => document.body.classList.toggle('is-collapsed-sidebar'));
  }

  removeEventListeners() {
    document.removeEventListener('product-updated', this.handleProductEditCompleted);
    document.removeEventListener('product-saved', this.handleProductEditCompleted);
    document.removeEventListener('fetch-active', this.handleFetchProgress);
    document.removeEventListener('fetch-completed', this.handleFetchProgress);
    document.removeEventListener('fetch-error', this.handleFetchProgress);
    this.toggleSidebarButtonElement.addEventListener('click',
      () => document.body.classList.toggle('is-collapsed-sidebar'));

  }

  destroy() {
    this.removeEventListeners();
  }

}

class DashboardPage extends LJSBase {

  to = defaultToDate();
  from = defaultFromDate(this.to);

  charts = [
    {
      config: {
        label: 'Orders',
        link: 'sales',
        url: new URL(DASH_ORDERS_URL, BACKEND_URL),
        range: {
          to: this.to,
          from: this.from
        }
      },
      holderElementName: 'ordersChart'
    },
    {
      config: {
        label: 'Sales',
        url: new URL(DASH_SALES_URL, BACKEND_URL),
        formatHeading: data => `$${data.toLocaleString("en-US")}`,
        range: {
          to: this.to,
          from: this.from
        }
      },
      holderElementName: 'salesChart'
    },
    {
      config: {
        label: 'Customers',
        url: new URL(DASH_ORDERS_URL, BACKEND_URL),
        range: {
          to: this.to,
          from: this.from
        }
      },
      holderElementName: 'customersChart'
    },
  ];
  
  constructor() {

    super();

    this.element = this.createElement(this.createTemplate());
    this.subElements = this.getSubElements(this.element);

    this.rangePicker = new RangePicker({
      to: this.to,
      from: this.from
    });
    this.subElements.rangePicker.append(this.rangePicker.element);

    for (let chart of this.charts) {
      this[chart.holderElementName] = new ColumnChart(chart.config);
      this.subElements[chart.holderElementName].append(this[chart.holderElementName].element);
    }

    const createBestsellersUrl = () => {
      let url = new URL(DASH_BESTSELLERS_URL, BACKEND_URL);
      url.searchParams.set('from', this.from);
      url.searchParams.set('to', this.to);
      return url;
    }

    this.bestsellersTable = new SortableTable(
      bestsellersHeader,
      {
        isSortLocally: true,
        infinityScroll: false,
        url: createBestsellersUrl()
      });

    this.bestsellersTable.element.querySelectorAll('[data-sortable="false"]')
      .forEach(unsortable => {delete unsortable.dataset.sortable});//for back compatibility with tests  
    
    this.subElements.sortableTable.append(this.bestsellersTable.element);

    return this;
  }

  createTemplate() {
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

  render() {
    this.createEventListeners();
    return this.element;
  }

  handleDateSelectEvent = event => {
    const { from, to } = event.detail;
    this.from = from;
    this.to = to;
    this.update(this.from, this.to);
  }

 update(from, to) {

    this.ordersChart.update(from, to);
    this.salesChart.update(from, to);
    this.customersChart.update(from, to);
    
    this.bestsellersTable.url.searchParams.set('from', from.toISOString());
    this.bestsellersTable.url.searchParams.set('to', to.toISOString());
    this.bestsellersTable.sortOnServer();
  }

  createEventListeners() {
    this.element.addEventListener('date-select', this.handleDateSelectEvent);
  }

  removeEventListeners() {

  }

  destroy() {
    this.detach();
    this.element = null;
  }

  detach() {
    this.removeEventListeners();
    this.remove();
  }

}

class ProductsPage extends LJSBase {
  constructor() {
    
    super();

    this.priceSliderMin = PRICE_SLIDER_MIN;
    this.priceSliderMax = PRICE_SLIDER_MAX;

    this.productsPageElement = this.createElement(this.createTemplate()); 
    this.subElements = this.getSubElements(this.productsPageElement);

    this.doubleSlider = new DoubleSlider({
      min: this.priceSliderMin,
      max: this.priceSliderMax,
      formatValue: data => `$${data}`
    });
    this.subElements.sliderContainer.append(this.doubleSlider.element);

    this.productsTable = new SortableTable(
      productsHeader,
      {
        isSortLocally: true,
        url: this.createProductsUrl()
      });

    this.productsTable.element.insertAdjacentHTML('beforeEnd', this.createTableIsEmptyTemplate());
    this.subElements.clearFiltersButton = this.productsTable.element.querySelector('.button-primary-outline');
    this.subElements.productsContainer.append(this.productsTable.element);

    return this;
  }


  render(path) {
    if (path)
      return this.renderChild(path);
    return this.renderThis();
  }

  renderThis() {
    this.element = this.productsPageElement;
    this.createEventListeners();
    return this.element;
  }

  renderChild(path) {
    this.element = (new ProductEditPage).render(path);
    return this.element;
  }

  createTemplate() {
    return (`
    <div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Товары</h1>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>
      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="sliderContainer">
            <label class="form-label">Цена:</label>
          </div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-element="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>
      </div>
      <div data-element="productsContainer" class="products-list__container">
      <!-- Products table -->
      </div>
    </div>
    `);
  }

  createTableIsEmptyTemplate() {
    return (`
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
          <button type="button" class="button-primary-outline">Очистить фильтры</button>
        </div>
      </div
      `);
  }

  createProductsUrl() {
    let url = new URL(PRODUCTS_URL, BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');
    return url;
  }

  onFilterNameInput = event => {
    clearTimeout(this.handleFilterNameInputTimeoutID);
    this.handleFilterNameInputTimeoutID = setTimeout(this.updateProductsList, 500, event);
  }

  updateProductsList = async (event = {}) => {

    let url = this.createProductsUrl();

    if (event.type === 'input')
      this.filterNameInputValue = event.target.value;
    if (event.type === 'change')
      this.filterStatusSelectValue = event.target.selectedIndex;
    if (event.type === 'range-select') {
      this.priceSliderMin = event.detail.from;
      this.priceSliderMax = event.detail.to;
    }
    if (this.filterNameInputValue)
      url.searchParams.set('title_like', this.filterNameInputValue);
    if (this.filterStatusSelectValue)
      url.searchParams.set('status', this.filterStatusSelectValue);
    url.searchParams.set('price_gte', this.priceSliderMin);
    url.searchParams.set('price_lte', this.priceSliderMax);
    this.productsTable.url = url;
    this.productsTable.element.classList.remove('sortable-table_empty');
    if (!await this.productsTable.sortOnServer())
      this.productsTable.element.classList.add('sortable-table_empty');
  }

  onClearFiltersButtonClick = () => {

    this.subElements.filterName.value = '';
    this.subElements.filterStatus.value = '';
    this.doubleSlider.reset();

    this.filterNameInputValue = '';
    this.filterStatusSelectValue = 0;
    this.priceSliderMin = PRICE_SLIDER_MIN;
    this.priceSliderMax = PRICE_SLIDER_MAX;

    this.updateProductsList();
  }  

  removeEventListeners() {
    document.removeEventListener('range-select', this.updateProductsList);
  }

  createEventListeners() {
    this.subElements.filterName.addEventListener('input', this.onFilterNameInput);
    this.subElements.filterStatus.addEventListener('change', this.updateProductsList);
    this.subElements.clearFiltersButton.addEventListener('click', this.onClearFiltersButtonClick);
    
    document.addEventListener('range-select', this.updateProductsList);
    
  }

  destroy() {
    this.detach();
    this.element = null;
  }

  detach() {
    this.removeEventListeners();
    this.remove();
  }

}

class ProductEditPage extends LJSBase {
  constructor() {
    
    super();

    return this;
  }

  render(path) {
    this.productForm = new ProductForm(path === 'add' ? null : path);
    this.productForm.render();
    
    this.element = this.createElement(this.getProductFormTemplate(path === 'add' ? false : true));
    this.element.querySelector('.content-box').append(this.productForm.element);

    this.createEventListeners();
    return this.element;
  }

  getProductFormTemplate(isEdit) {
    return (`
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a>
             / ${isEdit ? 'Edit' : 'Add'} 
          </h1>
        </div>
        <div class="content-box"></div>
      </div>
      `);
  }


  removeEventListeners() {

  }

  createEventListeners() {

  }
  
  destroy() {
    this.detach();
    this.element = null;
  }

  detach() {
    this.removeEventListeners();
    this.remove();
  }
}
