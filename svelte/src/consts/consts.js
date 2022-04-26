


export const ADMIN_API_URL = '/admin-api/';
export const GET_CAMPAIN_PRODUCTS_URL = ADMIN_API_URL + 'get-campaign-products/';


export const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/ms-global/image/upload/';

var pathArray = import.meta.url.split( '/' );
var protocol = pathArray[0];
var host = pathArray[2];

var url = protocol + '//' + host;
export const BASE_URL =  url; //'https://catalog.boost-pop.com'; //'http://127.0.0.1:8000'; // 
export const SEARCH_API_URL = BASE_URL + '/search';
export const SEARCH_PROVIDERS_API_URL = BASE_URL + '/search-providers';
export const SEARCH_PPN_API_URL = BASE_URL + '/search-ppn';
export const GET_PRODUCT_COST_PRICE_URL = BASE_URL + '/admin-api/get_product_cost_price/';
export const ADMIN_ADD_TO_EXISTINT_CART_URL = BASE_URL + '/admin-api/add-to-existing-cart/';
export const ADMIN_RMEOVE_FROM_EXISTING_CART_URL = BASE_URL + '/admin-api/remove-from-existing-cart/';
export const ADMIN_GET_PRODUCT_SIZES_COLORS_MARTIX = BASE_URL + '/admin-api/get-product-sizes-colors-martix';
export const GET_ALL_SIZES_API = BASE_URL + '/client-api/get-all-sizes/';
export const GET_ALL_COLORS_API = BASE_URL + '/client-api/get-all-colors/';
export const GET_ALL_VARIENTS_API = BASE_URL + '/client-api/get-all-variants/';
export const INV_API_GET_ENTER_DOC_DATA_URL = BASE_URL + '/inv/enter-doc/';
export const GET_DOC_STOCK_ENTER_PPN_ENTRIES = BASE_URL + '/inv/enter-doc/get-doc-stock-enter-ppn-entries';
export const DELETE_DOC_STOCK_EnterEntery = BASE_URL + '/inv/enter-doc/delete-doc-stock-enter-ppn-entry';
export const ADD_DOC_STOCK_ENTER_ENTRY_API_URL = BASE_URL + '/inv/enter-doc/add-doc-stock-enter-ppn-entry';
export const INV_API_GET_PRODUCT_INVENTORY = BASE_URL + '/inv/get-product-inventory/';
export const MORDER_GET_API = BASE_URL + '/morders/api-get-order-data';
export const MORDER_EDIT_API = BASE_URL + '/morders/api-edit-order';
export const GET_ALL_PROVIDERS_API_URL =  BASE_URL + '/svelte/api/providers/';
export const MORDER_DELETE_PRODUCT = BASE_URL + '/morders/delete-product';
