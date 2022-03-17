


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
export const GET_PRODUCT_COST_PRICE_URL = BASE_URL + '/admin-api/get_product_cost_price/';
export const ADMIN_ADD_TO_EXISTINT_CART_URL = BASE_URL + '/admin-api/add-to-existing-cart/';
export const ADMIN_RMEOVE_FROM_EXISTING_CART_URL = BASE_URL + '/admin-api/remove-from-existing-cart/';
export const ADMIN_GET_PRODUCT_SIZES_COLORS_MARTIX = BASE_URL + '/admin-api/get-product-sizes-colors-martix';
export const GET_ALL_SIZES_API = BASE_URL + '/client-api/get-all-sizes/';
export const GET_ALL_COLORS_API = BASE_URL + '/client-api/get-all-colors/';
export const INV_API_GET_ENTER_DOC_DATA_URL = BASE_URL + '/inv/enter-doc/';
