import escapeHtml from '../../09-tests-for-frontend-apps/1-product-form-v2/utils/escape-html.js'

const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0]?.url}">
          </div>
        `;
    }
  },
  {
    id: 'title',
    title: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'subcategory',
    title: 'Category',
    sortable: false,
    template: subcategory => `
    <div class="sortable-table__cell">  
      <span data-tooltip="${escapeHtml(`
        <div class="sortable-table-tooltip">
          <span class="sortable-table-tooltip__category">${subcategory.category.title}</span> /
          <b class="sortable-table-tooltip__subcategory">${subcategory.title}</b>
        </div>`)}">${subcategory.title}</span>
    </div>
    `
  },
  {
    id: 'quantity',
    title: 'Quantity',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Price',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'status',
    title: 'Status',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
    }
  },
];

export default header;
