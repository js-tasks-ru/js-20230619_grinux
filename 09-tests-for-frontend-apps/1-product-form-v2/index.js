import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from '../../components/fetch-json.js';
import LJSBase from '../../components/LJSBase.js'

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const API_URL = '/api/rest/'

export default class ProductForm extends LJSBase {

  numericFieldsNames = ['discount', 'price', 'quantity', 'status'];

  constructor(productId) {
    super();
    
    this.productId = productId;
    this.product = {
      description: '',
      discount: '',
      images: [],
      price: '',
      quantity: '',
      status: '',
      subcategory: '',
      title: ''
    }
  }

  async render() {
    this.element = this.createElement(this.createProductFormRoot());

    if (typeof jest === 'undefined') //Jest does not support import.meta
      this.getCWD = (await import('/components/importMeta.js')).default;

    let url = new URL('categories', BACKEND_URL + API_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    this.categories = await fetchJson(url);

    if (this.productId) {
      let url = new URL('products', BACKEND_URL + API_URL);
      url.searchParams.set('id', this.productId);

      const response = await fetchJson(url);
      if (response.length)
        this.product = response[0];
    }

    this.element.append(this.createElement(this.createProductForm()));
    this.formElement = this.element.querySelector('[data-element="productForm"]');
    this.btnUploadImgElement = this.element.querySelector('[name="uploadImage"]');
    this.imgListContainer = this.element.querySelector('[data-element="imageListContainer"]');
    this.imgList = new SortableList();
    this.appendImgList(this.product.images);
    this.imgListContainer.append(this.imgList.element);
    this.imgListElement = this.imgListContainer.firstElementChild;
    
    this.subElements = { //for tests
      productForm: this.element.firstElementChild,
      imageListContainer: this.imgListElement
    }

    this.createEventListeners();
    return this.element;
  }

  getCategoriesUrl() {
    return (`${BACKEND_URL}/${API_URL}/categories?_sort=weight&_refs=subcategory`);
  }

  createProductFormRoot() {
    return (`<div class="product-form"></div>`);
  }

  createProductForm() {
    return (`
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input value="${escapeHtml(this.product.title)}" required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара">${escapeHtml(this.product.description)}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
          ${this.createCategoriesList(this.categories)}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input value="${this.product ? escapeHtml(this.product.price.toString()) : ''}" required="" type="number" id="price" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input value="${this.product ? escapeHtml(this.product.discount.toString()) : ''}"required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input value="${this.product ? escapeHtml(this.product.quantity.toString()) : ''}"required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" id="status" name="status">
          <option ${this.product && this.product.status === 1 ? `selected` : ''} value="1">Активен</option>
          <option ${this.product && this.product.status === 0 ? `selected` : ''} value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
  `);
  }

  appendImgList(images) {
    this.imgList.append(
      images.map(image => {
        return this.createElement(`
        <li class="products-edit__imagelist-item" style="">
          <input type="hidden" name="url" value="${image.url}">
          <input type="hidden" name="source" value="${image.source}">
          <span>
            <img src="${this.getCWD ? this.getCWD() + '/' : ''}icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
            <span>${image.source}</span>
          </span>
          <button type="button">
            <img src="${this.getCWD ? this.getCWD() + '/' : ''}icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>`
        )
      })
    );
  }

  createCategoriesList(categories) {
    return categories
      .map(category => category.subcategories
          .map(sub => `<option value="${sub.id}">${category.title} &gt ${sub.title}</option>`)
          .join(''))
      .join('');
  }

  async onFormSubmit(event) {
    event.preventDefault();
    let editedProduct = {};
    Object.entries(this.product).map(([name]) => {
      const fieldName = this.formElement.querySelector(`[name="${name}"]`);
      if (fieldName) {
        editedProduct[name] = this.numericFieldsNames.includes(name) ? 
            parseFloat(fieldName.value) : fieldName.value;
      }
    });

    editedProduct.images = [...this.imgListElement.children].map(imgElement => {
      return {
        url: imgElement.querySelector(`[name="url"]`).value,
        source: imgElement.querySelector(`[name="source"]`).value,
      }
    });

    if (this.productId)
    {
      editedProduct.id = this.product.id;
      await this.save(editedProduct);
    }
    else
      this.productId =  (await this.create(editedProduct)).id; 

  }

  async save(product) {
    await this.uploadProduct(product, false);
    this.element.dispatchEvent(new CustomEvent('product-updated', {
      detail: product?.id,
      bubbles: true
    }));
  }

  async create(product) {
    const response = await this.uploadProduct(product, true);
    this.element.dispatchEvent(new CustomEvent('product-saved', {
      detail: response.id,
      bubbles: true
    }));
    return response;
  }

  async uploadProduct(product, isNew) {
    return await fetchJson(new URL('products', BACKEND_URL + API_URL), {
      method: isNew ? 'PUT' : 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product)
    });
  }

  onUploadImgButtonClick() {
    const uploadImgInputElement = this.element.appendChild(this.createElement(`
      <input type="file" accept="image/*" hidden=""></input>
      `));
    uploadImgInputElement.click();
    uploadImgInputElement.addEventListener('change', async (event) => {
      event.preventDefault();

      const uploadImgFileName = uploadImgInputElement.value.replace(/.*[\/\\]/, '');

      let response = await this.uploadImage(uploadImgInputElement.files[0]);

      const uploadedImgInfo = {
        url: response.data.link,
        source: response.data.link.replace(/.*[\/\\]/, '')
      };

      this.appendImgList([{
        url: uploadedImgInfo.url,
        source: uploadImgFileName
      }]);

      this.product.images.push(uploadedImgInfo);

      uploadImgInputElement.remove();
    });
  }

  async uploadImage(image) {
    this.setUploadImgButtonStatusLoading(true);

    let response = await fetchJson('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        "Authorization": `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: image
    });

    this.setUploadImgButtonStatusLoading(false);

    return response;
  }

  handleImgDelete(event) {
    const imgSourceName = event.detail.querySelector('[name="source"]').value;

    this.product.images.
      splice(this.product.images.findIndex(image => image.source === imgSourceName), 1);
  }

  setUploadImgButtonStatusLoading(isLoading) {
    if (isLoading) {
      this.btnUploadImgElement.classList.add('is-loading');
      this.btnUploadImgElement.setAttribute('disabled', '');
    }
    else {
      this.btnUploadImgElement.classList.remove('is-loading');
      this.btnUploadImgElement.removeAttribute('disabled');
    }
  }
  
  createEventListeners() {
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onUploadImgButtonClick = this.onUploadImgButtonClick.bind(this);
    this.handleImgDelete = this.handleImgDelete.bind(this); 

    this.imgListElement.addEventListener('item-delete', this.handleImgDelete);
    this.formElement.addEventListener('submit', this.onFormSubmit);
    this.btnUploadImgElement.addEventListener('click', this.onUploadImgButtonClick);

  }

  removeEventListeners() {
    document.removeEventListener('click', this.onImgListPointerup);
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}