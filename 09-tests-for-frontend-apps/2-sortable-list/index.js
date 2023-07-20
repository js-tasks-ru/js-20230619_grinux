import LJSBase from '../../components/LJSBase.js'

export default class SortableList extends LJSBase {
  constructor ({ items = [] } = {}) {
    super();
    this.element = this.createElement('<ul class="sortable-list"></ul>');
    this.append(items);
    this.createEventListeners();
  }

  append(items) {
    this.element.append(...items.map(item => {
      item.classList.add('sortable-list__item');
      return item;
    }));
  }

  onItemPointerup() {
    if (this.movingItemElement)
      this.handleItemMoveEnd();
  }

  handleDeleteItem(event) {
    const itemToDelete = event.target.closest('li');

    this.element.dispatchEvent(new CustomEvent('item-delete', {
      detail: itemToDelete,
      bubbles: true,
      once: true
    }));

    itemToDelete.remove();
  }

  onItemPointerdown(event) {
    if ('deleteHandle' in event.target.dataset)
      this.handleDeleteItem(event);
    else if ('grabHandle' in event.target.dataset)
      this.handleStartMoveItem(event);
  }

  handleStartMoveItem(event) {
    event.target.ondragstart = () => false;

    const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const listFirstElementTop = this.element.firstElementChild.getBoundingClientRect().top + currentScroll;
    const listLastElementTop = this.element.lastElementChild.getBoundingClientRect().top + currentScroll;
    this.itemElementWidth = (listLastElementTop - listFirstElementTop) / (this.element.children.length - 1);

    this.itemChangePositionBorders = [...this.element.children].map((_, index) =>
      listFirstElementTop + this.itemElementWidth * index + this.itemElementWidth / 2);

    this.movingItemElement = event.target.closest('li');
    const movingItemPosition = this.movingItemElement.getBoundingClientRect();
    this.shiftY = event.clientY - movingItemPosition.top;
    this.shiftX = event.clientX - movingItemPosition.left;

    this.movingItemIndex = [...this.element.children].indexOf(this.movingItemElement);
    this.listPlaceholderElement = this.createElement(`
      <div class="sortable-list__placeholder" style="width: ${movingItemPosition.width}px; height: ${movingItemPosition.height}px;"></div>`);
    this.element.replaceChild(this.listPlaceholderElement, this.movingItemElement);
    this.element.appendChild(this.movingItemElement);

    this.movingItemElement.classList.add('sortable-list__item_dragging');
    this.movingItemElement.style.left = event.clientX - this.shiftX + 'px';
    this.movingItemElement.style.top = event.clientY - this.shiftY + 'px';
    this.movingItemElement.style.width = movingItemPosition.width + 'px';
    this.movingItemElement.style.height = movingItemPosition.height + 'px';

    document.addEventListener('pointermove', this.handleItemMove);
  }

  handleItemMove(event) {
    this.movingItemElement.style.top = event.clientY - this.shiftY + 'px';

    const newMovingItemPosition = 
      event.clientY - this.shiftY + document.documentElement.scrollTop || document.body.scrollTop;

    const newMovingItemIndex = this.getNewMovingItemIndex(this.movingItemIndex, newMovingItemPosition);
    if (newMovingItemIndex != this.movingItemIndex)
      this.setItemNewIndex(newMovingItemIndex);
  }
  
  getNewMovingItemIndex(oldIndex, newPosition) {
    let newIndex = oldIndex;

    for (; ;) {
      if (newIndex < this.itemChangePositionBorders.length - 1 &&
        newPosition >= this.itemChangePositionBorders[newIndex])
        newIndex++;
      else if (newIndex && newPosition <= this.itemChangePositionBorders[newIndex - 1])
        newIndex--;
      break;
    }
    return newIndex;
  }

  setItemNewIndex(newIndex) {
    this.element.children[newIndex]
      .insertAdjacentElement(newIndex > this.movingItemIndex ? 'afterend' : 'beforebegin',
        this.listPlaceholderElement);
    this.movingItemIndex = newIndex;
  }

  handleItemMoveEnd() {
    document.removeEventListener('pointermove', this.handleItemMove);

    this.element.lastElementChild.remove();
    this.element.replaceChild(this.movingItemElement, this.listPlaceholderElement);

    this.movingItemElement.classList.remove('sortable-list__item_dragging');
    this.movingItemElement.style.left = '';
    this.movingItemElement.style.top = '';
    this.movingItemElement.style.width = '';
    this.movingItemElement.style.height = '';
    this.movingItemElement = null;
  }

  createEventListeners() {
    this.onItemPointerup = this.onItemPointerup.bind(this);
    this.handleItemMove = this.handleItemMove.bind(this);
    this.onItemPointerdown = this.onItemPointerdown.bind(this);

    document.addEventListener('pointerup', this.onItemPointerup);
    this.element.addEventListener('pointerdown', this.onItemPointerdown);
  }

  removeEventListeners() {
    document.removeEventListener('pointerup', this.onItemPointerup);
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}
