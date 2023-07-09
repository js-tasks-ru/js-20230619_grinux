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
    const mv = this.move.bind(this);
    document.addEventListener('pointerover', event => {
      const src = event.target.closest('[data-tooltip]');
      if (src)
      { 
        document.addEventListener('pointermove', mv);
        document.addEventListener('pointerout', event => {
          const src = event.target.closest('[data-tooltip]');
          if (src)
          { 
            document.removeEventListener('pointermove', mv);
            this.element.remove();
            this.element.textContent = ''; 
          }
        }, {once: true});
        
        this.element.style.left = event.pageX + 10 + 'px';
        this.element.style.top = event.pageY + 10 + 'px';
        this.render(src.dataset.tooltip);
      }
    });
  }

  move(event) {
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
    this.remove();
  }
}


export default Tooltip;
