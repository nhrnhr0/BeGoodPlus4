import {SEARCH_API_URL} from './../consts/consts.js';
import {getCookie} from './../utils/utils.js';
export function apiSearchProducts(keyword) {
    const url = SEARCH_API_URL + '?q=' + encodeURIComponent(keyword);
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