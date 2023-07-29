import LJSBase from '../../components/LJSBase.js';

export default class DoubleSlider extends LJSBase{
  constructor({
    min = 0,
    max = 100,
    formatValue,
    selected: {
      from = min,
      to = max
    } = {}
  } = {}) {
    super();
    this.min = min;
    this.max = max;
    this.fmt = formatValue;
    this.from = from;
    this.to = to;
    this.render();
    this.createEventListeners(); 
  }

  render() {
    let left = (this.from - this.min) * 100 / (this.max - this.min);
    let right = (this.max - this.to) * 100 / (this.max - this.min);
    this.element = this.createElement(`
      <div class="range-slider">
        <span data-element="from">${this.getValue(this.from)}</span>
        <div class="range-slider__inner">
          <span class="range-slider__progress" style="left: ${left}%; right: ${right}%"></span>
          <span class="range-slider__thumb-left" style="left: ${left}%"></span>
          <span class="range-slider__thumb-right" style="right: ${right}%"></span>
        </div>
        <span data-element="to">${this.getValue(this.to)}</span>
      </div>
    `);
    this.fromElement = this.element.querySelector("[data-element='from']");
    this.toElement = this.element.querySelector("[data-element='to']");
    this.progressElement = this.element.querySelector('.range-slider__progress');
    this.innerElement  = this.element.querySelector('.range-slider__inner');
    this.leftThumbElement = this.element.querySelector('.range-slider__thumb-left');
    this.rightThumbElement = this.element.querySelector('.range-slider__thumb-right');
  }

  onThumbPointerDown(event) {
    event.preventDefault();
    
    this.active = event.target;

    this.sliderPosition = this.innerElement.getBoundingClientRect();

    document.addEventListener('pointermove', this.handleThumbMove);

    document.addEventListener('pointerup', this.onThumbPointerup, { once: true });
  }

  onThumbPointerup() {
    this.active = null;
    document.removeEventListener('pointermove', this.handleThumbMove);
    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: { from: this.from, to: this.to },
      bubbles: true
    }));
  }

  setLeftThumbPosition(positionPercent) {
    positionPercent = Math.min(positionPercent, 100 - parseFloat(this.rightThumbElement.style.right));
    this.leftThumbElement.style.left = positionPercent + '%';
    this.progressElement.style.left = positionPercent + '%';
    this.from = Math.round(this.min + (this.max - this.min) * positionPercent / 100);
    this.fromElement.textContent = this.getValue(this.from);
  }

  setRightThumbPosition(positionPercent) {
    positionPercent = 100 - positionPercent; //right thumb is mirrored
    positionPercent = Math.min(positionPercent, 100 - parseFloat(this.leftThumbElement.style.left));
    this.rightThumbElement.style.right = positionPercent + '%';
    this.progressElement.style.right = positionPercent + '%';
    this.to = Math.round(this.max - (this.max - this.min) * positionPercent / 100);
    this.toElement.textContent = this.getValue(this.to);
  }

  reset() {
    this.setRightThumbPosition(100);
    this.setLeftThumbPosition(0);
  }

  handleThumbMove(event) {
    event.preventDefault();

    let newThumbPositionPercent = (event.clientX - this.sliderPosition.left) / this.sliderPosition.width * 100;
    newThumbPositionPercent = Math.min(Math.max(0, newThumbPositionPercent), 100);

    if (this.active === this.leftThumbElement)
      this.setLeftThumbPosition(newThumbPositionPercent);
    else
      this.setRightThumbPosition(newThumbPositionPercent);
  }

  getValue(value) {
    return this.fmt ? this.fmt(value) : value; 
  }

  createEventListeners() {

    this.leftThumbElement.ondragstart = () => false;
    this.rightThumbElement.ondragstart = () => false;

    this.element.addEventListener('pointerdown', event => {
      if (event.target === this.leftThumbElement || event.target === this.rightThumbElement)
        this.onThumbPointerDown(event);
    });

    this.handleThumbMove = this.handleThumbMove.bind(this);
    this.onThumbPointerup = this.onThumbPointerup.bind(this);
  }
  
  destroyEventListeners() {
    document.removeEventListener('pointermove', this.handleThumbMove);
    document.removeEventListener('pointerup', this.onThumbPointerup);
  }

  destroy()
  {
    this.destroyEventListeners();
    this.remove();
  }
}
