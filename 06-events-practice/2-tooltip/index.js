class Tooltip {
  static #instance = null;
  constructor() {
    if (!Tooltip.#instance) 
      Tooltip.#instance = this;
    else 
      return Tooltip.#instance;
  }

  initialize () {
    this.element = this.create_element(`<div class="tooltip"></div>`);
    this.element.style.position = 'absolute';

    this.p_move = this.p_move.bind(this);
    this.p_over = this.p_over.bind(this);
    this.p_out = this.p_out.bind(this);

    document.addEventListener('pointerover', this.p_over);
    document.addEventListener('pointerout', this.p_out);
  }

  p_over(event) {
    const src = event.target.closest('[data-tooltip]');
    if (src) {
      document.addEventListener('pointermove', this.p_move);
      this.element.style.left = event.pageX + 10 + 'px';
      this.element.style.top = event.pageY + 10 + 'px';
      this.render(src.dataset.tooltip);
    }
  }

  p_out(event) {
    const src = event.target.closest('[data-tooltip]');
    if (src) {
      document.removeEventListener('pointermove', this.p_move);
      this.element.remove();
      this.element.textContent = '';
    }
  }

  p_move(event) {
    this.element.style.left = event.pageX + 10 + 'px';
    this.element.style.top = event.pageY + 10 + 'px';
  }

  render(text = '') {
    this.element.textContent = text;
    document.body.appendChild(this.element);
  }

  create_element(html)
  {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    document.removeEventListener('pointerover', this.p_over);
    document.removeEventListener('pointerout', this.p_out);
    document.removeEventListener('pointermove', this.p_move);
    this.remove();
  }
}


export default Tooltip;
