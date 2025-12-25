/**
 * @typedef {Object} Column
 * @property {string} key - Unique identifier for the column
 * @property {string} label - Display label for the column header
 * @property {('left'|'center'|'right')} [align='left'] - Text alignment
 * @property {boolean} [sortable=false] - Whether column is sortable
 * @property {function} [render] - Custom render function for cell content
 */

/**
 * @typedef {Object} SortConfig
 * @property {string|null} field - Field being sorted
 * @property {('asc'|'desc')} direction - Sort direction
 */

/**
 * @typedef {Object} PaginationConfig
 * @property {number} page - Current page (1-based)
 * @property {number} limit - Items per page
 * @property {number} total - Total number of items
 */

/**
 * @typedef {Object} TableState
 * @property {('loading'|'empty'|'error'|'success')} status - Current table state
 * @property {Array} selectedRows - Array of selected row IDs
 * @property {SortConfig} sort - Current sort configuration
 * @property {PaginationConfig} pagination - Pagination state
 * @property {string} searchQuery - Current search query
 */

export const TABLE_STATES = {
  LOADING: 'loading',
  EMPTY: 'empty',
  ERROR: 'error',
  SUCCESS: 'success'
};

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc'
};