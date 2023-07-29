export default class LJSBase {
  constructor() {
  }
  
  createElement(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
  }

  getSubElements(element) {
    let subElements = {};
    element.querySelectorAll('[data-element]').forEach(subElement => {
      subElements[subElement.dataset.element] = subElement;
    });
    return subElements;
  }

  remove() {
    this.element.remove();
  }
}