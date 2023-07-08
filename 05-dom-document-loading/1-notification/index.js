export default class NotificationMessage {
  constructor(title, opt = {}) {
    this.build(title);
    this.set_opt(opt);
  }

  build(title) {
    this.element = this.create_element(`
    <div class="notification" style="--value:20s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header"></div>
        <div class="notification-body"></div>
      </div>
    </div>
  `);
    this.element.querySelector('.notification-body').innerText = title;
    this.element.insertAdjacentText('afterbegin', title);
  }

  set_opt(opt) {
    if (opt.duration) {
      this.element.style.setProperty('--value', opt.duration / 1000 + 's');
      this.duration = opt.duration;
    }
    if (opt.type) {
      this.element.classList.add(opt.type);
      this.element.querySelector('.notification-header').innerText = opt.type;
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

  show(node) {
    document.body.dispatchEvent(new CustomEvent('new-msg', {
      bubbles: true
    }));

    if (node)
      node.appendChild(this.element);
    else {
      document.body.appendChild(this.element);
    }

    document.body.addEventListener('new-msg', () => {
      this.remove();
    });

    setTimeout(() => {
      this.remove();
    }, this.duration - 50); //если тут сделать меньшую поправку, то окно
  }                         //успевает моргнуть. Как правильно?
}
