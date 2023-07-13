import LJSBase from '../../components/LJSBase.js';

export default class Tooltip extends LJSBase {
  static #instance = null;
  
  constructor() {
    super();
    if (!Tooltip.#instance) 
      Tooltip.#instance = this;
    else 
      return Tooltip.#instance; 
  }

  initialize () {
    this.create();

    this.createEventListeners();
  }

  create() {
    this.element = this.createElement(`<div class="tooltip"></div>`);
    this.element.style.position = 'absolute';
  }

  createEventListeners() {
    this.onDocumentPointerMove = this.onDocumentPointerMove.bind(this);
    this.onDocumentPointerOver = this.onDocumentPointerOver.bind(this);
    this.onDocumentPointerOut = this.onDocumentPointerOut.bind(this);

    document.addEventListener('pointerover', this.onDocumentPointerOver);
    document.addEventListener('pointerout', this.onDocumentPointerOut);
  }

  onDocumentPointerOver(event) {
    const src = event.target.closest('[data-tooltip]');
    if (src) {
      document.addEventListener('pointermove', this.onDocumentPointerMove);
      this.element.style.left = event.pageX + 10 + 'px';
      this.element.style.top = event.pageY + 10 + 'px';
      this.render(src.dataset.tooltip);
    }
  }

  onDocumentPointerOut(event) {
    const src = event.target.closest('[data-tooltip]');
    if (src) {
      document.removeEventListener('pointermove', this.onDocumentPointerMove);
      this.element.remove();
      this.element.textContent = '';
    }
  }

  onDocumentPointerMove(event) {
    this.element.style.left = event.pageX + 10 + 'px';
    this.element.style.top = event.pageY + 10 + 'px';
  }

  render(text = '') {
    this.element.textContent = text;
    document.body.appendChild(this.element);
  }

  destroy() {
    this.destroyEventListeners();
    this.remove();
  }

  destroyEventListeners() {
    document.removeEventListener('pointerover', this.onDocumentPointerOver);
    document.removeEventListener('pointerout', this.onDocumentPointerOut);
    document.removeEventListener('pointermove', this.onDocumentPointerMove);
  }
}
