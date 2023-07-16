import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import LJSBase from '../../components/LJSBase.js'

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const API_URL = 'api/rest'

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
    this.categories = await fetchJson(this.getCategoriesUrl());

    if (this.productId) {
      this.product = (await fetchJson(this.getProductUrl(this.productId)))[0];
    }

    this.element = this.createElement(this.createProductForm());

    this.formElement = this.element.querySelector('[data-element="productForm"]');
    this.btnUploadImgElement = this.element.querySelector('[name="uploadImage"]');
    this.imgListElement = this.element.querySelector('.sortable-list');
    
    this.subElements = { //for tests
      productForm: this.element.firstElementChild,
      imageListContainer: this.imgListElement
    }

    this.createEventLiateners();
    return this.element;
  }

  getProductUrl(id) {
    return (`${BACKEND_URL}/${API_URL}/products?id=${id}`);
  }

  getCategoriesUrl() {
    return (`${BACKEND_URL}/${API_URL}/categories?_sort=weight&_refs=subcategory`);
  }

  createProductForm() {
    return (`
    <div class="product-form">
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
            <ul class="sortable-list">
              ${this.product.images ? this.createImgList(this.product.images) : ''}
            </ul>
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
            <input value="${this.product ? this.product.price : ''}" required="" type="number" id="price" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input value="${this.product ? this.product.discount : ''}"required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input value="${this.product ? this.product.quantity : ''}"required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" id="status" name="status">
            <option ${this.product ? this.product.status === 1 ? `selected` : '' : ''} value="1">Активен</option>
            <option ${this.product ? this.product.status === 0 ? `selected` : '' : ''} value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>
  `);
  }

  createImgList(images) {
    return images.map(image => `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
          <span>${image.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>`
      )
      .join('');
  }

  createCategoriesList(categories) {
    return categories
      .map(category => category.subcategories
          .map(sub => `<option value="${sub.id}">${category.title} &gt ${sub.title}</option>`)
          .join(''))
      .join('');
  }

  appendImgList(images) {
    this.imgListElement.insertAdjacentHTML
      ('beforeEnd',
        this.createImgList(images));
  }

  async onFormSubmit(event) {
    event.preventDefault();
    let editedProduct = {};
    Object.entries(this.product).map(entry => {
      const fieldName = this.formElement.querySelector(`[name="${entry[0]}"]`);
      if (fieldName) {
        editedProduct[entry[0]] = this.numericFieldsNames.includes(entry[0]) ? 
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
      bubbles: true
    }));
  }

  async create(product) {
    await this.uploadProduct(product, true);
    this.element.dispatchEvent(new CustomEvent('product-saved', {
      bubbles: true
    }));
  }

  async uploadProduct(product, isNew) {
    return await fetchJson(`${BACKEND_URL}/${API_URL}/products`, {
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

  onDeleteImgClick(event) {
    let deleteBtn = event.target.closest('button');
    if (deleteBtn) {
      const imgToDelete = deleteBtn.parentElement;
      const imgSourceName = imgToDelete.querySelector('[name="source"]').value;
      this.product.images.
        splice(this.product.images.findIndex(image => image.source === imgSourceName), 1);
      imgToDelete.remove();
    }
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
  
  createEventLiateners() {
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onUploadImgButtonClick = this.onUploadImgButtonClick.bind(this);
    this.onDeleteImgClick = this.onDeleteImgClick.bind(this);

    this.imgListElement.addEventListener('pointerup', this.onDeleteImgClick);
    this.formElement.addEventListener('submit', this.onFormSubmit);
    this.btnUploadImgElement.addEventListener('pointerup', this.onUploadImgButtonClick);

  }

  removeEventListeners() {

    this.imgListElement.removeEventListener('pointerup', this.onDeleteImgClick);
    this.formElement.removeEventListener('submit', this.onFormSubmit);
    this.btnUploadImgElement.removeEventListener('pointerup', this.onUploadImgButtonClick);  
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}