


export const ADMIN_API_URL = '/admin-api/';
export const GET_CAMPAIN_PRODUCTS_URL = ADMIN_API_URL + 'get-campaign-products/';


export const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/ms-global/image/upload/';

var pathArray = import.meta.url.split( '/' );
var protocol = pathArray[0];
var host = pathArray[2];

var url = protocol + '//' + host;
export const BASE_URL =  url; //'https://catalog.boost-pop.com'; //'http://127.0.0.1:8000'; // 
export const SEARCH_API_URL = BASE_URL + '/search';
export const GET_PRODUCT_COST_PRICE_URL = BASE_URL + '/admin-api/get_product_cost_price/';