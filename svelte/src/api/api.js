import {SEARCH_API_URL,MORDER_EDIT_API,GET_ALL_SIZES_API, GET_DOC_STOCK_ENTER_PPN_ENTRIES, SEARCH_PROVIDERS_API_URL,INV_API_GET_ENTER_DOC_DATA_URL, SEARCH_PPN_API_URL, GET_ALL_COLORS_API, GET_ALL_VARIENTS_API, DELETE_DOC_STOCK_EnterEntery as DELETE_DOC_STOCK_ENTER_ENTRY, ADD_DOC_STOCK_ENTER_ENTRY_API_URL} from './../consts/consts.js';
import {getCookie} from './../utils/utils.js';

export async function apiGetMOrder(order_id) {
    const response = await fetch_wraper(`${MORDER_EDIT_API}/${order_id}`, {});
    return response;
}


export async function apiUpdateMOrderProductRow(data) {
    //const response = await fetch_wraper('')
    // TODO: update morder product row
}

export async function apiAddDocStockEnterEntery(data) {
    const response = await fetch_wraper(ADD_DOC_STOCK_ENTER_ENTRY_API_URL, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response;
}
export async function apiDeleteDocStockEnterPPnEntry(docId, ppnId, entryId) {
    const response = await fetch_wraper(DELETE_DOC_STOCK_ENTER_ENTRY, {
        method: 'POST',
        body: JSON.stringify({
            docId: docId,
            ppnId: ppnId,
            entryId: entryId
        })
    });
    return response;
}
export async function apiGetDocStockEnterPPnEntries(doc_id, ppnId){
    const response = await fetch(GET_DOC_STOCK_ENTER_PPN_ENTRIES + '?docId=' + encodeURIComponent(doc_id) + '&ppnId=' + encodeURIComponent(ppnId) , {
        method: 'GET',
    });
    return await response.json();
}
export async function apiGetAllSizes() {
    return await fetch_wraper(GET_ALL_SIZES_API);
}

export async function apiGetAllColors() {
    return await fetch_wraper(GET_ALL_COLORS_API);
}

export async function apiGetAllVariants() {
    return await fetch_wraper(GET_ALL_VARIENTS_API);
}

export function apiLoadEnterDocData(docId) {
    return fetch_wraper(`${INV_API_GET_ENTER_DOC_DATA_URL}${docId}`);
}

export function apiSearchProducts(keyword) {
    const url = SEARCH_API_URL + '?q=' + encodeURIComponent(keyword);
    return fetch_wraper(url);
}
export function apiSearchProviders(keyword) {
    const url = SEARCH_PROVIDERS_API_URL + '?q=' + encodeURIComponent(keyword);
    return fetch_wraper(url);
}
export function apiSearchPPN(keyword, provider) {
    const url = SEARCH_PPN_API_URL + '?q=' + encodeURIComponent(keyword) + '&provider=' + encodeURIComponent(provider);
    return fetch_wraper(url);
}
export function fetch_wraper(url, requestOptions, custom_fetch, isRetry = false) {
    console.log('fetch_wraper: ', url);
    let headers_json= {
        'Content-Type': 'application/json',
        'Content-Type': 'application/json; charset=UTF-8',
        'X-CSRFToken': getCookie('csrftoken'),
    }
    var myHeaders = new Headers(headers_json);
    var requestOptions = Object.assign({}, {
            method: "GET",
            mode:'cors',
            credentials: 'include',//'',
            headers: myHeaders,
            redirect: 'follow'
        },requestOptions);
    
    let response;
    try {
        if(custom_fetch) {
            response = custom_fetch(url, requestOptions);
        }
        else {
            response = fetch(url, requestOptions);
        }
    }
    catch (error) {
        console.error(error);
      }
    return response.then((data)=>{
        if(data.status == 401) {
            let userInfo = get(userInfoStore);
            userInfo.isLogin = false;
            userInfo.access = null;
            userInfoStore.set(userInfo);
            if(!isRetry) {
                return fetch_wraper(url, requestOptions, custom_fetch, true);
            }
        }
        console.log(url, ' ==> ', data.status);
        return data.json()
    }).then((info)=> {
        return info;
    });
}