export default class NotificationMessage {
  static #instance = null;

  constructor(title = '', {
    duration = 50,
    type = ''
  } = {}) {


    this.duration = Math.max(50, duration);
    this.title = title;
    this.type = type;

    this.build();
    this.set_opts();
  }

  build() {
    this.element = this.create_element(`
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

  set_opts() {
      this.element.style.setProperty('--value',this.duration / 1000 + 's');
      if (this.type)
      {
        this.element.classList.add(this.type);
        this.element.querySelector('.notification-header').textContent = this.type;
      }
  }

  create_element(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
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
    }, this.duration - 50); //если тут сделать меньшую поправку, то окно
  }                         //успевает моргнуть. Как правильно?
}
