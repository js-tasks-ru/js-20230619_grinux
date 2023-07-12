export default class DoubleSlider {
  constructor({
    min = 0,
    max = 100,
    formatValue,
    selected: {
      from = min,
      to = max
    } = {}
  } = {}) {
    
    this.min = min;
    this.max = max;
    this.fmt = formatValue;
    this.from = from;
    this.to = to;
    this.build();
    this.bind_events();

    
  }
  
  bind_events() {
    this.element.addEventListener('pointerdown', event => {
      if (event.target === this.left || event.target === this.right)
        this.p_down(event);
    });

    this.p_move = this.p_move.bind(this);
    this.p_up = this.p_up.bind(this);
  }

  build() {
    let left = (this.from - this.min) * 100 / (this.max - this.min);
    let right = (this.max - this.to) * 100 / (this.max - this.min);
    this.element = this.create_element(`
      <div class="range-slider">
        <span data-element="from">${this.get_value(this.from)}</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress" style="left: ${left}%; right: ${right}%"></span>
          <span class="range-slider__thumb-left" style="left: ${left}%"></span>
          <span class="range-slider__thumb-right" style="right: ${right}%"></span>
        </div>
        <span data-element="to">${this.get_value(this.to)}</span>
      </div>
    `);
    this.from_element = this.element.querySelector("[data-element='from']");
    this.to_element = this.element.querySelector("[data-element='to']");
    this.progress = this.element.querySelector('.range-slider__progress');
    this.inner  = this.element.querySelector('.range-slider__inner');
    this.left = this.element.querySelector('.range-slider__thumb-left');
    this.right = this.element.querySelector('.range-slider__thumb-right');

    this.left.ondragstart = () => false;
    this.right.ondragstart = () => false;
  }

  p_down(event) {
    event.preventDefault();
    this.active = event.target;
    const active_position = this.active.getBoundingClientRect();
    if (this.active === this.left) {
      this.left_limit = this.inner.getBoundingClientRect().left;
      this.right_limit = this.right.getBoundingClientRect().left;
    }
    else {
      this.right_limit = this.inner.getBoundingClientRect().right;
      this.left_limit = this.left.getBoundingClientRect().right;
    }
    this.shiftX = event.clientX - (active_position.left + active_position.width / 2);
    //-- Values for poor implemented tests------------------------------------
    //-- Any call of getBoundingClientRect() in test environment returns 
    //-- width: 1000, height: 0, top: 0, left: 0, bottom: 0, right: 0
    //-- So we takes this into account and setup corrected limits
    if (typeof jest !== 'undefined') //check we're in jest env
    {
      if (this.active === this.left)
      {
        this.left_limit = this.inner.getBoundingClientRect().left;
        this.right_limit = (this.left_limit + this.inner.getBoundingClientRect().width) * 
                            parseFloat(this.right.style.right) / 100;
      } 
      else {
        this.right_limit = this.left_limit + this.inner.getBoundingClientRect().width;
        this.left_limit = this.inner.getBoundingClientRect().left + 
          this.inner.getBoundingClientRect().width * parseFloat(this.left.style.left) / 100;
      }
      this.shiftX = 0;
    }
    //--------------------------------------------------------------------------
    document.addEventListener('pointermove', this.p_move);

    document.addEventListener('pointerup', this.p_up, { once: true });
  }

  p_up() {
    this.active = null;
    document.removeEventListener('pointermove', this.p_move);
    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: { from: this.from, to: this.to },
      bubbles: true
    }));
  }

  p_move(event) {
    event.preventDefault();
    let new_x = event.clientX - this.shiftX;
    new_x = new_x < this.left_limit ? this.left_limit : new_x;
    new_x = new_x > this.right_limit ? this.right_limit : new_x;
    if (this.active === this.left) {
      let fill = (new_x - this.left_limit) / (this.right_limit - this.left_limit) * (100 - parseFloat(this.right.style.right));
      this.left.style.left = this.progress.style.left = `${fill}%`;
      this.from = Math.round(this.min + (this.max - this.min) * fill / 100)
      this.from_element.textContent = this.get_value(this.from);
    }
    else {
      let fill = (this.right_limit - new_x) / (this.right_limit - this.left_limit) * (100 - parseFloat(this.left.style.left));
      this.right.style.right = this.progress.style.right = `${fill}%`;
      this.to = Math.round(this.max - (this.max - this.min) * fill / 100);
      this.to_element.textContent = this.get_value(this.to);
    }
  }

  get_value(value) {
    return this.fmt ? this.fmt(value) : value; 
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
    document.removeEventListener('pointermove', this.p_move);
    document.removeEventListener('pointerup', this.p_up);
    this.remove();
  }
}
