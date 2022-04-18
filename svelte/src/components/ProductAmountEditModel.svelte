<script>
import { onMount } from 'svelte';

    import {fly} from 'svelte/transition';
import { apiGetAllColors, apiGetAllSizes, apiGetAllVariants } from '../api/api';
    export let rowData;
    export let isModalOpen;
    let modal_zIndex = 666;
    let all_colors = undefined;
    let all_sizes = undefined;
    let all_varients = undefined;
    onMount(async () => {
        // get all colors: /client-api/get-all-colors/
        all_colors = await apiGetAllColors();
        // get all sizes: /client-api/get-all-sizes/
        all_sizes = await apiGetAllSizes();
        // get all products: /client-api/get-all-variants/
        all_varients = await apiGetAllVariants();
    });

    export function closeModal(e) {
        console.log('closeModal', e);  
        isModalOpen = false;
    }
    export function openModal(_product_id, _product_title) {
        modal_zIndex = 1200 + (+979797979 * 15);
        isModalOpen = true;
    }

    export function show(data) {
        console.log('show', data);
        rowData = data;
        isModalOpen = true;
    }
    function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
    export function submit_form(e) {
        e.preventDefault();
        console.log('submit_form', e);
        let form = e.target;
        let formData = new FormData(form);
        let data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        console.log('submit_form', data);
        // morders/edit-order-add-product-entries
        let url = '/morders/edit-order-add-product-entries';
        let method = 'POST';
        let body = data;
        debugger;
        const csrftoken = getCookie('csrftoken');
        let headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        };
        let options = {
            method: method,
            headers: headers,
            body: JSON.stringify(body),
        };
        fetch(url, options)
            .then(response => response.json())
            .then(data => {
                console.log('submit_form', data);
                if (data.status === 'ok') {
                    form.reset();
                }
            })
            .catch(error => {
                console.log('submit_form', error);
            });
        
        
        form.reset();
    }
</script>
<div id="singleAmountModal" style="z-index: {modal_zIndex};" class="modal" class:active={isModalOpen}>
    <div class="overlay" style="z-index: {modal_zIndex+5};" on:click={closeModal}>
        {#if isModalOpen}
        <div class="modal_content" in:fly="{{ y: 200, duration: 200 }}" on:click|stopPropagation="{()=>{}}" style="z-index: {modal_zIndex+10};">
            <div class="modal-header">
                <button title="Close" on:click={closeModal} class="close-btn right">x</button>
                <div class="modal-title">ערוך משתנים ל {rowData['title']}</div>
                <button title="Close" on:click={closeModal} class="close-btn left">x</button>
                
            </div>
            <div class="modal-body">
                <form method="post" on:submit="{submit_form}">
                  <input type="hidden" name="product_id" value={rowData['product']} />
                  <input type="hidden" name="entry_id" value={rowData['entry_id']} />
                  {#each [1,2,3,4,5] as item, index}
                    <div class="form-group">
                      <label for="color">צבע</label>
                        <select class="form-control" name="color_{index}" id="color-{index}" >
                            <option default value=undefined>בחר צבע</option>
                            {#each all_colors as color}
                              <option value={color['id']}>{color['name']}</option>
                            {/each}
                        </select>

                      <label for="size">מידה</label>
                        <select class="form-control" name="size_{index}" id="size-{index}" >
                            <option default value=undefined>בחר מידה</option>
                            {#each all_sizes as size}
                              <option value={size['id']}>{size['size']}</option>
                            {/each}
                        </select>

                      <label for="varient">מודל</label>
                        <select class="form-control" name="varient_{index}" id="varient-{index}" >
                            <option default value=undefined>בחר מודל</option>
                            {#each all_varients as varient}
                              <option value={varient['id']}>{varient['name']}</option>
                            {/each}
                        </select>
                      
                      <label for="amount">כמות</label>
                        <input class="form-control" type="number" name="amount_{index}" id="amount-{index}" />
                      
                      </div>
                  {/each}
                  <button type="submit" class="btn btn-primary">שמור</button>
                </form>
            </div>
        </div>
        {/if}
        </div>
    </div>


    <style lang="scss">
        @mixin bg-gradient {
    background-color: #edce6a;
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxIDEiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxsaW5lYXJHcmFkaWVudCBpZD0idnNnZyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIxMDAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjAlIj48c3RvcCBzdG9wLWNvbG9yPSIjZjlmMjk1IiBzdG9wLW9wYWNpdHk9IjEiIG9mZnNldD0iMCIvPjxzdG9wIHN0b3AtY29sb3I9IiNlMGFhM2UiIHN0b3Atb3BhY2l0eT0iMSIgb2Zmc2V0PSIwLjI1Ii8+PHN0b3Agc3RvcC1jb2xvcj0iI2Y5ZjI5NSIgc3RvcC1vcGFjaXR5PSIxIiBvZmZzZXQ9IjAuNSIvPjxzdG9wIHN0b3AtY29sb3I9IiNlMGFhM2UiIHN0b3Atb3BhY2l0eT0iMSIgb2Zmc2V0PSIwLjc1Ii8+PHN0b3Agc3RvcC1jb2xvcj0iI2Y5ZjI5NSIgc3RvcC1vcGFjaXR5PSIxIiBvZmZzZXQ9IjEiLz48L2xpbmVhckdyYWRpZW50PjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjdnNnZykiIC8+PC9zdmc+);
    background-image: -webkit-gradient(linear, 100% 0%, 0% 0%, color-stop(0, rgb(249, 242, 149)), color-stop(0.25, rgb(224, 170, 62)), color-stop(0.5, rgb(249, 242, 149)), color-stop(0.75, rgb(224, 170, 62)), color-stop(1, rgb(249, 242, 149)));
    /* Android 2.3 */
    background-image: -webkit-repeating-linear-gradient(right, rgb(249, 242, 149) 0%, rgb(224, 170, 62) 25%, rgb(249, 242, 149) 50%, rgb(224, 170, 62) 75%, rgb(249, 242, 149) 100%);
    /* IE10+ */
    background-image: repeating-linear-gradient(to left, rgb(249, 242, 149) 0%, rgb(224, 170, 62) 25%, rgb(249, 242, 149) 50%, rgb(224, 170, 62) 75%, rgb(249, 242, 149) 100%);
    background-image: -ms-repeating-linear-gradient(right, rgb(249, 242, 149) 0%, rgb(224, 170, 62) 25%, rgb(249, 242, 149) 50%, rgb(224, 170, 62) 75%, rgb(249, 242, 149) 100%);
}
.modal {
  display: none;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 990;
  &.active {
    display:block;
  }
}

.modal .overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 995;
  background: rgba(0,0,0,0.45);
}

.modal .modal_content {
  overscroll-behavior: contain;
  

  z-index: 999;
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: 80%;
  overflow: auto;
  background: #fff;
  box-shadow: 0 1px 5px rgba(0,0,0,0.7);
  border-radius: 4px;
  width: 85%;
  text-align: center;
  .modal-header {
    @include bg-gradient();
    //background: #ffd880;
    padding-top: 0px;
    padding-bottom: 0px;
    display: flex;
    justify-content: space-between;
    .header-logo {
      height: 35px;
      margin: auto;
    }

    .modal-title {
      font-weight: 700;
      font-size: 2.5em;

    }
  }
  .modal-body {
    min-height: 150px;
    background: url('https://res.cloudinary.com/ms-global/image/upload/w_auto,f_auto/v1634461664/msAssets/wall_bg_az5xzl');
    background: linear-gradient(rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15)), url('https://res.cloudinary.com/ms-global/image/upload/w_auto,f_auto/v1634461664/msAssets/wall_bg_az5xzl');
    background-position: center;
    //background: linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) ),url('../imgs/catalogBg1.jpeg');
    overflow: hidden;
    text-align: right;
  }



  .modal-fotter {
    @include bg-gradient();
    //max-height: 10%;
    display: flex;
    flex-direction: row;

    .header-logo {
      height: 35px;
    }

    .modal-title {
      font-weight: 700;
      font-size: 2.5em;
    }
  }
}
    </style>