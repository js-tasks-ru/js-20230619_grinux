import LJSBase from '../../components/LJSBase.js'

export default class RangePicker extends LJSBase {
  constructor(
    {
      to = new Date(),
      from = new Date(to.getFullYear(), to.getMonth() - 1, to.getDate())
    } = {}
  ) {
    super();
    this.from = from;
    this.to = to;
    
    this.element = this.createElement(this.createRangepicker());
    this.inputFromElement = this.element.querySelector('[data-element="from"]');
    this.inputToElement = this.element.querySelector('[data-element="to"]');
    this.selectorElement = this.element.querySelector('.rangepicker__selector');
    this.calendarElement = this.createElement(this.createCalendar());
    this.monthLeftElement = this.calendarElement.querySelector('.rangepicker__calendar');
    this.monthRightElement = this.monthLeftElement.nextElementSibling;
    this.controlLeftElement = this.calendarElement.querySelector('.rangepicker__selector-control-left');
    this.controlRightElement = this.calendarElement.querySelector('.rangepicker__selector-control-right');
    
    this.from.setHours(0, 0, 0, 0);
    this.to.setHours(0, 0, 0, 0);
    
    this.setCalendarSelectionRange();
    this.isRangeSelected = true;
    this.rightDisplayedMonth = new Date(this.to);
    
    this.createEventListeners();
  }

  createRangepicker() {
    return (`
    <div class="rangepicker">
      <div class="rangepicker__input" data-element="input">
        <span data-element="from"></span> -
        <span data-element="to"></span>
      </div>
      <div class="rangepicker__selector" data-element="selector"></div>
    </div>
  `);
  }

  createCalendar() {
    return (`
    <div>
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      <div class="rangepicker__calendar">
        ${this.createMonth(new Date(this.to.getFullYear(), this.to.getMonth() - 1, this.to.getDate()))}
      </div>
      <div class="rangepicker__calendar">
        ${this.createMonth(this.to)}
      </div>
    </div>
    `);
  }

  getDateString(date) {
    return (`
    ${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}
    `);
  }

  createMonth(date) {
    return (`
      <div class="rangepicker__month-indicator">
       <time datetime="${this.getMonthName(date.getMonth())}">${this.getMonthName(date.getMonth())}</time>
      </div>
      <div class="rangepicker__day-of-week">
        <div>Пн</div>
        <div>Вт</div>
        <div>Ср</div>
        <div>Чт</div>
        <div>Пт</div>
        <div>Сб</div>
        <div>Вс</div>
      </div>
      ${this.createDaysOfMonth(date)}
    `);
  }

  createDaysOfMonth(boundaryDate) {
    const monthDaysNum = new Date(boundaryDate.getFullYear(), boundaryDate.getMonth() + 1, 0).getDate();
    let date = new Date(boundaryDate.getFullYear(), boundaryDate.getMonth(), 1);
    const monthStartDayOfWeek = date.getDay();
    let daysList = [];

    for (let i = 0; i < monthDaysNum; i++) {
      let startDayOfWeek = i === 0 ? `style="--start-from: ${monthStartDayOfWeek}"` : '';

      daysList.push(`
        <button type="button" class="rangepicker__cell" data-value="${date.toISOString()}" 
        ${startDayOfWeek}>${i + 1}</button>
      `);

      date.setDate(date.getDate() + 1);
    }
    return (`
    <div class="rangepicker__date-grid">
      ${daysList.join('')}
    </div>  
    `);
  }

  clearCalendarSelectionRange() {
    this.controlCalendarSelection(false);
  }

  setCalendarSelectionRange() {
    this.controlCalendarSelection(true);
    this.setRangepickerSelectionRange();
  }

  setRangepickerSelectionRange() {
    this.inputFromElement.textContent = this.getDateString(this.from);
    this.inputToElement.textContent = this.getDateString(this.to);
  }

  controlCalendarSelection(isSet) {
    let daysElements = [...this.monthLeftElement.querySelector('.rangepicker__date-grid').children];
    this.controlDaysSelection(daysElements, isSet)
    daysElements = [...this.monthRightElement.querySelector('.rangepicker__date-grid').children];
    this.controlDaysSelection(daysElements, isSet); 
  }

  controlDaysSelection(daysElements, isSet) {
    daysElements.forEach(dayElement => {
      if (isSet)
      {
        const dayDate = new Date(dayElement.dataset.value);
        let dayClass = '';
        if (this.from.getTime() === dayDate.getTime())
          dayClass = 'rangepicker__selected-from';
        if (dayDate > this.from && dayDate < this.to)
          dayClass = 'rangepicker__selected-between';
        if (this.to.getTime() === dayDate.getTime())
          dayClass = 'rangepicker__selected-to';
        if (dayClass)
          dayElement.classList.add(dayClass);
      }
      else
      dayElement.classList.remove(
        'rangepicker__selected-from', 
        'rangepicker__selected-between', 
        'rangepicker__selected-to' );
    });
  }

  getMonthName(month) {
    return ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август',
      'сентябрь', 'октябрь', 'ноябрь', 'декабрь'][month];
  }

  onDocumentClick(event) {
    if (!event.target.closest('.rangepicker') && this.isCalendarOpened()) {
      this.closeCalendar();
    }
  }

  onRangePickerInputClick(event) {
    if (event.target.closest('div') &&
      event.target.closest('div').classList.contains('rangepicker__input')
      ) {
      if (this.isCalendarOpened())
        this.closeCalendar();
      else
        this.openCalendar();
    }
    else if (event.target.classList.contains('rangepicker__selector-control-right'))
      this.handleMonthsSelectorClick('right');
    else if (event.target.classList.contains('rangepicker__selector-control-left'))
      this.handleMonthsSelectorClick('left');
    else if (event.target.classList.contains('rangepicker__cell'))
      this.handleCalendarCellClick(event.target);
  }

  isCalendarOpened() {
    return this.element.classList.contains('rangepicker_open');
  }

  closeCalendar() {
    this.element.classList.remove('rangepicker_open');
  }

  openCalendar() {
    this.element.classList.add('rangepicker_open');
    if (!this.selectorElement.children.length)
      //Append nodes on first open. Required by tests
      this.selectorElement.append(...this.calendarElement.childNodes);
  }

  handleMonthsSelectorClick(selector) {
    this.rightDisplayedMonth
      .setMonth(this.rightDisplayedMonth.getMonth() + (selector === 'right' ? 1 : -1));
    this.monthRightElement.innerHTML = this.createMonth(this.rightDisplayedMonth);
    this.monthLeftElement.innerHTML =
      this.createMonth(new Date(this.rightDisplayedMonth.getFullYear(),
        this.rightDisplayedMonth.getMonth() - 1,
        this.rightDisplayedMonth.getDate()));
   this.setCalendarSelectionRange();    
  }

  handleCalendarCellClick(clickedCellElement) {
    const clickedCellDate = new Date(clickedCellElement.dataset.value);
    
    if (this.isRangeSelected === true) {
      this.isRangeSelected = false;
      this.from = clickedCellDate;
      this.clearCalendarSelectionRange();
      clickedCellElement.classList.add('rangepicker__selected-from');
    }
    else {
      this.isRangeSelected = true;
      if (clickedCellDate < this.from)
      {
        this.to = this.from;
        this.from = clickedCellDate;
      }
      else
        this.to = clickedCellDate;
      this.setCalendarSelectionRange();
    }
  }

  createEventListeners() {
    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.onRangePickerInputClick = this.onRangePickerInputClick.bind(this);

    document.addEventListener('click', this.onDocumentClick);
    this.element.addEventListener('click', this.onRangePickerInputClick);
  }

  removeEventListeners() {
   document.removeEventListener('click', this.onDocumentClick);
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}