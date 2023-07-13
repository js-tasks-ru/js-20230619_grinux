import LJSBase from '../../components/LJSBase.js';

export default class NotificationMessage extends LJSBase {
  static #instance = null;

  defaultDuration = 50;

  constructor(title = '', {
    duration,
    type = ''
  } = {}) {

    super();
    this.duration = Math.max(50, duration);
    this.title = title;
    this.type = type;

    this.render();
  }

  render() {
    this.element = this.createElement(this.getTemplate());
    this.element.style.setProperty('--value', this.duration / 1000 + 's');
    if (this.type) {
      this.element.classList.add(this.type);
      this.element.querySelector('.notification-header').textContent = this.type;
    }
  }

  getTemplate() {
    return (`
      <div class="notification" style="--value:20s">
        ${this.title}
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header"></div>
          <div class="notification-body">${this.title}</div>
        </div>
      </div>
  `);
  }

  show(node = document.body) {

    if (NotificationMessage.#instance)
      NotificationMessage.#instance.remove();
    NotificationMessage.#instance = this;

    document.body.dispatchEvent(new CustomEvent('new-msg', {
      bubbles: true
    }));

    node.appendChild(this.element);

    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  destroy() {
    this.remove();
  }
}
