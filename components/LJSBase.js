export default class LJSBase {
  constructor() {
  }
  
  createElement(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    let subElements = {};
    [...elements].forEach(subElement => {
      subElements[subElement.dataset.element] = subElement;
    });
    return subElements;
  }

  remove() {
    this.element.remove();
  }
}